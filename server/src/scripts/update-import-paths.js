/**
 * Update Import Paths Script
 * 
 * This script updates import statements in model files to add .js extension
 * for ES modules compatibility
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const modelsDir = path.join(__dirname, '..', 'models');
const controllersDir = path.join(__dirname, '..', 'controllers');
const servicesDir = path.join(__dirname, '..', 'services');
const utilsDir = path.join(__dirname, '..', 'utils');
const routesDir = path.join(__dirname, '..', 'routes');

// Process directory
function processDirectory(directory) {
  console.log(`Processing directory: ${directory}`);
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    if (file.endsWith('.js')) {
      const filePath = path.join(directory, file);
      updateImports(filePath);
    }
  });
}

// Update imports in a file
function updateImports(filePath) {
  console.log(`Updating imports in: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update import statements
    content = content.replace(/from\s+['"]([^'"]+)['"]/g, (match, importPath) => {
      // Only add .js to relative imports that don't already have a file extension
      if (importPath.startsWith('.') && !importPath.match(/\.[a-zA-Z0-9]+$/)) {
        return `from '${importPath}.js'`;
      }
      return match;
    });
    
    // Write updated content back to file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully updated: ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

// Main execution
console.log('Starting import paths update...');

// Process all directories
processDirectory(modelsDir);
processDirectory(controllersDir);
processDirectory(servicesDir);
processDirectory(utilsDir);
processDirectory(routesDir);

console.log('Import paths update completed!'); 