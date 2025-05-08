#!/bin/bash

# Script to fix server module import path and deploy
# Date: 2023-06-09

echo "===== AliTools B2B Server Module Import Fix ====="
echo "Date: $(date)"
echo ""
echo "This script will fix the server module import path and deploy to Vercel."

# Verify we're in the root directory
if [ ! -f "index.js" ]; then
  echo "Error: Please run this script from the project root directory."
  exit 1
fi

# Commit changes
echo "Committing changes..."
git add index.js .cursor/rules/error_tracking.mdc
git commit -m "fix(server): Correct server module import path

- Update path from './server/index.js' to './server/src/index.js'
- Add detailed error information for debugging
- Update error tracking documentation

Resolves issue with 500 errors when accessing API endpoints in production."

# Build client
echo "Building client application..."
cd client && npm run build
if [ $? -ne 0 ]; then
  echo "Error: Client build failed!"
  exit 1
fi
cd ..

# Deploy to Vercel
echo "Deploying to Vercel production..."
vercel --prod

echo ""
echo "===== Deployment Complete ====="
echo "Next steps:"
echo "1. Verify the API endpoints are working properly in production"
echo "2. Check logs in Vercel dashboard for any remaining issues"
echo ""
echo "If you need to rollback, use: git reset --hard HEAD~1 && vercel --prod" 