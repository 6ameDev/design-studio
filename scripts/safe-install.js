#!/usr/bin/env node
/**
 * Safe NPM Wrapper
 * Intercepts npm install/add commands to enforce package allowlist
 * and automatic validation (age >= 1 year, weekly downloads >= 20,000).
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const REAL_NPM = '/usr/local/bin/npm';
const CONFIG_DIR = path.resolve('/workspaces/design-studio/config');
const BASE_LIST = path.join(CONFIG_DIR, 'allowed-packages-base.json');
const EXTENDED_LIST = path.join(CONFIG_DIR, 'allowed-packages-extended.json');
const SECURITY_CONFIG = path.join(CONFIG_DIR, 'security-config.json');

const MIN_PACKAGE_AGE_DAYS = 365;
const MIN_WEEKLY_DOWNLOADS = 20000;

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

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

function isInstallCommand(cmd) {
  return ['install', 'i', 'add', 'in', 'ins', 'inst', 'insta', 'instal', 'isnt', 'isnta', 'isntal', 'isntall'].includes(cmd);
}

function parsePackageName(arg) {
  // Handle formats: react, react@18.3.1, @scope/pkg, @scope/pkg@1.0.0
  const match = arg.match(/^(@[^/]+\/[^@]+|[^@]+)(?:@(.+))?$/);
  if (!match) return null;
  return { name: match[1], version: match[2] };
}

function extractPackagesFromArgs(args) {
  const packages = [];
  let skipNext = false;
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (skipNext) {
      skipNext = false;
      continue;
    }
    if (arg.startsWith('-')) {
      // Some flags take values
      if (['--registry', '--prefix', '--globalconfig', '--userconfig'].includes(arg)) {
        skipNext = true;
      }
      continue;
    }
    const parsed = parsePackageName(arg);
    if (parsed) {
      packages.push(parsed.name);
    }
  }
  return packages;
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
          const json = JSON.parse(data);
          resolve(json);
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
          const json = JSON.parse(data);
          resolve(json.downloads || 0);
        } catch (e) {
          resolve(0);
        }
      });
    }).on('error', () => resolve(0)).on('timeout', () => resolve(0));
  });
}

async function validatePackage(pkgName) {
  const baseList = loadJson(BASE_LIST);
  const extendedList = loadJson(EXTENDED_LIST);
  const securityConfig = loadJson(SECURITY_CONFIG);

  // Check base list
  if (baseList[pkgName]) {
    return { allowed: true, reason: 'base-allowlist' };
  }

  // Check extended list
  if (securityConfig.extended_list_enabled && extendedList[pkgName]) {
    return { allowed: true, reason: 'extended-allowlist' };
  }

  // Auto-validation via npm registry
  logInfo(`Package "${pkgName}" not in allowlist. Running auto-validation...`);

  try {
    const registryData = await queryNpmRegistry(pkgName);
    if (!registryData.time || !registryData.time.created) {
      return { allowed: false, reason: `Could not determine publish date for "${pkgName}".` };
    }

    const created = new Date(registryData.time.created);
    const now = new Date();
    const ageDays = (now - created) / (1000 * 60 * 60 * 24);

    const downloads = await getWeeklyDownloads(pkgName);

    const issues = [];
    if (ageDays < MIN_PACKAGE_AGE_DAYS) {
      issues.push(`Published: ${Math.floor(ageDays)} days ago (minimum: ${MIN_PACKAGE_AGE_DAYS})`);
    }
    if (downloads < MIN_WEEKLY_DOWNLOADS) {
      issues.push(`Weekly downloads: ${downloads.toLocaleString()} (minimum: ${MIN_WEEKLY_DOWNLOADS.toLocaleString()})`);
    }

    if (issues.length === 0) {
      return {
        allowed: true,
        reason: `Auto-validated: ${Math.floor(ageDays)} days old, ${downloads.toLocaleString()} weekly downloads.`
      };
    }

    return {
      allowed: false,
      reason: issues.join('\n  - ')
    };
  } catch (err) {
    return { allowed: false, reason: `Failed to query npm registry: ${err.message}` };
  }
}

async function main() {
  // If not an install command, pass through directly
  if (!isInstallCommand(command)) {
    return runRealNpm(args);
  }

  const packages = extractPackagesFromArgs(args);

  // If no explicit packages (e.g., `npm install` or `npm ci`), allow but enforce flags
  if (packages.length === 0) {
    return runSecureInstall(args);
  }

  // Validate each requested package
  const failures = [];
  const successes = [];

  for (const pkg of packages) {
    const result = await validatePackage(pkg);
    if (result.allowed) {
      successes.push({ pkg, reason: result.reason });
    } else {
      failures.push({ pkg, reason: result.reason });
    }
  }

  if (failures.length > 0) {
    logError('Package installation blocked by security policy.');
    console.error('The following packages failed validation:\n');
    for (const f of failures) {
      console.error(`  📦 ${f.pkg}`);
      console.error(`     ${f.reason}`);
      console.error();
    }

    console.error('💡 Tip: Ask your AI assistant to suggest an alternative, well-known library\n   that provides the same functionality.\n');
    console.error(`   To permanently allow a package, add it to:\n   ${BASE_LIST}\n`);

    process.exit(1);
  }

  for (const s of successes) {
    logInfo(`✅ ${s.pkg}: ${s.reason}`);
  }

  return runSecureInstall(args);
}

function runSecureInstall(args) {
  // Build secure args:
  // --before=30 days ago to enforce 30-day buffer
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const beforeDate = thirtyDaysAgo.toISOString().split('T')[0];

  const secureArgs = [
    `--before=${beforeDate}`,
    '--ignore-scripts',
    '--save-exact'
  ];

  // Prepend security flags but keep original args
  const finalArgs = [args[0], ...secureArgs, ...args.slice(1)];

  logInfo(`Running: npm ${finalArgs.join(' ')}`);

  const child = spawn(REAL_NPM, finalArgs, {
    stdio: 'inherit',
    shell: false
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

function runRealNpm(args) {
  const child = spawn(REAL_NPM, args, {
    stdio: 'inherit',
    shell: false
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

main().catch((err) => {
  logError(`Unexpected error: ${err.message}`);
  process.exit(1);
});
