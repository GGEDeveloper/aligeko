---
trigger: always_on
description: 
globs: 
---
# Deployment Patterns

This rule documents the standard deployment patterns for the AliTools B2B E-commerce platform.

## Vercel Deployment

- **Required Configuration:**
  - `vercel.json` in project root (see example below)
  - Environment variables in Vercel dashboard
  - Database migration strategy

- **File References:**
  - [vercel.json](mdc:vercel.json) - Vercel configuration
  - [database.js](mdc:server/src/config/database.js) - Database configuration
  - [Deployment Guide](mdc:docs/deployment_guide.md) - Step-by-step instructions
  - [Successful Deployment](mdc:docs/successful-deployment.md) - Record of working configuration

## Standard Deployment Configuration

### Recommended `vercel.json` Configuration:

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

### Required `.vercelignore` Configuration:

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

### Essential `package.json` Scripts:

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

- **✅ DO: Set up proper Express server to handle both API and static content:**
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

- **❌ DON'T: Set up complex routing or try to handle static files differently:**
  ```javascript
  // Don't use complicated matching or multiple handlers
  app.get('/*.js', (req, res) => {
    // Custom JS handling...
  });
  
  app.get('/*.css', (req, res) => {
    // Custom CSS handling...
  });
  ```

## Database Configuration

- **Neon PostgreSQL:**
  - Use `NEON_DB_URL` environment variable
  - SSL configuration required
  - Database models sync only in development

- **✅ DO: Configure database connection with production mode:**
  ```javascript
  // Proper Neon configuration
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

- **❌ DON'T: Use hardcoded credentials or sync in production:**
  ```javascript
  // Never do this
  sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'postgres'
  });
  
  // Avoid model syncing in production
  await sequelize.sync({ force: true }); // DANGEROUS in production!
  ```

## Environment Variables

- **Required Variables:**
  - `NODE_ENV=production`
  - `NEON_DB_URL=postgres://user:password@host/dbname?sslmode=require`

- **Variable Storage:**
  - Store in Vercel dashboard under "Environment Variables"
  - Never commit secrets to the repository
  - Use `.env.example` for documenting required variables

## Deployment Steps

1. **Prepare For Deployment:**
   - Build the client: `npm run build:client`
   - Test the build locally to ensure it works
   - Update `.vercelignore` if any new large files have been added
   - Ensure all environment variables are properly set in Vercel dashboard

2. **Deploy:**
   - Deploy from the root directory with: `vercel --prod`
   - Or use the npm script: `npm run deploy:vercel`

3. **Verify:**
   - Test the deployed application
   - Check functionality in different browsers
   - Verify API endpoints are working
   - Test direct URL access and SPA routing

## Troubleshooting

- **URL Redirection Loops:**
  - Cause: Complex routing configuration in vercel.json
  - Solution: Use simplified configuration where Express handles all routing

- **Build Failures:**
  - Cause: Issues with build scripts or large files
  - Solution: Make vercel-build script resilient, update .vercelignore

- **Missing Assets:**
  - Cause: Incorrect static file serving configuration
  - Solution: Configure proper MIME types and paths in Express

- **API Connection Failures:**
  - Cause: Database connection or environment variable issues
  - Solution: Verify variables in Vercel dashboard, check logs

## Rollback Procedure

1. Identify the last stable deployment in Vercel dashboard
2. Use Vercel's "Rollback" feature or redeploy the last working commit
3. Verify database schema compatibility
4. Test critical functionality after rollback


