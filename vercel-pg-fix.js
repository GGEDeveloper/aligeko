// This script creates a vercel.json file with proper configuration 
// to ensure the pg module is correctly installed

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vercel.json configuration with explicit install command that includes pg
const vercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node",
      "config": {
        "buildCommand": "npm install pg && npm install"
      }
    }
  ],
  "routes": [
    { 
      "src": "/api/(.*)", 
      "dest": "index.js" 
    },
    { 
      "src": "/(.*)", 
      "dest": "index.js" 
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
};

// Write the configuration to vercel.json
const vercelJsonPath = path.join(__dirname, 'vercel.json');
fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2));

console.log('Created vercel.json with pg dependency fix.');
console.log(`Written to: ${vercelJsonPath}`);
console.log('\nTo deploy with this fix:');
console.log('1. Run: vercel --prod');
console.log('2. Ensure NEON_DB_URL environment variable is set in Vercel dashboard.');
console.log('3. Test the API endpoint at: https://your-deployment-url/api/v1/products');

// Also create a .vercelignore file to prevent unnecessary files from being deployed
const vercelIgnorePath = path.join(__dirname, '.vercelignore');
const vercelIgnoreContent = `
# Dependencies
**/node_modules

# Build files
client/.vite

# Log files
**/*.log*

# Local env files
.env.local
.env.development.local
.env.test.local
.env.production.local

# Development files
README.md
CHANGELOG.md
.git
.github

# Documentation
docs/
`;

fs.writeFileSync(vercelIgnorePath, vercelIgnoreContent);
console.log('\nCreated .vercelignore file.');
console.log(`Written to: ${vercelIgnorePath}`); 