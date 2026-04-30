#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Setting up Design Studio devcontainer..."

# Create wrapper directory if it doesn't exist
mkdir -p /usr/local/bin/wrappers

# Copy wrapper scripts into wrappers directory
# (They will be mounted from the project, but we symlink them here)
WRAPPER_SRC="/workspaces/design-studio/scripts"
WRAPPER_DST="/usr/local/bin/wrappers"

if [ -d "$WRAPPER_SRC" ]; then
    cp "$WRAPPER_SRC/safe-install.js" "$WRAPPER_DST/npm-wrapper.js"
    cp "$WRAPPER_SRC/safe-npx.js" "$WRAPPER_DST/npx-wrapper.js"
    chmod +x "$WRAPPER_DST/npm-wrapper.js" "$WRAPPER_DST/npx-wrapper.js"
fi

# Ensure the wrappers directory is early in PATH for the node user
# We append to .bashrc so it persists
if ! grep -q "/usr/local/bin/wrappers" "$HOME/.bashrc"; then
    echo 'export PATH="/usr/local/bin/wrappers:$PATH"' >> "$HOME/.bashrc"
fi

# Also set it for the current shell session
export PATH="/usr/local/bin/wrappers:$PATH"

# Create npm/npx symlinks to our wrappers
ln -sf "$WRAPPER_DST/npm-wrapper.js" "$WRAPPER_DST/npm"
ln -sf "$WRAPPER_DST/npx-wrapper.js" "$WRAPPER_DST/npx"

# Ensure .npmrc has our security settings
NPMRC="/workspaces/design-studio/.npmrc"
if [ -f "$NPMRC" ]; then
    echo "✅ .npmrc found"
else
    echo "⚠️  .npmrc not found, creating default..."
    cat > "$NPMRC" << 'EOF'
registry=https://registry.npmjs.org/
ignore-scripts=true
save-exact=true
save-prefix=
EOF
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "/workspaces/design-studio/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd /workspaces/design-studio
    /usr/local/bin/wrappers/npm ci || /usr/local/bin/wrappers/npm install
fi

# Install OpenCode (as node user) from pre-downloaded script
if ! command -v opencode &> /dev/null; then
    echo "🤖 Installing OpenCode..."
    bash /usr/local/share/install-scripts/opencode-install.sh
else
    echo "✅ OpenCode already installed"
fi

# Ensure AI tool paths are available in current session
if [ -d "$HOME/.local/bin" ]; then
    export PATH="$HOME/.local/bin:$PATH"
fi

echo "✅ Design Studio setup complete!"
echo ""
echo "🚀 To start the dev server:"
echo "   npm run dev"
echo ""
echo "🤖 AI tool installed. Open a new terminal to use:"
echo "   opencode    - Start OpenCode"
