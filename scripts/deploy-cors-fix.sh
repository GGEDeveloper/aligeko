#!/bin/bash

# Deployment script for CORS fix
# Created on: 2023-06-07

echo "==== Starting CORS fix deployment ===="
echo "Date: $(date)"

# Stage changes
echo "Staging changes..."
git add index.js .cursor/rules/error_tracking.mdc scripts/deploy-cors-fix.sh

# Commit changes
echo "Committing changes..."
git commit -m "fix(cors): Add dynamic CORS configuration for Vercel preview deployments

- Replace static CORS configuration with dynamic function-based approach
- Add regex pattern matching for Vercel preview deployment URLs
- Implement logging for blocked origins
- Create error tracking documentation"

# Push changes
echo "Pushing changes to remote repository..."
git push

# Wait for Vercel deployment to complete
echo "Waiting for Vercel deployment to complete (60 seconds)..."
sleep 60

# Test CORS fix
echo "Testing CORS fix on preview URL..."
curl -I -H "Origin: https://aligekow-34kcgkb6g-alitools-projects.vercel.app" \
  https://aligekow-latest.vercel.app/api/v1/products

echo "==== CORS fix deployment complete ===="
echo "Date: $(date)"
echo ""
echo "Next steps:"
echo "1. Verify the API works correctly on the preview URL"
echo "2. Check the products page loads data properly"
echo "3. Update the error_tracking.mdc with verification results"
echo ""
echo "If issues persist, check the server logs in Vercel dashboard" 