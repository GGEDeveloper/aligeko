---
trigger: model_decision
description: op1
globs: 
---
# Operations (Ops) Reference

This document defines commonly used operations for the AliTools B2B project.

## Standard Operations

### op1: Deploy to Vercel

When asked to "run op1" or "execute op1", this means:

1. Run the Vercel build process
2. Update the repository with the latest changes
3. Complete the deployment to Vercel

**Command Sequence:**
```bash
# Build the project
npm run build

# Commit and push changes (if there are uncommitted changes)
git add .
git commit -m "Update: Preparing for deployment"
git push

# Deploy to Vercel
vercel --prod
```

This operation should be executed when changes need to be published to the live environment.

### op2: Enhanced Deployment Process

When asked to "run op2" or "execute op2", this means:

1. Run the environment check to validate configuration
2. Execute the automated deployment script
3. Verify deployment success

**Command Sequence:**
```bash
# Run environment check
npm run check:env

# Run automated deployment script (which handles build, check, and deploy)
npm run deploy

# Verify deployment status
npm run vercel:logs
```

This operation should be used for a more thorough deployment process with proper validation.
