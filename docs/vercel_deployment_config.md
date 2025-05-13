# Vercel Deployment Configuration Guide

This guide provides detailed instructions for configuring the AliTools B2B platform deployment on Vercel, incorporating lessons learned from recent fixes.

## Required Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEON_DB_URL` | Connection string for Neon PostgreSQL database | `postgres://user:password@host.neon.tech/dbname?sslmode=require` | Yes |
| `NODE_ENV` | Environment setting | `production` | Yes |
| `JWT_SECRET` | Secret for JWT token generation | `your-strong-secret-key` | Yes |
| `JWT_EXPIRATION` | JWT token expiration time | `1h` | Yes |
| `JWT_REFRESH_EXPIRATION` | JWT refresh token expiration time | `7d` | Yes |
| `PORT` | Server port (typically set by Vercel automatically) | `5000` | No |

## Vercel.json Configuration

Create or update `vercel.json` in the project root:

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
    {
      "src": "/api/(.*)",
      "dest": "index.js"
    },
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "public": true
}
```

## Pre-deployment Configuration Checks

### 1. Database Connection

The `index.js` file should include the following database connection configuration:

```javascript
// PostgreSQL Connection with Neon
const dbUrl = process.env.NEON_DB_URL;
const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});
```

### 2. Express Server Configuration

The Express server should handle all routes, including API calls and client-side routing:

```javascript
// API routes
app.use('/api/v1', apiRoutes);

// SPA handler - must be after API routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'client/dist/index.html'));
});

// Always start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

### 3. Static Files Serving

Ensure the server is properly configured to serve static files from the client build:

```javascript
app.use(express.static(join(__dirname, 'client/dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    }
    
    // Cache assets
    if (path.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
});
```

### 4. CORS Configuration

Implement proper CORS configuration to handle different deployment environments:

```javascript
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://aligekow.vercel.app',
      'https://www.aligekow.com',
      'http://localhost:5000',
      'http://localhost:5173'
    ];
    
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Check if it's a preview deployment from Vercel
      if (origin.match(/https:\/\/.*\.vercel\.app/)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    }
  },
  credentials: true
}));
```

## Deployment Process

### 1. Prepare for Deployment

```bash
# Install dependencies
npm install

# Build client
cd client && npm install && npm run build && cd ..

# Test database connection
node test-db-connection.js

# Test API endpoints
node test-api-products.js
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview environment
vercel

# Or deploy to production
vercel --prod
```

### 3. Configure Environment Variables in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add all required environment variables listed above
4. Click "Save" to apply changes
5. Redeploy the application for the new variables to take effect

## Post-Deployment Verification

After deployment, verify the following:

1. **Database Connection**: Check logs for successful database connection messages
2. **API Endpoints**: Test `/api/v1/products` and other endpoints to ensure they return data
3. **Product Display**: Verify the products page shows actual products from the database
4. **Image Loading**: Check that product images load correctly
5. **Authentication**: Test login/signup flows if applicable
6. **Console Errors**: Check browser console for any JavaScript errors

## Troubleshooting Common Issues

### 1. 404 Errors on Direct URL Access

If users get 404 when accessing URLs directly (like `/products/5`):

- Ensure the catch-all handler is correctly implemented in `index.js`
- Check that Vercel.json routes are configured properly
- Verify that `client/dist/index.html` exists after building

### 2. API Endpoint Failures

If API endpoints return errors:

- Check environment variables in Vercel dashboard
- Verify database connection string is correctly formatted
- Look for CORS issues in browser console
- Check Vercel function logs for detailed error messages

### 3. Static Assets Not Loading

If CSS, JavaScript, or images don't load:

- Check that static file serving is properly configured
- Verify file paths in the HTML output
- Ensure MIME types are correctly set for all assets

### 4. Database Connection Issues

If the server can't connect to the database:

- Verify Neon PostgreSQL connection string is correct
- Check that SSL configuration is properly set
- Confirm IP allowlist settings in Neon dashboard
- Test with `test-db-connection.js` to isolate database issues

### 5. Build Failures

If the build process fails:

- Check for ESLint errors in the client code
- Look for import/export issues or missing dependencies
- Verify that all required environment variables are set
- Check that client and server package.json files are correctly configured

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Neon PostgreSQL Documentation](https://neon.tech/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/master/) 