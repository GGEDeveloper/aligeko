/**
 * Deployment Script for AliTools B2B Platform Fixes
 * 
 * [2023-06-23 20:30] Initial version
 * [2023-06-23 21:15] Updated to use ES modules
 * 
 * This script executes the build and deployment process for fixes to the 
 * "Cannot read properties of undefined (reading 'map')" error.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  buildClient: true,
  buildServer: true,
  verifyEnv: true,
  deploy: true,
  requiredEnvVars: [
    'NEON_DB_URL',
    'POSTGRES_URL',
    'DB_SSL',
    'NODE_ENV',
    'JWT_SECRET'
  ],
  vercelProjectName: 'aligekow' // Change this if your Vercel project name is different
};

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);
  
  switch (type) {
    case 'success':
      console.log(`${colors.green}[${timestamp}] ✓ ${message}${colors.reset}`);
      break;
    case 'error':
      console.error(`${colors.red}[${timestamp}] ✗ ${message}${colors.reset}`);
      break;
    case 'warning':
      console.warn(`${colors.yellow}[${timestamp}] ⚠ ${message}${colors.reset}`);
      break;
    case 'step':
      console.log(`\n${colors.blue}${colors.bright}[${timestamp}] ${message}${colors.reset}\n`);
      break;
    default:
      console.log(`[${timestamp}] ${message}`);
  }
}

function execCommand(command) {
  try {
    log(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`Command failed: ${command}`, 'error');
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    return false;
  }
}

// Main execution
async function main() {
  try {
    log('Starting deployment process for AliTools B2B fixes', 'step');
    
    // Verify environment variables if needed
    if (config.verifyEnv) {
      log('Verifying environment variables...', 'step');
      
      // Check for .env file
      const envExists = fs.existsSync(path.join(process.cwd(), '.env'));
      if (!envExists) {
        log('No .env file found in project root', 'warning');
      } else {
        log('.env file found', 'success');
      }
      
      // Check Vercel environment variables
      log('Checking Vercel environment variables...', 'info');
      
      try {
        execSync('vercel env ls', { stdio: 'pipe' });
        log('Vercel environment variables are accessible', 'success');
      } catch (error) {
        log('Could not access Vercel environment variables. You may need to login with "vercel login"', 'warning');
      }
    }
    
    // Build client
    if (config.buildClient) {
      log('Building client application...', 'step');
      
      if (!execCommand('cd client && npm ci')) {
        throw new Error('Client dependencies installation failed');
      }
      
      if (!execCommand('cd client && npm run build')) {
        throw new Error('Client build failed');
      }
      
      log('Client build successful', 'success');
    }
    
    // Build server
    if (config.buildServer) {
      log('Building server application...', 'step');
      
      if (!execCommand('cd server && npm ci')) {
        throw new Error('Server dependencies installation failed');
      }
      
      if (!execCommand('cd server && npm run build')) {
        throw new Error('Server build failed');
      }
      
      log('Server build successful', 'success');
    }
    
    // Deploy to Vercel
    if (config.deploy) {
      log('Deploying to Vercel...', 'step');
      
      const deployCommand = `vercel --prod`;
      
      if (!execCommand(deployCommand)) {
        throw new Error('Deployment failed');
      }
      
      log('Deployment successful', 'success');
      
      // Get the deployment URL
      try {
        const deploymentUrl = execSync('vercel --prod').toString().trim();
        log(`Application deployed to: ${deploymentUrl}`, 'success');
      } catch (error) {
        log('Deployment completed but could not retrieve the URL', 'warning');
      }
    }
    
    log('Deployment process completed successfully', 'step');
    
  } catch (error) {
    log(`Deployment process failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

main(); 