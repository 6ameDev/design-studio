# Design Studio

A secure, devcontainer-based React development environment for UI/UX designers who want to build real frontend code, not just mockups.

## 📋 Prerequisites

Before you start, make sure you have **Homebrew** installed on your MacBook. If you don't, visit [brew.sh](https://brew.sh) and follow the one-line install command.

Once Homebrew is ready, open **Terminal** (press `Cmd + Space`, type "Terminal", and hit Enter) and run:

```bash
brew install --cask docker-desktop visual-studio-code
```

This installs two things:

- **Docker Desktop** — the engine that runs your secure workspace
- **VS Code** — the app where you'll write and preview code

After installation:

1. Open **Docker Desktop** from your Applications folder. Wait until the whale icon in your menu bar turns green — this means it's running.
2. Open **VS Code**, click the Extensions icon on the left sidebar (it looks like four squares), search for **Dev Containers**, and click **Install**.

That's all you need!

## 🚀 Getting Started

### 1. Create Your Own Copy

On GitHub, click the green **"Use this template"** button at the top of this page, then choose **"Create a new repository"**. Give it a name that matches your project (for example, `my-portfolio` or `dashboard-design`).

### 2. Download Your Project

In Terminal, run this command to copy the project to your MacBook. Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and the name you chose in the previous step:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

If you kept the original name, it will be:

```bash
git clone https://github.com/YOUR_USERNAME/design-studio.git
```

### 3. Make Sure Docker Desktop Is Running

Look at your menu bar (top-right of your screen). If you see the Docker whale icon and it's not showing a loading spinner, you're good to go. If Docker Desktop isn't open, launch it from your Applications folder and wait for the whale to turn green.

### 4. Open the Project in VS Code

Open **VS Code**, go to **File → Open Folder...**, and select the folder you just cloned.

### 5. Reopen in Container

VS Code will show a blue notification in the bottom-right corner that says:

> **"Folder contains a Dev Container configuration file. Reopen folder to develop in a container?"**

Click **"Reopen in Container"**.

A new window will open, and a terminal panel at the bottom will start building your workspace. The first time you do this, it will take about **2–3 minutes** — this is normal. Wait until you see the terminal prompt return (it will show something like `root@...:/workspaces/YOUR_REPO_NAME#`).

### 6. Start the Preview Server

Once the build is finished, look at the **TERMINAL** panel at the bottom. Click the **plus (+) icon** on the right side of the terminal panel to open a **new terminal**.

In this new terminal, type:

```bash
npm run dev
```

Then press **Enter**. This starts the live preview of your app.

### 7. Open in Your Browser

VS Code will show a notification that port **5173** is now forwarded. Click **"Open in Browser"**.

You will now see a live preview of your app at `http://localhost:5173`. Any changes you make to the code will instantly appear here.

### 8. Launch Your AI Assistant

Click the **plus (+) icon** in the terminal panel again to open **another new terminal**. This one is just for chatting with your AI assistant.

Type:

```bash
opencode
```

Then press **Enter**. You can now describe what you want to build, and it will write the code for you.

---

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

Both tools support a **Plan** and **Build** workflow that helps you think before you code.

### How to Work With Your AI Assistant

**1. Start in Plan Mode**
When you launch the assistant, it starts in **plan mode**. Use this to describe what you want to build, research, or iterate on. Think of it like a design critique or brainstorming session — share your ideas, reference designs, or user flows. The more context you give, the better the result.

**2. Keep the Conversation Going**
Encourage the assistant to ask _you_ questions back. A good plan emerges when both of you are satisfied. Don't rush this step — iterating on the plan is much faster than fixing code later.

> **Tip:** If you have access to different AI models, use a stronger **reasoning model** during plan mode. It helps explore edge cases and refine the approach.

**3. Switch to Build Mode**
Once you agree on the plan, switch to **build mode**. The assistant will now write the actual code. If you have access to different models, you can switch to a faster or more coding-focused model for this step.

**4. Explore Skills (Advanced)**
As you get comfortable, you can explore built-in **skills** — these are specialized instructions that teach the assistant how to handle specific tasks (like security reviews or test-driven development). However, **be extremely cautious**: never install skills or plugins automatically. Always read and evaluate the skill yourself, then manually copy it into your project if it looks safe and useful.

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
