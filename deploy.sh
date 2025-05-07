#!/bin/bash

# AliTools B2B Deployment Script
echo "==== Starting AliTools B2B Deployment ===="

# Step 1: Install dependencies
echo "Installing dependencies..."
npm install
cd client && npm install
cd ..

# Step 2: Build client
echo "Building client..."
cd client && npm run build
cd ..

# Step 3: Check for common issues
echo "Checking for common deployment issues..."

# Verify vite.config.js has proper base URL
if grep -q "base: '/'" "./client/vite.config.js"; then
  echo "✅ Base URL is properly configured in vite.config.js"
else
  echo "⚠️ Warning: Base URL may not be properly set in vite.config.js"
fi

# Verify package.json types
if grep -q "\"type\": \"module\"" "./package.json"; then
  echo "✅ Root package.json is properly configured with type:module"
else
  echo "⚠️ Warning: Root package.json might not have type:module set"
fi

if grep -q "\"type\": \"module\"" "./client/package.json"; then
  echo "✅ Client package.json is properly configured with type:module"
else
  echo "⚠️ Warning: Client package.json might not have type:module set"
fi

# Step 4: Verify build output
if [ -d "./client/dist" ]; then
  echo "✅ Build output directory exists"
  if [ -f "./client/dist/index.html" ]; then
    echo "✅ index.html exists in build output"
  else
    echo "❌ Error: index.html not found in build output"
    exit 1
  fi
else
  echo "❌ Error: Build output directory not found"
  exit 1
fi

# Step 5: Deploy to Vercel
echo "Deploying to Vercel..."
npx vercel --prod

echo "==== Deployment process completed ====" 