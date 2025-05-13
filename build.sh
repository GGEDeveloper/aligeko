#!/bin/bash

# Exit on error
set -e

echo "Starting Vercel build process..."

# Build the client
echo "Building client..."
cd client
npm install --no-optional
npm run build
cd ..

echo "Build completed successfully!" 