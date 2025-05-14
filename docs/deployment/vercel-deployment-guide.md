# Vercel Deployment Guide

This document outlines the standard deployment patterns for the AliTools B2B E-commerce platform on Vercel.

## Deployment Architecture

The AliTools B2B E-commerce platform uses a monorepo structure with:

- Frontend client (React/Vite)
- Express.js API backend
- Shared code between client and server
- PostgreSQL database (Neon)

## Required Configuration Files

### 1. `vercel.json` Configuration

This file must be placed in the project root:

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

### 2. `.vercelignore` Configuration

This file controls which files are excluded from deployment:

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

### 3. Essential `package.json` Scripts

Your root `package.json` should include these scripts:

```json
"scripts": {
  "build:client": "cd client && npm install && npm run build",
  "build:server": "cd server && npm install && npm run build",
  "build": "npm run build:client && npm run build:server",
  "vercel-build": "npm run build:client || echo 'Client build failed but continuing deployment'",
  "start": "node index.js"
}
```

## Express Server Configuration

The Express server should be configured to handle both API routes and static content:

```javascript
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

// SPA route handler - catches all non-API routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'client/dist/index.html'));
});
```

## Database Configuration

For Neon PostgreSQL, use this configuration pattern:

```javascript
// Proper Neon configuration for production
if (process.env.NODE_ENV === 'production' && dbUrl) {
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectModule: await import('pg'),
    logging: false,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 10,
      min: 0,
      idle: 20000,
      acquire: 60000,
    }
  });
}
```

## Environment Variables

### Required Variables

These variables must be set in the Vercel dashboard:

- `NODE_ENV=production`
- `NEON_DB_URL=postgres://user:password@host/dbname?sslmode=require`
- Any API keys needed by your application

### Variable Storage

- Store variables in the Vercel dashboard under "Environment Variables"
- Never commit secrets to the repository
- Use `.env.example` for documenting required variables

## Deployment Steps

1. **Prepare For Deployment**:
   - Build the client: `npm run build:client`
   - Test the build locally to ensure it works
   - Update `.vercelignore` if any new large files have been added
   - Ensure all environment variables are properly set in Vercel dashboard

2. **Deploy**:
   - Deploy from the root directory with: `vercel --prod`
   - Or use the npm script: `npm run deploy:vercel`

3. **Verify**:
   - Test the deployed application
   - Check functionality in different browsers
   - Verify API endpoints are working
   - Test direct URL access and SPA routing

## Deployment Verification Checklist

After deployment, always verify:

1. ✅ Homepage loads correctly with all assets
2. ✅ Navigation works between routes using React Router
3. ✅ Direct URL access works (e.g., https://your-app.vercel.app/about)
4. ✅ API endpoints return expected data
5. ✅ Authentication flows function properly
6. ✅ No CORS errors in browser console
7. ✅ Static assets (images, CSS, fonts) load correctly
8. ✅ Error pages render properly when needed
9. ✅ No component reference errors in browser console

## Troubleshooting Common Issues

### URL Redirection Loops

- **Cause**: Complex routing configuration in vercel.json
- **Solution**: Use simplified configuration where Express handles all routing

### Build Failures

- **Cause**: Issues with build scripts or large files
- **Solution**: Make vercel-build script resilient, update .vercelignore

### Missing Assets

- **Cause**: Incorrect static file serving configuration
- **Solution**: Configure proper MIME types and paths in Express

### API Connection Failures

- **Cause**: Database connection or environment variable issues
- **Solution**: Verify variables in Vercel dashboard, check logs

## Rollback Procedure

1. Identify the last stable deployment in Vercel dashboard
2. Use Vercel's "Rollback" feature or redeploy the last working commit
3. Verify database schema compatibility
4. Test critical functionality after rollback

## Additional Resources

- [Vercel Deployment Documentation](https://vercel.com/docs/deployments/overview)
- [Express.js Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Express Static File Serving](https://expressjs.com/en/starter/static-files.html) 