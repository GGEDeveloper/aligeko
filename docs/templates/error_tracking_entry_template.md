# Error Tracking Entry Template

Use this template when adding new errors to the error tracking documentation.

## Error Entry Format

```markdown
### [Error Title/Name]

- **Date:** [YYYY-MM-DD HH:MM]
- **Error Type:** [Brief categorization (e.g., CORS, Routing, Database)]
- **Environment:** [Where the error occurred (Production, Development, Testing)]
- **Error Message:** 
  ```
  [The exact error message or a summary]
  ```
- **Root Cause:** [Analysis of what caused the error]
- **Resolution:** 
  1. [Step 1 taken to fix the issue]
  2. [Step 2 taken to fix the issue]
  3. [Additional steps...]
  
  Code changes:
  ```javascript
  // Old code
  [code before changes]
  
  // New code
  [code after changes]
  ```
  
- **Verification:** 
  1. [How the fix was tested/verified]
  2. [Additional verification steps...]
  
- **Affected Files:** 
  - `[path/to/file1.js]` - [Brief description of changes]
  - `[path/to/file2.js]` - [Brief description of changes]
  
- **Related Issues:** 
  - [Link to related errors or documentation]
  - [Link to GitHub issues if applicable]
  
- **Version:** [Version number where the error was fixed]

- **Prevention:** 
  1. [Step to prevent this error in the future]
  2. [Additional prevention steps...]
```

## Example Entry

### CORS Configuration Error

- **Date:** [2023-06-07 15:45]
- **Error Type:** CORS
- **Environment:** Production
- **Error Message:** 
  ```
  Access to fetch at 'http://localhost:5000/v1/products?page=1&limit=12&sortBy=created_at&sortOrder=desc' 
  from origin 'https://aligekow-34kcgkb6g-alitools-projects.vercel.app' has been blocked by CORS policy: 
  The 'Access-Control-Allow-Origin' header has a value 'http://localhost:3000' that is not equal to the 
  supplied origin.
  ```
- **Root Cause:** The CORS configuration in `index.js` was using a static array of allowed origins in production mode, but did not account for dynamically generated Vercel preview deployment URLs with different subdomains.
- **Resolution:** 
  1. Replaced the static CORS configuration with a dynamic function-based approach
  2. Added support for all Vercel preview deployment URLs with regex pattern matching
  3. Implemented proper error logging for CORS blocked origins
  4. Maintained support for existing allowed origins
  
  Code changes:
  ```javascript
  // Old configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://alitools-b2b.vercel.app', 'https://aligekow-iwznrnlz0-alitools-projects.vercel.app'] 
      : 'http://localhost:3000',
    credentials: true
  }));
  
  // New configuration
  app.use(cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);
      
      // List of allowed origins
      const allowedOrigins = [
        'http://localhost:3000', 
        'https://alitools-b2b.vercel.app', 
        'https://aligekow-iwznrnlz0-alitools-projects.vercel.app'
      ];
      
      // Allow all Vercel preview deployment URLs
      if (
        allowedOrigins.includes(origin) || 
        origin.match(/https:\/\/aligekow-[a-z0-9]+-alitools-projects\.vercel\.app/)
      ) {
        return callback(null, true);
      }
      
      // Log blocked origins for debugging
      console.log(`CORS blocked origin: ${origin}`);
      return callback(new Error(`CORS policy does not allow access from origin ${origin}`), false);
    },
    credentials: true
  }));
  ```
- **Verification:** 
  1. Deployed the updated code to Vercel
  2. Accessed the products page directly on the problematic Vercel preview URL
  3. Confirmed that API calls worked properly with no CORS errors
  4. Tested other allowed origins to ensure they still worked
- **Affected Files:** 
  - `index.js` - Updated CORS configuration
  - `.cursor/rules/error_tracking.mdc` - Created new error tracking documentation
- **Related Issues:** 
  - [express-spa-routing-solution.md](mdc:docs/express-spa-routing-solution.md) - Documentation of the Express SPA routing solution
- **Version:** v1.0.1

- **Prevention:** 
  1. Use function-based CORS configuration for dynamic origin validation
  2. Always include wildcard patterns for preview deployment URLs
  3. Implement proper logging for rejected origins to aid debugging
  4. Consider adding environment variables for additional allowed origins

## Guidelines for Error Tracking

1. **Be thorough**: Include all relevant details about the error
2. **Be specific**: Use exact error messages and code snippets
3. **Be actionable**: Provide clear steps for resolution and verification
4. **Be preventative**: Include steps to prevent similar errors in the future
5. **Use proper formatting**: Follow Markdown formatting for code blocks and lists
6. **Link related issues**: Connect related errors or documentation
7. **Include version information**: Note the version where the error was fixed
8. **Add timestamps**: Always include the date and time when the error was encountered/fixed 