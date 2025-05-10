# Database Connection Support

## Environment Variables Guide

Here's a reference of the environment variables required for connecting to Neon PostgreSQL:

```
# Neon PostgreSQL Connection (Primary)
NEON_DB_URL=postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require

# Alternative connection parameters
DB_HOST=ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech
DB_PORT=5432
DB_USER=neondb_owner
DB_PASSWORD=npg_NEjIVhxi8JZ2
DB_NAME=neondb
DB_SSL=true

# Vercel PostgreSQL Parameters
POSTGRES_URL=postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL_NON_POOLING=postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

## Connection Test Scripts

The following scripts are available to test database connectivity:

- `docs/database/neon-db-explorer.js` - Lists all tables in the database
- `docs/database/neon-db-schema-explorer.js` - Shows detailed schema information for all tables

Run these scripts with Node.js:

```bash
node docs/database/neon-db-explorer.js
node docs/database/neon-db-schema-explorer.js
```

## Common Connection Issues

### SSL Configuration

The Neon database requires SSL. Ensure the connection includes:

```javascript
const sequelize = new Sequelize(NEON_DB_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});
```

### Connection Pooling

- For most uses, the pooled connection URL (`NEON_DB_URL`) is recommended
- For operations like migrations, use the non-pooled URL (`POSTGRES_URL_NON_POOLING`)

### Environment Variable Configuration

If experiencing connection issues:

1. Check that environment variables are properly set in all relevant environments:
   - Local development (.env file)
   - Vercel project settings
   - CI/CD pipeline configurations

2. On Vercel, ensure these variables are available to your deployment:
   - NEON_DB_URL
   - NODE_ENV
   - JWT_SECRET
   - Other required server configuration variables

## Error Tracking Information

### Vercel Environment Variables Configuration Issue

- **Date:** [2023-06-10 15:30]
- **Error Type:** Server Configuration / Database Connection
- **Environment:** Production
- **Error Message:** 
  ```
  GET https://aligekow-h7ygbhoh4-alitools-projects.vercel.app/api/v1/products?page=1&limit=12&sortBy=created_at&sortOrder=desc 500 (Internal Server Error)
  ```
- **Root Cause:** Even though the API endpoint URL was fixed to use relative paths, the server is still returning 500 errors because the environment variables needed for database connection are not properly set up in Vercel. While the local `.env` file contains the correct database configuration, these variables are not automatically uploaded to Vercel during deployment.

- **Resolution:** 
  1. Manually add all required environment variables to the Vercel project settings
  2. Ensure `NODE_ENV`, `POSTGRES_URL`/`NEON_DB_URL`, and other database connection parameters are set
  3. Add the `JWT_SECRET` and other required server configuration variables
  4. Redeploy the application after setting up the environment variables
  
- **Verification:** After adding the environment variables to the Vercel project settings, verify that API endpoints return proper responses with status 200.

### Database Connection Testing

If encountering database connection issues in production:

1. First verify connection using `docs/database/neon-db-explorer.js`
2. Ensure Neon database is running (check Neon dashboard) 
3. Verify that connection string is correctly formatted
4. Check that SSL configuration is correctly set up
5. Verify that IAM permissions and network access rules allow connection
6. Make sure the server has the correct environment variables 