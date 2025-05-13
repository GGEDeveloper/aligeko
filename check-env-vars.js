// Script to check and report on environment variables
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env and .env.local
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });

// List of environment variables we want to check
const ENV_VARS_TO_CHECK = [
  'NEON_DB_URL',
  'POSTGRES_URL',
  'DATABASE_URL',
  'NODE_ENV',
  'PORT'
];

// Function to safely log environment variable status without exposing values
const logEnvVarStatus = (name) => {
  const exists = !!process.env[name];
  const value = process.env[name];
  
  // For sensitive values, just show first/last few characters
  let displayValue = null;
  if (exists && value) {
    if (name.includes('URL') || name.includes('PASSWORD') || name.includes('SECRET')) {
      // For URLs, show protocol and host part only
      if (value.includes('://')) {
        const url = new URL(value);
        displayValue = `${url.protocol}//${url.host}/***`;
      } else if (value.length > 10) {
        // For other sensitive values, show first/last few chars
        displayValue = `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
      } else {
        displayValue = '******';
      }
    } else {
      // Non-sensitive values can be shown completely
      displayValue = value;
    }
  }
  
  return {
    name,
    exists,
    displayValue
  };
};

console.log('====== ENVIRONMENT VARIABLES CHECK ======');
console.log('NODE_ENV is:', process.env.NODE_ENV || 'not set');
console.log('\nChecking critical database connection variables:');

const results = {};
let anyDbUrlExists = false;

ENV_VARS_TO_CHECK.forEach(varName => {
  const status = logEnvVarStatus(varName);
  results[varName] = status;
  
  if (varName.includes('_URL') && status.exists) {
    anyDbUrlExists = true;
  }
  
  console.log(`${varName}:`, status.exists ? 
    `✅ EXISTS ${status.displayValue ? `(${status.displayValue})` : ''}` : 
    '❌ NOT SET');
});

console.log('\nSummary:');
console.log('Database URL available:', anyDbUrlExists ? '✅ YES' : '❌ NO');
console.log('===========================================');

// Suggest next steps
console.log('\nNext steps:');
if (!anyDbUrlExists) {
  console.log(`
  1. Set a database URL environment variable in Vercel:
     - Go to Vercel Dashboard: https://vercel.com/
     - Open your project settings
     - Go to Environment Variables
     - Add the NEON_DB_URL environment variable with your PostgreSQL connection string
     - Format: postgresql://username:password@host:port/database_name?sslmode=require
     - Example: postgresql://neon:pass@ep-cool-rain-123456.us-east-2.aws.neon.tech/dbname?sslmode=require
     
  2. Redeploy your application:
     - Run: vercel --prod
     
  3. Verify the database connection works:
     - Visit: https://your-app.vercel.app/api/v1/products
  `);
} else {
  console.log(`
  Your database URL environment variable is set.
  
  If you're still experiencing issues:
  1. Verify the URL is correct and the database is accessible
  2. Ensure the pg package is properly installed (should be listed in package.json)
  3. Check for any CORS issues with the Vercel deployment
  4. Review logs for more specific error messages: vercel logs
  `);
} 