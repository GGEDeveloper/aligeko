// Test script for verifying API endpoints after deployment
import fetch from 'node-fetch';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Test endpoints
async function testEndpoint(baseUrl, endpoint, method = 'GET', token = null) {
  try {
    const url = `${baseUrl}${endpoint}`;
    console.log(`${colors.blue}Testing: ${method} ${url}${colors.reset}`);

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
    });

    const status = response.status;
    let data;
    
    try {
      data = await response.json();
    } catch (e) {
      data = { error: 'Could not parse JSON response' };
    }

    const isSuccess = status >= 200 && status < 300;
    const statusColor = isSuccess ? colors.green : colors.red;

    console.log(`${statusColor}Status: ${status}${colors.reset}`);
    console.log(`${colors.cyan}Response:${colors.reset}`, JSON.stringify(data, null, 2));
    console.log('-'.repeat(50));

    return { status, data, success: isSuccess };
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error.message);
    console.log('-'.repeat(50));
    return { status: 500, data: { error: error.message }, success: false };
  }
}

// Main testing function
async function runTests() {
  // Get deployment URL
  const deploymentUrl = await new Promise((resolve) => {
    rl.question(`${colors.yellow}Enter the deployment URL (e.g., https://aligekow-xxxxx.vercel.app):${colors.reset} `, (answer) => {
      resolve(answer.trim());
    });
  });

  console.log(`\n${colors.magenta}Testing public endpoints (should work without authentication)${colors.reset}`);
  
  // Test public endpoints
  await testEndpoint(deploymentUrl, '/health');
  await testEndpoint(deploymentUrl, '/api/v1/products');
  await testEndpoint(deploymentUrl, '/api/v1/products/1');
  await testEndpoint(deploymentUrl, '/api/v1/company-info');

  // Ask if user wants to test protected endpoints
  const testProtected = await new Promise((resolve) => {
    rl.question(`\n${colors.yellow}Do you want to test protected endpoints? (y/n):${colors.reset} `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });

  if (testProtected) {
    // Get JWT token
    const token = await new Promise((resolve) => {
      rl.question(`\n${colors.yellow}Enter a valid JWT token for authentication:${colors.reset} `, (answer) => {
        resolve(answer.trim());
      });
    });

    console.log(`\n${colors.magenta}Testing protected endpoints (should require authentication)${colors.reset}`);
    
    // Test protected endpoints
    await testEndpoint(deploymentUrl, '/api/v1/orders', 'GET', token);
    await testEndpoint(deploymentUrl, '/api/v1/customers', 'GET', token);
  }

  console.log(`\n${colors.green}Testing completed!${colors.reset}`);
  rl.close();
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Error running tests:${colors.reset}`, error);
  rl.close();
}); 