# Deploying to Vercel with Neon PostgreSQL

This guide outlines the steps to deploy the AliTools B2B E-commerce application to Vercel using a Neon PostgreSQL database.

## Prerequisites

- A Vercel account (https://vercel.com)
- A Neon account (https://neon.tech)
- Git repository with your application code

## Step 1: Set Up Your Neon PostgreSQL Database

1. Sign up or log in to Neon (https://neon.tech)
2. Create a new project
3. Create a database named `alitools_b2b` (or your preferred name)
4. In the connection details, get the PostgreSQL connection string, which looks like:
   ```
   postgres://user:password@your-neon-db-host.neon.tech/dbname?sslmode=require
   ```
5. Save this connection string - you'll need it for Vercel configuration

## Step 2: Prepare Your Application for Deployment

1. Ensure you have a `vercel.json` file in your project root with appropriate configuration
2. Ensure your database configuration in `server/src/config/database.js` properly uses the `NEON_DB_URL` environment variable (already configured)
3. Make sure your build scripts are properly set up in package.json (already configured)

## Step 3: Deploy to Vercel

1. Install the Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel from the CLI:
   ```bash
   vercel login
   ```

3. Deploy the application:
   ```bash
   vercel
   ```
   
   Or for production:
   ```bash
   vercel --prod
   ```

## Step 4: Configure Environment Variables in Vercel

In the Vercel dashboard for your project:

1. Go to Settings > Environment Variables
2. Add the following environment variables:

```
NODE_ENV=production
JWT_SECRET=your_strong_jwt_secret
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
NEON_DB_URL=postgres://user:password@your-neon-db-host.neon.tech/dbname?sslmode=require
```

Replace the `NEON_DB_URL` with your actual connection string from Neon.

## Step 5: Run Database Migrations

Since Vercel doesn't provide a direct way to run database migrations during build time, you have two options:

### Option 1: Run Migrations Manually Before Deployment

```bash
NODE_ENV=production NEON_DB_URL=your_neon_connection_string npm run db:migrate
```

### Option 2: Create a Deployment Hook with Migration Script

1. Create a separate deployment script that connects to your Neon database and runs migrations
2. Use Vercel's deployment hooks to trigger this script after deployment

## Step 6: Test Your Deployment

1. Navigate to your deployed Vercel URL
2. Verify that the API endpoints are working correctly
3. Check that database connections are successful

## Troubleshooting

### Database Connection Issues

- Verify your Neon connection string is correctly formatted in Vercel's environment variables
- Check that the SSL configuration is correct in the database.js file
- Ensure your IP is allowed in Neon's security settings (if applicable)

### API Errors

- Check Vercel deployment logs for any errors
- Verify that the routes in vercel.json are correctly configured
- Ensure that server-side code is properly transpiled in the build process

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)
- [Sequelize with PostgreSQL Documentation](https://sequelize.org/master/manual/getting-started.html) 