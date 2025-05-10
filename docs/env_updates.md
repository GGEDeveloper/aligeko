# Environment Variable Updates

**Timestamp:** [2023-06-23 18:45]

This document outlines the required changes to environment variables to fix the current production issues. Please apply these changes in the Vercel project settings.

## Database Connection SSL Configuration

Please update the following environment variables in your Vercel project settings:

```
NEON_DB_URL=postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL=postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
DB_SSL=true
```

Both connection strings must include the `?sslmode=require` suffix and the DB_SSL variable must be set to true.

## CORS Configuration

Ensure the CORS_ORIGIN variable is configured correctly to allow requests from all Vercel deployment URLs:

```
CORS_ORIGIN=https://aligekow.vercel.app,https://aligekow-h7ygbhoh4-alitools-projects.vercel.app,https://aligekow-*.vercel.app
```

## API Configuration

No changes are needed for the API_URL variable, as it has been updated in the code to use relative paths.

## Required Steps

1. Go to the Vercel project settings
2. Navigate to the Environment Variables section
3. Update the variables listed above
4. Redeploy the application to apply the changes

After making these changes, the app should connect correctly to the database and resolve the "Cannot read properties of undefined (reading 'map')" error in the Products page. 