# Security Guide for Maintainers

This document explains the security model of Design Studio.

## Threat Model

**Primary goal:** Protect a non-technical designer's MacBook from supply-chain attacks that could occur when AI tools install npm packages during React development.

**Assumption:** The designer is not technical and will not deliberately bypass security controls. The AI tools might hallucinate package names or attempt to install malicious code.

## Security Layers

### 1. Container Isolation
All development (Node.js, npm, AI tools) runs inside a Docker devcontainer. The host MacBook only runs VS Code and Docker Desktop. Even if the container is compromised, the host is protected.

### 2. Non-Root User
The container runs as the `node` user, not root. This limits what a compromised process can do inside the container.

### 3. API Key Isolation
AI tool API keys are mounted as read-only files. They are:
- Unique per designer
- Revocable instantly
- Never committed to git
- Stored outside the container's writable layer

### 4. npm Hardening
The `.npmrc` enforces:
- `ignore-scripts=true` — prevents postinstall malware
- `save-exact=true` — no accidental semver range upgrades
- `registry=https://registry.npmjs.org/` — no third-party registries

### 5. Package Allowlist
Two lists control which packages can be installed:
- **Base list** (`config/allowed-packages-base.json`) — always enforced
- **Extended list** (`config/allowed-packages-extended.json`) — toggleable via `config/security-config.json`

### 6. Auto-Validation
If a package is not in either allowlist, the `safe-install` script queries the npm registry:
- Package must be ≥ **1 year old**
- Package must have ≥ **20,000 weekly downloads**

If both conditions pass, installation proceeds with hardened flags. If not, installation is **blocked**.

### 7. Fail-Closed Behavior
When a package fails validation, the designer sees:
```
❌ SECURITY ERROR: Package installation blocked.
```
With a suggestion to ask their AI for an alternative library.

### 8. AI Tool Guardrails
Both Claude Code and OpenCode are configured to deny `npm install`, `npm add`, `npm i`, and `npx` commands at the AI level. This prevents the AI from even attempting bypasses.

### 9. Wipe & Rebuild SOP
If compromise is suspected:
1. Revoke the designer's API key
2. Destroy the devcontainer (`Dev Containers: Rebuild Container`)
3. Generate a new API key
4. Rebuild the container

The designer's source code is safe because it lives on the host MacBook via bind mount.

## Managing the Allowlist

### Adding a Package
1. Verify the package is legitimate (check npm registry, GitHub repo)
2. Add it to `config/allowed-packages-base.json` with an exact version
3. Commit and push

### Enabling Extended List
Edit `config/security-config.json`:
```json
{
  "extended_list_enabled": true
}
```

### Disabling a Blocked Package
If a previously allowed package becomes compromised, simply remove it from the JSON file. The wrapper will block it immediately.

## npx Restrictions
The `safe-npx.js` wrapper applies the same validation logic to `npx`. Only allowlisted or auto-validated packages can be executed via npx.

## Files You Should NOT Modify
- `.npmrc`
- `scripts/safe-install.js`
- `scripts/safe-npx.js`
- `config/allowed-packages-*.json` (unless you're updating the allowlist)

## Monitoring
The wrapper scripts log validation results to the console. Check the VS Code terminal output to see which packages passed or failed.
