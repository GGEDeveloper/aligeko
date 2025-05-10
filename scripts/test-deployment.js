/**
 * Deployment Testing Script for AliTools B2B Platform
 * 
 * [2023-06-23 20:35] Initial version
 * [2023-06-23 21:17] Updated to use ES modules
 * 
 * This script tests critical endpoints after deployment to verify fixes.
 */

import fetch from 'node-fetch';
import readline from 'readline';

// Configuration
const config = {
  // Update this to your Vercel URL
  baseUrl: 'https://alitools-b2b.vercel.app',
  endpointsToTest: [
    { name: 'Products Endpoint', path: '/api/v1/products?page=1&limit=12&sortBy=created_at&sortOrder=desc' },
    { name: 'Orders Endpoint', path: '/api/v1/orders?page=1&limit=10' },
    { name: 'Homepage', path: '/' },
    { name: 'Products Page', path: '/products' }
  ],
  testAuth: true
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

// Create a readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask user for deployment URL
function askForDeploymentUrl() {
  return new Promise((resolve) => {
    rl.question(`Enter deployment URL to test [${config.baseUrl}]: `, (url) => {
      resolve(url || config.baseUrl);
    });
  });
}

// Test an endpoint
async function testEndpoint(baseUrl, endpoint) {
  const url = `${baseUrl}${endpoint.path}`;
  log(`Testing ${endpoint.name}: ${url}`, 'info');
  
  try {
    const response = await fetch(url);
    const status = response.status;
    const contentType = response.headers.get('content-type') || '';
    
    if (status >= 200 && status < 300) {
      let responseDetails = '';
      
      if (contentType.includes('application/json')) {
        const data = await response.json();
        responseDetails = `Response includes ${Object.keys(data).join(', ')}`;
        
        // For product endpoint, check for products array
        if (endpoint.path.includes('/products') && Array.isArray(data.products)) {
          responseDetails += `\n  Found ${data.products.length} products`;
        }
      }
      
      log(`${endpoint.name}: SUCCESS (${status})${responseDetails ? '\n  ' + responseDetails : ''}`, 'success');
      return { success: true, status, endpoint: endpoint.name };
    } else {
      log(`${endpoint.name}: FAILED with status ${status}`, 'error');
      return { success: false, status, endpoint: endpoint.name };
    }
  } catch (error) {
    log(`${endpoint.name}: ERROR ${error.message}`, 'error');
    return { success: false, error: error.message, endpoint: endpoint.name };
  }
}

// Main execution
async function main() {
  try {
    log('Starting deployment tests for AliTools B2B platform', 'step');
    
    // Get deployment URL from user
    const deploymentUrl = await askForDeploymentUrl();
    log(`Testing deployment at: ${deploymentUrl}`, 'info');
    
    // Test all endpoints
    log('Testing API endpoints...', 'step');
    
    const results = [];
    
    for (const endpoint of config.endpointsToTest) {
      const result = await testEndpoint(deploymentUrl, endpoint);
      results.push(result);
    }
    
    // Display summary
    log('Test Results Summary', 'step');
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;
    
    log(`Total Endpoints Tested: ${results.length}`, 'info');
    log(`Successful: ${successCount}`, successCount === results.length ? 'success' : 'info');
    
    if (failCount > 0) {
      log(`Failed: ${failCount}`, 'error');
      log('Failed Endpoints:', 'error');
      results.filter(r => !r.success).forEach(r => {
        log(`  - ${r.endpoint}`, 'error');
      });
    }
    
    if (successCount === results.length) {
      log('All tests PASSED! The deployment appears to be working correctly.', 'success');
    } else {
      log('Some tests FAILED. The deployment may need further investigation.', 'warning');
    }
    
    rl.close();
    
  } catch (error) {
    log(`Test process failed: ${error.message}`, 'error');
    rl.close();
    process.exit(1);
  }
}

main(); 