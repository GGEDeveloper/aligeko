#!/bin/bash

# AliTools B2B E-commerce Vercel Build & Deploy Script
# Created: 2023-06-07
# This script builds the client app and deploys to Vercel production

echo "===== AliTools B2B Build & Deploy Script ====="
echo "Date: $(date)"
echo "Starting build and deploy process..."

# Ensure we're in the project root
if [ ! -f "index.js" ] || [ ! -d "client" ]; then
  echo "Error: Please run this script from the project root directory"
  exit 1
fi

# 1. Install dependencies
echo "==== Installing dependencies ===="
npm install
cd client
npm install
cd ..

# 2. Build client
echo "==== Building client application ===="
cd client
npm run build
if [ $? -ne 0 ]; then
  echo "Error: Client build failed!"
  exit 1
fi
cd ..

# 3. Run pre-deploy checks
echo "==== Running pre-deployment checks ===="

# Check for required files
if [ ! -f "vercel.json" ]; then
  echo "Error: vercel.json not found in project root"
  exit 1
fi

if [ ! -f "index.js" ]; then
  echo "Error: index.js not found in project root"
  exit 1
fi

if [ ! -d "client/dist" ]; then
  echo "Error: client/dist directory not found. Build may have failed."
  exit 1
fi

# Verify client build files
if [ ! -f "client/dist/index.html" ]; then
  echo "Error: client/dist/index.html not found"
  exit 1
fi

# Check that Express server uses ESM
if ! grep -q "export default app" "index.js"; then
  echo "Warning: index.js may not be using ES Modules (missing 'export default app')"
  echo "Please check that index.js is properly formatted for ES Modules"
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Verify package.json has type: module
if ! grep -q '"type":\s*"module"' "package.json"; then
  echo "Warning: package.json may not have 'type: \"module\"' set"
  echo "This might cause ESM/CommonJS compatibility issues"
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# 4. Commit changes (optional)
echo "==== Preparing for deployment ===="
read -p "Do you want to commit changes before deploying? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  read -p "Enter commit message: " commit_message
  git add .
  git commit -m "$commit_message"
  
  read -p "Push to remote repository? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push
  fi
fi

# 5. Deploy to Vercel
echo "==== Deploying to Vercel production ===="
echo "This will deploy the application to Vercel production environment."
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Deployment cancelled."
  exit 0
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "Error: Vercel CLI not found. Please install it with 'npm install -g vercel'"
  echo "You can still manually deploy by running 'vercel --prod' after installing the CLI"
  exit 1
fi

# Deploy to production
vercel --prod

# 6. Post-deployment checks
echo "==== Post-deployment verification steps ===="
echo "Please perform the following verification checks:"
echo "1. ✅ Verify the homepage loads correctly: https://alitools-b2b.vercel.app"
echo "2. ✅ Test navigation between routes"
echo "3. ✅ Access a direct URL like https://alitools-b2b.vercel.app/products"
echo "4. ✅ Test API endpoints for proper response"
echo "5. ✅ Check browser console for any CORS or other errors"
echo "6. ✅ Verify all static assets load correctly (images, CSS, JS)"

echo "==== Deployment process completed ===="
echo "Date: $(date)"
echo "If you encounter any issues, check the logs in the Vercel dashboard"
echo "and refer to .cursor/rules/error_tracking.mdc for troubleshooting steps" 