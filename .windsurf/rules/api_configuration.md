---
trigger: model_decision
description: api
globs: 
---
# API Configuration Best Practices

This rule documents API configuration patterns and common issues in the AliTools B2B E-commerce platform.

## Relative vs. Absolute URLs

### Problem: Hardcoded Development URLs in Production

We identified a critical issue where API calls were failing in production because endpoints were hardcoded to `http://localhost:5000/v1`:

```javascript
// ❌ PROBLEMATIC: Hardcoded localhost references  
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/v1';
```

This causes errors in production because:
1. The browser attempts to connect to the user's localhost (which has no server running)
2. CORS issues emerge between domains
3. Requests fail with `ERR_CONNECTION_REFUSED`

### Solution: Use Relative URLs with Proxy Configuration

The recommended approach is to use **relative URLs** in all API service definitions:

```javascript
// ✅ CORRECT: Use relative URLs with proxy  
// In apiSlice.js and other API files
const baseQuery = fetchBaseQuery({
  baseUrl: '/api/v1',
  prepareHeaders: (headers, { getState }) => {
    // Authentication logic here
  }
});
```

**Development Environment:**
- Configure Vite's dev server to proxy API requests:
```javascript
// vite.config.js
export default defineConfig({
  // ...other config
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
});
```

**Production Environment:**
- The Express server in `index.js` handles both static files and API requests:
```javascript
// Static files served from client/dist
app.use(express.static(path.join(__dirname, 'client/dist')));

// API routes forwarded to server implementation
app.use('/api', (req, res) => {
  import('./server/index.js').then(serverModule => {
    serverModule.default(req, res);
  });
});

// SPA route handler for client routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});
```

### Implementation Steps

To fix existing hardcoded API URLs:

1. Update all API service files to use relative paths instead of absolute URLs:
   - `productApi.js`
   - `orderApi.js`
   - `customerApi.js`
   - `categoryApi.js`
   - `reportApi.js`
   - Any components making direct fetch calls

2. Replace all instances of:
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/v1';
   ```
   With:
   ```javascript
   const API_URL = '/api/v1';
   ```

3. Ensure Vite development proxy is properly configured in `vite.config.js`

4. Verify the Express server in `index.js` correctly forwards API requests

### Testing

After implementation, verify the following scenarios:

1. Development: API requests should work through the proxy (`http://localhost:3000` → `http://localhost:5000`)
2. Production: API requests should be handled by the server-side Express application
3. Direct URL access: Routes should not result in 404 errors

### Error Prevention

- Never use absolute URLs in API request configuration
- Use environment variables only for cross-domain scenarios
- Leverage dev server proxying in development
- Implement proper error handling for API requests
- Add retry logic for transient connectivity issues

## Timestamp of Issue

- **First Identified:** [2023-06-08 14:30]
- **Fixed:** [2023-06-08 17:45]
