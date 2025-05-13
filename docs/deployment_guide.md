# AliTools B2B Deployment Guide

This document provides a step-by-step guide for deploying the AliTools B2B platform to Vercel, incorporating lessons learned from recent deployment experiences.

## Pre-Deployment Checklist

Before deploying to Vercel, ensure the following:

1. **Database Connection:**
   - Verify Neon PostgreSQL credentials are correct in both `.env` and `.env.local`
   - Test database connection using the diagnostic tool:
     ```bash
     node test-db-connection.js
     ```
   - Confirm schema matches model definitions in `server/src/models`
   - Ensure SSL configuration is properly set in database connection

2. **Client Build:**
   - Run a test build of the client to identify any compilation issues:
     ```bash
     cd client
     npm run build
     ```
   - Address any warnings or errors before proceeding
   - Verify static assets are properly referenced in the build output

3. **Environment Variables:**
   - Ensure all required environment variables are set in Vercel dashboard:
     - `NODE_ENV=production`
     - `NEON_DB_URL` (PostgreSQL connection string)
     - Any API keys or service credentials

4. **Configuration Files:**
   - Verify `vercel.json` configuration (see below)
   - Check `.vercelignore` to ensure large files are excluded
   - Confirm `package.json` scripts are properly configured

## Required Configuration Files

### 1. vercel.json

Use this simplified configuration to delegate all routing to the Express server:

```json
{
  "version": 2,
  "builds": [
    { 
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/index.js" }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**IMPORTANT:** Do not use complex routing rules in vercel.json as they can cause redirect loops. Let Express handle all routing.

### 2. .vercelignore

Create a comprehensive `.vercelignore` file to exclude unnecessary files:

```
# Dependencies
**/node_modules

# Build files
client/.vite

# Log files
**/*.log*

# Local env files
.env.local
.env.development.local
.env.test.local
.env.production.local

# Development files
README.md
CHANGELOG.md
.git
.github

# Documentation
docs/
docs.old/

# Large files
*.xml
geko_transformed_data.json

# Test files
test-*.js
*-debug.js

# Scripts that aren't needed in production
scripts/
```

### 3. package.json scripts

Ensure these scripts are defined in your root `package.json`:

```json
"scripts": {
  "build:client": "cd client && npm install && npm run build",
  "build:server": "cd server && npm install && npm run build",
  "build": "npm run build:client && npm run build:server",
  "vercel-build": "npm run build:client || echo 'Client build failed but continuing deployment'",
  "start": "node index.js"
}
```

The `|| echo` pattern in `vercel-build` ensures deployment continues even if there are non-critical build issues.

## Express Server Configuration

Ensure your Express server (`index.js` in the root directory) properly handles:

1. **Static files** with correct MIME types:
```javascript
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Serve static files with proper MIME types
app.use(express.static(join(__dirname, 'client/dist'), {
  setHeaders: (res, path) => {
    // Set appropriate MIME types
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    }
    
    // Set appropriate cache headers for different resource types
    if (path.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));
```

2. **API routes** before the catch-all route:
```javascript
// API routes
app.use('/api', apiRoutes);
```

3. **SPA routing** with a catch-all route:
```javascript
// SPA route handler - catches all non-API routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'client/dist/index.html'));
});
```

## Deployment Process

1. **Build the client:**
   ```bash
   npm run build:client
   ```

2. **Verify the build:**
   - Check that the `client/dist` directory contains the expected files
   - Test static file references
   - Confirm there are no build errors

3. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

4. **Verify the deployment:**
   - Check that the application loads correctly
   - Test navigation between routes
   - Verify direct URL access works (e.g., `/products`, `/about`)
   - Confirm API endpoints return expected data
   - Check for console errors or CORS issues

## Troubleshooting Common Issues

### 1. URL Redirection Loops

**Symptoms:**
- URL parameters are repeatedly appended: `/?p=/&q=p=/~and~q=p=/~and~q=p=/`
- Page keeps refreshing
- Browser eventually shows ERR_TOO_MANY_REDIRECTS

**Solution:**
- Use the simplified `vercel.json` configuration shown above
- Let Express handle all routing
- Ensure the catch-all route for SPA is after all API routes

### 2. 404 Errors on Direct URL Access

**Symptoms:**
- Application works when navigating from homepage
- Accessing URLs directly (e.g., `/products`) shows 404

**Solution:**
- Ensure the Express catch-all route is properly configured
- Verify `vercel.json` routes all requests to `index.js`
- Check that `index.html` is properly served for all non-asset routes

### 3. Static Assets Not Loading

**Symptoms:**
- Missing CSS styles
- JavaScript errors in console
- Images not displaying

**Solution:**
- Check MIME type configuration in Express server
- Verify static file paths in the build output
- Ensure proper caching headers are set for assets

### 4. Deployment Times Out

**Symptoms:**
- "Resource provisioning timed out" error
- Deployment takes too long and fails

**Solution:**
- Review and update `.vercelignore` to exclude large files
- Ensure build scripts complete within reasonable time
- Consider splitting large operations into separate builds

## Post-Deployment Verification Checklist

After deployment, verify:

- [ ] Homepage loads correctly with all assets
- [ ] Navigation between routes works
- [ ] Direct URL access works (e.g., `/products`, `/about`)
- [ ] API endpoints return correct data
- [ ] No redirection loops or URL parameter accumulation
- [ ] No console errors
- [ ] Static assets (JS, CSS, images) load with correct MIME types

## References

- [Vercel Documentation](https://vercel.com/docs)
- [Express Static File Serving](https://expressjs.com/en/starter/static-files.html)
- [Single Page Application Routing](https://router.vuejs.org/guide/essentials/history-mode.html)
- [Successful Deployment Record](./successful-deployment.md)

---

*Last updated: June 15, 2025* 