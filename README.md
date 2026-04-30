# Design Studio

A secure, devcontainer-based React development environment for UI/UX designers who want to build real frontend code — not just mockups.

## 🚀 Quick Start

1. Click **"Use this template"** on GitHub
2. Clone your new repo to your MacBook
3. Open the folder in **VS Code**
4. VS Code will prompt: **"Reopen in Container"** — click it!
5. Wait for the container to build (first time only, ~2-3 minutes)
6. In the VS Code terminal, run:
   ```bash
   npm run dev
   ```
7. VS Code will notify you that port **5173** is forwarded. Click **"Open in Browser"**.

That's it! You're now editing a real React app inside a secure sandbox.

## 🎨 What Can You Build?

Anything you can imagine with React, TypeScript, and Tailwind CSS:
- Landing pages
- Dashboards
- Component libraries
- Interactive prototypes
- Animations and micro-interactions

## 🤖 AI Assistance

Two AI coding assistants are pre-installed inside your container:

- **Claude Code** — type `claude` in the terminal
- **OpenCode** — type `opencode` in the terminal

Just describe what you want to build, and they'll write the code for you.

## 🔒 Security

Your development environment is fully isolated:
- All code runs inside a Docker container
- npm packages are validated before installation
- Unknown packages are blocked unless they're well-established
- If anything seems off, just rebuild the container — your work is safe on your MacBook

## 📁 Project Structure

```
design-studio/
├── src/
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Tailwind imports
├── config/
│   ├── allowed-packages-base.json
│   └── allowed-packages-extended.json
├── .devcontainer/       # Container configuration
└── package.json         # Dependencies
```

## 💡 Tips

- Use **Tailwind classes** for styling (e.g., `bg-blue-500`, `text-lg`, `p-4`)
- Use **Lucide icons** for icons (e.g., `import { Heart } from 'lucide-react'`)
- Components are just functions — keep them small and focused
- Preview your work anytime with `npm run dev`

Happy designing! 🎉
