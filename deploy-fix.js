// Deployment script for authentication fix
import { exec } from 'child_process';
import { promises as fs } from 'fs';

// Execute commands synchronously and log output
const execPromise = (cmd) => {
  return new Promise((resolve, reject) => {
    console.log(`\n> Executing: ${cmd}\n`);
    
    const childProcess = exec(cmd);
    
    childProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    childProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    childProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`\n> Command completed successfully\n`);
        resolve();
      } else {
        console.error(`\n> Command failed with code ${code}\n`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
};

// Main deployment function
async function deploy() {
  try {
    console.log('\n========== STARTING DEPLOYMENT PROCESS ==========\n');
    
    // 1. Build the client
    console.log('Step 1: Building client');
    await execPromise('cd client && npm run build');
    
    // 2. Build the server
    console.log('Step 2: Building server');
    await execPromise('cd server && npm run build');
    
    // 3. Deploy to Vercel
    console.log('Step 3: Deploying to Vercel');
    await execPromise('vercel --prod');
    
    console.log('\n========== DEPLOYMENT COMPLETED SUCCESSFULLY ==========\n');
    console.log('Fix Summary:');
    console.log('- Added PUBLIC_ROUTES constant to auth.middleware.js');
    console.log('- Modified checkAuth middleware to skip authentication for public routes');
    console.log('- This allows product listings to be viewed without authentication');
    console.log('\nTo test the fix, visit the deployed URL and verify that:');
    console.log('1. The home page loads without authentication errors');
    console.log('2. The products page shows the list of products');
    console.log('3. Protected routes like admin pages still require authentication');
    
  } catch (error) {
    console.error('\n========== DEPLOYMENT FAILED ==========\n');
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Execute the deployment
deploy(); 