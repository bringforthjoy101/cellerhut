#!/bin/bash

# Netlify installation script with legacy peer dependencies support
# This script ensures proper dependency installation in CI environments

set -e  # Exit on any error

echo "🔧 Starting Netlify installation with legacy peer dependencies support..."

# Set Node options for OpenSSL legacy provider
export NODE_OPTIONS="--openssl-legacy-provider"

# Clear npm cache to prevent potential issues
echo "🧹 Clearing npm cache..."
npm cache clean --force || true

# Install dependencies with legacy peer deps
echo "📦 Installing dependencies with --legacy-peer-deps..."
npm install --legacy-peer-deps --no-optional --production=false

# Verify installation
echo "✅ Verifying installation..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
    echo "✅ Dependencies installed successfully"
else
    echo "❌ node_modules directory not found"
    exit 1
fi

echo "🎉 Installation completed successfully!"