#!/usr/bin/env node
/**
 * Safe NPX Wrapper
 * Restricts npx to packages in the allowlist or that pass auto-validation.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const REAL_NPX = '/usr/local/bin/npx';
const CONFIG_DIR = path.resolve('/workspaces/design-studio/config');
const BASE_LIST = path.join(CONFIG_DIR, 'allowed-packages-base.json');
const EXTENDED_LIST = path.join(CONFIG_DIR, 'allowed-packages-extended.json');
const SECURITY_CONFIG = path.join(CONFIG_DIR, 'security-config.json');

const MIN_PACKAGE_AGE_DAYS = 365;
const MIN_WEEKLY_DOWNLOADS = 20000;

const args = process.argv.slice(2);

function logError(msg) {
  console.error(`\n❌  SECURITY ERROR: ${msg}\n`);
}

function logInfo(msg) {
  console.log(`ℹ️  ${msg}`);
}

function loadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return {};
  }
}

function parsePackageName(arg) {
  const match = arg.match(/^(@[^/]+\/[^@]+|[^@]+)(?:@(.+))?$/);
  if (!match) return null;
  return match[1];
}

function queryNpmRegistry(pkgName) {
  return new Promise((resolve, reject) => {
    const encoded = pkgName.replace('/', '%2F');
    const url = `https://registry.npmjs.org/${encoded}`;
    https.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid registry response'));
        }
      });
    }).on('error', reject).on('timeout', () => reject(new Error('Registry timeout')));
  });
}

async function getWeeklyDownloads(pkgName) {
  return new Promise((resolve) => {
    const encoded = pkgName.replace('/', '%2F');
    const url = `https://api.npmjs.org/downloads/point/last-week/${encoded}`;
    https.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data).downloads || 0);
        } catch (e) {
          resolve(0);
        }
      });
    }).on('error', () => resolve(0));
  });
}

async function validatePackage(pkgName) {
  const baseList = loadJson(BASE_LIST);
  const extendedList = loadJson(EXTENDED_LIST);
  const securityConfig = loadJson(SECURITY_CONFIG);

  if (baseList[pkgName]) return { allowed: true, reason: 'base-allowlist' };
  if (securityConfig.extended_list_enabled && extendedList[pkgName]) {
    return { allowed: true, reason: 'extended-allowlist' };
  }

  logInfo(`Package "${pkgName}" not in allowlist. Running auto-validation...`);

  try {
    const registryData = await queryNpmRegistry(pkgName);
    if (!registryData.time || !registryData.time.created) {
      return { allowed: false, reason: `Could not determine publish date.` };
    }

    const ageDays = (Date.now() - new Date(registryData.time.created)) / (1000 * 60 * 60 * 24);
    const downloads = await getWeeklyDownloads(pkgName);

    const issues = [];
    if (ageDays < MIN_PACKAGE_AGE_DAYS) {
      issues.push(`Published: ${Math.floor(ageDays)} days ago (minimum: ${MIN_PACKAGE_AGE_DAYS})`);
    }
    if (downloads < MIN_WEEKLY_DOWNLOADS) {
      issues.push(`Weekly downloads: ${downloads.toLocaleString()} (minimum: ${MIN_WEEKLY_DOWNLOADS.toLocaleString()})`);
    }

    if (issues.length === 0) {
      return { allowed: true, reason: `Auto-validated` };
    }
    return { allowed: false, reason: issues.join('\n  - ') };
  } catch (err) {
    return { allowed: false, reason: `Registry query failed: ${err.message}` };
  }
}

async function main() {
  // Find the package being executed (first non-flag arg)
  let pkgName = null;
  let skipNext = false;
  for (const arg of args) {
    if (skipNext) {
      skipNext = false;
      continue;
    }
    if (arg.startsWith('-')) {
      if (['--package', '-p'].includes(arg)) skipNext = true;
      continue;
    }
    pkgName = parsePackageName(arg);
    break;
  }

  // If no package detected, just pass through (might be npx --version, etc.)
  if (!pkgName) {
    return runRealNpx(args);
  }

  const result = await validatePackage(pkgName);

  if (!result.allowed) {
    logError(`npx execution blocked for "${pkgName}".`);
    console.error(`Reason: ${result.reason}`);
    console.error();
    console.error('💡 Tip: Ask your AI assistant to suggest an alternative library.\n');
    console.error(`   To allow this package, add it to:\n   ${BASE_LIST}\n`);
    process.exit(1);
  }

  logInfo(`✅ ${pkgName}: ${result.reason}`);
  return runRealNpx(args);
}

function runRealNpx(args) {
  const child = spawn(REAL_NPX, args, { stdio: 'inherit', shell: false });
  child.on('exit', (code) => process.exit(code || 0));
}

main().catch((err) => {
  logError(`Unexpected error: ${err.message}`);
  process.exit(1);
});
