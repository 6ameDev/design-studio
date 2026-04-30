# AGENTS.md — OpenCode Agent Instructions

## Project Overview
Design Studio is a secure devcontainer-based React development environment for non-technical UI/UX designers.

## Technology Stack
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Lucide React (icons)

## Security Guardrails

### CRITICAL: Package Management
- Do NOT run `npm install`, `npm i`, `npm add`, or `npx` directly.
- The project uses a secure wrapper script at `/usr/local/bin/wrappers/npm`.
- If a package installation is needed, verify it is in `config/allowed-packages-base.json` or `config/allowed-packages-extended.json`.
- If a package is blocked by the wrapper, suggest an alternative well-known library.
- Never modify `.npmrc`, `config/allowed-packages-*.json`, or `scripts/safe-*.js`.

### CRITICAL: File Restrictions
- Do NOT modify files in `.devcontainer/`, `.opencode/`, `scripts/`, or `config/`.
- Do NOT edit security configuration files.

## Coding Standards
- Use functional components with hooks.
- Use Tailwind CSS for all styling.
- Import icons from `lucide-react`.
- Keep components small and focused.
- Use TypeScript types for props.

## Workflow
1. Check current state of `src/App.tsx` and components.
2. Understand the designer's goal.
3. Plan changes before editing.
4. Run `npm run dev` to preview.
5. The dev server runs on port 5173.

## Tone
- Be encouraging and patient.
- Explain changes in simple terms.
- Offer design suggestions, not just code.
- Explain key parts of the code shown.
