#!/usr/bin/env node

/**
 * AliTools B2B Environment Configuration Check
 * 
 * This script checks for common environment configuration issues
 * that might cause deployment problems on Vercel.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const clientDir = path.join(rootDir, 'client');

// Utility functions
const checkExists = (filePath, type = 'file') => {
  try {
    const stats = fs.statSync(filePath);
    return type === 'file' ? stats.isFile() : stats.isDirectory();
  } catch (err) {
    return false;
  }
};

const checkFileContains = (filePath, searchString) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(searchString);
  } catch (err) {
    return false;
  }
};

// Print header
console.log(chalk.blue.bold('\n🔍 AliTools B2B Environment Check\n'));

// Check 1: Project Structure
console.log(chalk.yellow('Checking project structure...'));

const requiredStructure = [
  { path: 'package.json', type: 'file' },
  { path: 'vercel.json', type: 'file' },
  { path: 'index.js', type: 'file' },
  { path: 'client', type: 'dir' },
  { path: 'client/package.json', type: 'file' },
  { path: 'client/vite.config.js', type: 'file' },
  { path: 'client/src', type: 'dir' },
];

let structureIssues = 0;
for (const item of requiredStructure) {
  const fullPath = path.join(rootDir, item.path);
  if (checkExists(fullPath, item.type)) {
    console.log(chalk.green(`✓ ${item.path} exists`));
  } else {
    console.log(chalk.red(`✗ ${item.path} not found`));
    structureIssues++;
  }
}

// Check 2: Package.json Configuration
console.log(chalk.yellow('\nChecking package.json configuration...'));

const rootPackageJson = path.join(rootDir, 'package.json');
const clientPackageJson = path.join(clientDir, 'package.json');

let packageJsonIssues = 0;

// Root package.json checks
if (checkExists(rootPackageJson)) {
  const rootPkg = JSON.parse(fs.readFileSync(rootPackageJson, 'utf8'));
  
  // Check type module
  if (rootPkg.type === 'module') {
    console.log(chalk.green('✓ Root package.json has type: module'));
  } else {
    console.log(chalk.red('✗ Root package.json missing type: module'));
    packageJsonIssues++;
  }
  
  // Check vercel-build script
  if (rootPkg.scripts && rootPkg.scripts['vercel-build']) {
    console.log(chalk.green('✓ Root package.json has vercel-build script'));
  } else {
    console.log(chalk.red('✗ Root package.json missing vercel-build script'));
    packageJsonIssues++;
  }
}

// Client package.json checks
if (checkExists(clientPackageJson)) {
  const clientPkg = JSON.parse(fs.readFileSync(clientPackageJson, 'utf8'));
  
  // Check build script
  if (clientPkg.scripts && clientPkg.scripts.build) {
    console.log(chalk.green('✓ Client package.json has build script'));
  } else {
    console.log(chalk.red('✗ Client package.json missing build script'));
    packageJsonIssues++;
  }
}

// Check 3: Vercel Configuration
console.log(chalk.yellow('\nChecking Vercel configuration...'));

const vercelJson = path.join(rootDir, 'vercel.json');
let vercelIssues = 0;

if (checkExists(vercelJson)) {
  const vercelConfig = JSON.parse(fs.readFileSync(vercelJson, 'utf8'));
  
  // Check version
  if (vercelConfig.version === 2) {
    console.log(chalk.green('✓ vercel.json has correct version'));
  } else {
    console.log(chalk.red('✗ vercel.json should have version: 2'));
    vercelIssues++;
  }
  
  // Check builds
  if (vercelConfig.builds && vercelConfig.builds.length > 0) {
    console.log(chalk.green('✓ vercel.json has builds configuration'));
  } else {
    console.log(chalk.red('✗ vercel.json missing builds configuration'));
    vercelIssues++;
  }
  
  // Check routes
  if (vercelConfig.routes && vercelConfig.routes.length > 0) {
    console.log(chalk.green('✓ vercel.json has routes configuration'));
    
    // Check for SPA route
    const hasSpaRoute = vercelConfig.routes.some(route => 
      route.src === '/(.*)'
    );
    
    if (hasSpaRoute) {
      console.log(chalk.green('✓ vercel.json has SPA route configuration'));
    } else {
      console.log(chalk.red('✗ vercel.json missing SPA route configuration'));
      vercelIssues++;
    }
  } else {
    console.log(chalk.red('✗ vercel.json missing routes configuration'));
    vercelIssues++;
  }
}

// Check 4: Vite Configuration
console.log(chalk.yellow('\nChecking Vite configuration...'));

const viteConfig = path.join(clientDir, 'vite.config.js');
let viteIssues = 0;

if (checkExists(viteConfig)) {
  // Check for base: '/'
  if (checkFileContains(viteConfig, "base: '/'") || 
      checkFileContains(viteConfig, 'base: "/"') ||
      checkFileContains(viteConfig, 'base: `/`')) {
    console.log(chalk.green('✓ vite.config.js has correct base URL configuration'));
  } else {
    console.log(chalk.red('✗ vite.config.js might be missing base: \'/\' configuration'));
    viteIssues++;
  }
  
  // Check for build configuration
  if (checkFileContains(viteConfig, 'build:') || 
      checkFileContains(viteConfig, 'build :')) {
    console.log(chalk.green('✓ vite.config.js has build configuration'));
  } else {
    console.log(chalk.red('✗ vite.config.js might be missing build configuration'));
    viteIssues++;
  }
}

// Check 5: Express Server Configuration
console.log(chalk.yellow('\nChecking Express server configuration...'));

const indexJs = path.join(rootDir, 'index.js');
let expressIssues = 0;

if (checkExists(indexJs)) {
  const content = fs.readFileSync(indexJs, 'utf8');
  
  // Check for express import
  if (content.includes('import express from')) {
    console.log(chalk.green('✓ index.js imports express'));
  } else {
    console.log(chalk.red('✗ index.js might be missing express import'));
    expressIssues++;
  }
  
  // Check for static file serving
  if (content.includes('express.static')) {
    console.log(chalk.green('✓ index.js sets up static file serving'));
  } else {
    console.log(chalk.red('✗ index.js might be missing static file serving setup'));
    expressIssues++;
  }
  
  // Check for MIME type handling
  if (content.includes('setHeaders') && 
      (content.includes('Content-Type') || content.includes('content-type'))) {
    console.log(chalk.green('✓ index.js has MIME type handling'));
  } else {
    console.log(chalk.red('✗ index.js might be missing proper MIME type handling'));
    expressIssues++;
  }
  
  // Check for SPA routing
  if (content.includes('app.get(\'*\'') || content.includes('app.get("*"')) {
    console.log(chalk.green('✓ index.js has SPA fallback route'));
  } else {
    console.log(chalk.red('✗ index.js might be missing SPA fallback route'));
    expressIssues++;
  }
}

// Final summary
console.log(chalk.blue.bold('\n📋 Final Check Summary\n'));

const totalIssues = structureIssues + packageJsonIssues + vercelIssues + viteIssues + expressIssues;

if (totalIssues === 0) {
  console.log(chalk.green.bold('✅ All checks passed! Your environment looks ready for deployment.'));
} else {
  console.log(chalk.yellow.bold(`⚠️ Found ${totalIssues} potential issue(s) that might affect deployment:`));
  
  if (structureIssues > 0) console.log(chalk.yellow(`- Project structure issues: ${structureIssues}`));
  if (packageJsonIssues > 0) console.log(chalk.yellow(`- Package.json configuration issues: ${packageJsonIssues}`));
  if (vercelIssues > 0) console.log(chalk.yellow(`- Vercel configuration issues: ${vercelIssues}`));
  if (viteIssues > 0) console.log(chalk.yellow(`- Vite configuration issues: ${viteIssues}`));
  if (expressIssues > 0) console.log(chalk.yellow(`- Express server issues: ${expressIssues}`));
  
  console.log(chalk.yellow('\nPlease refer to the detailed output above and fix these issues before deploying.'));
  console.log(chalk.yellow('For more information, see docs/deployment-guide.md'));
}

console.log('\n');

// Exit with appropriate code
process.exit(totalIssues === 0 ? 0 : 1); 