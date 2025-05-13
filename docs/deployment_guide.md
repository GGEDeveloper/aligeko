# AliTools B2B Deployment Guide

This document provides a step-by-step guide for updating and deploying the AliTools B2B platform to Vercel, incorporating lessons learned from recent error fixes.

## Pre-Deployment Checklist

Before deploying to Vercel, ensure the following:

1. **Database Connection:**
   - Verify Neon PostgreSQL credentials are correct in both `.env` and `.env.local`
   - Test database connection using the diagnostic tool:
     ```bash
     node test-db-connection.js
     ```
   - Confirm schema matches model definitions in `index.js`
   - Ensure SSL configuration is properly set in database connection

2. **Client Build:**
   - Run a test build of the client to identify any compilation issues:
     ```bash
     cd client
     npm run build
     ```
   - Address any TypeScript/ESLint errors before deployment
   - Check for any component naming inconsistencies (e.g., ProductList vs ProductsList)

3. **API Format Consistency:**
   - Ensure API response format is consistent with client expectations
   - Verify the transformResponse function in productApi.js handles the current format
   - Test API endpoints locally using the diagnostic tool:
     ```bash
     node test-api-products.js
     ```

4. **Environment Variables:**
   - Confirm all required environment variables are properly set in Vercel dashboard
   - Check both the core environment variables and Neon database integration

## Updating the Repository

When making updates to the repository, follow these steps to ensure a smooth deployment:

1. **Fix Database Model Definitions:**
   - Ensure all model definitions in `index.js` match the actual database schema
   - Update field types and names to match database columns
   - Add proper relationships between tables
   - Example of correct model definition:
   ```javascript
   Product = sequelize.define('product', {
     id: {
       type: Sequelize.INTEGER,
       primaryKey: true,
       autoIncrement: true
     },
     code: Sequelize.TEXT,
     code_on_card: Sequelize.TEXT,
     ean: Sequelize.TEXT,
     producer_code: Sequelize.TEXT,
     name: Sequelize.TEXT,
     description_long: Sequelize.TEXT,
     description_short: Sequelize.TEXT,
     description_html: Sequelize.TEXT,
     vat: Sequelize.DECIMAL,
     delivery_date: Sequelize.DATE,
     url: Sequelize.TEXT,
     category_id: Sequelize.TEXT,
     producer_id: Sequelize.INTEGER,
     unit_id: Sequelize.TEXT
   }, { 
     timestamps: true,
     underscored: true,
     tableName: 'products'
   });
   ```

2. **Configure Express Server:**
   - Update the main `index.js` file to ensure it always starts the server regardless of NODE_ENV:
   ```javascript
   const port = process.env.PORT || 5000;
   app.listen(port, () => {
     console.log(`Server rodando na porta ${port}`);
   });
   ```
   - Implement proper error handling for database connection failures
   - Add detailed logging for troubleshooting in production

3. **Update Client-Side Components:**
   - Fix component naming inconsistencies
   - Update API data handling in components
   - Ensure ProductsPage and related components handle the current API response format
   - Check for any outdated API hook names (e.g., useGetProductByIdQuery vs useGetProductQuery)

4. **Commit Changes:**
   - Commit all changes with descriptive messages
   - Include issue reference numbers if applicable

## Vercel Deployment Process

1. **Configure Vercel Project:**
   - Ensure your `vercel.json` file is properly set up:
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
     },
     "public": true
   }
   ```

2. **Deploy Using CLI:**
   - Install Vercel CLI if not already installed:
   ```bash
   npm install -g vercel
   ```
   
   - Deploy to preview environment first:
   ```bash
   vercel
   ```

   - After testing the preview, deploy to production:
   ```bash
   vercel --prod
   ```

   - Or use the deploy script:
   ```bash
   npm run deploy
   ```

3. **Deploy Via Git:**
   - Push changes to the git repository connected to Vercel:
   ```bash
   git add .
   git commit -m "Deploy: [description of changes]"
   git push
   ```
   - Vercel will automatically build and deploy the project

## Post-Deployment Verification

After deployment, verify the following:

1. **Connectivity:**
   - Check that the website loads correctly at your Vercel URL
   - Verify all navigation links work properly
   - Test direct URL access (e.g., `/products`, `/about`)

2. **API Functionality:**
   - Verify the API endpoints return expected data
   - Check the Products page displays data from the database
   - Verify individual product details pages work

3. **Error Handling:**
   - Check the browser console for any errors
   - Review Vercel logs for server-side errors
   - Test error states (e.g., invalid product IDs)

4. **Performance:**
   - Verify loading times are acceptable
   - Check mobile responsiveness
   - Test with different browsers

## Troubleshooting Common Issues

### 1. 404 Errors on Direct URL Access
- **Cause:** The SPA routing is not properly configured
- **Solution:** Ensure the catch-all handler in Express is correctly set up:
```javascript
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'client/dist/index.html'));
});
```

### 2. API Connection Failures
- **Cause:** SSL configuration or database credentials issue
- **Solution:** 
  - Verify SSL configuration in database connection
  - Check environment variables in Vercel dashboard
  - Add more detailed error logging

### 3. Component Not Found Errors
- **Cause:** Inconsistent component naming or imports
- **Solution:**
  - Standardize component naming (e.g., use plural vs singular consistently)
  - Verify import paths and component exports
  - Test with local build before deployment

### 4. "ProductList is not defined" Error
- **Cause:** Confusion between `ProductList.jsx` and `ProductsList.jsx` components
- **Solution:**
  - Consistently use one naming convention
  - Update all imports to match the chosen convention
  - Ensure components are correctly exported

### 5. Blank Product Pages
- **Cause:** Database connection issues or mock data fallbacks
- **Solution:**
  - Remove fallbacks to mock data in API routes
  - Update database model definitions to match schema
  - Verify database credentials and connection
  - Add debugging logs for database queries

## Best Practices for Future Deployments

1. **Schema Management:**
   - Use database migration tools to keep schema and models in sync
   - Document database schema changes
   - Create scripts to verify schema integrity before deployment

2. **Component Naming:**
   - Use consistent naming conventions throughout the application
   - Consider using TypeScript interfaces for component props
   - Add PropTypes validation for component properties

3. **API Response Formats:**
   - Document API response formats
   - Create version endpoints for significant format changes
   - Implement backwards compatibility for API changes

4. **Error Tracking:**
   - Implement structured error logging
   - Update the error tracking documentation after resolving issues
   - Consider adding monitoring tools like Sentry

5. **Deployment Approach:**
   - Use preview deployments before production
   - Implement canary deployments for major changes
   - Set up automated testing in CI/CD pipeline

## Recent Fixes Reference

For details on recent fixes that informed this guide, refer to the [Error Fixes Log](./error_fixes.md). 