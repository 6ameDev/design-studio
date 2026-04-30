FROM mcr.microsoft.com/devcontainers/typescript-node:22

# Install additional tools
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    git \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Pre-download AI tool install scripts (fails at build time if network issues)
RUN mkdir -p /usr/local/share/install-scripts && \
    curl -fsSL https://claude.ai/install.sh -o /usr/local/share/install-scripts/claude-install.sh && \
    curl -fsSL https://opencode.ai/install -o /usr/local/share/install-scripts/opencode-install.sh && \
    chmod +x /usr/local/share/install-scripts/*.sh

# Create wrapper directories early in PATH (owned by node user)
RUN mkdir -p /usr/local/bin/wrappers && chown -R node:node /usr/local/bin/wrappers

# Switch to non-root node user (devcontainer default)
USER node

# Set working directory
WORKDIR /workspaces/design-studio

# Default command
CMD ["sleep", "infinity"]
