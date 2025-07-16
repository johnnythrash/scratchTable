# Use Ubuntu 22.04 which has the exact Tauri 1.x compatible packages
FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    build-essential \
    pkg-config \
    libssl-dev \
    libgtk-3-dev \
    libwebkit2gtk-4.0-dev \
    libjavascriptcoregtk-4.0-dev \
    libsoup2.4-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 (compatible with Vite 7)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install npm dependencies (including @tauri-apps/cli)
RUN npm install

# Copy source code
COPY . .

# Expose the dev server port
EXPOSE 5173 1420

# Use npx to run tauri since it's installed via npm
CMD ["npx", "tauri", "dev"]