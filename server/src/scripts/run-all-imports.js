/**
 * GEKO XML Full Import Orchestrator
 * 
 * This script orchestrates the full import process, running all import scripts
 * in the appropriate order to ensure data consistency and proper relationships.
 * 
 * Import order:
 * 1. Products, Categories, Producers, Units, Variants (direct-import-xml.js)
 * 2. Stock data (import-stocks.js)
 * 3. Prices and Images (import-prices-images.js)
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start global timing
console.time('Complete import process');

// Get XML file path from command line args or use default
const cmdXmlFile = process.argv[2] || '../../../geko_products_en.xml';
// Resolve to absolute path
const xmlFile = path.isAbsolute(cmdXmlFile) 
  ? cmdXmlFile 
  : path.resolve(path.join(__dirname, cmdXmlFile));

// Validate XML file exists
if (!fs.existsSync(xmlFile)) {
  console.error(`ERROR: XML file not found: ${xmlFile}`);
  process.exit(1);
}

console.log("========================================");
console.log("STARTING FULL GEKO XML IMPORT PROCESS");
console.log("========================================");
console.log(`Using XML file: ${xmlFile}`);

// Array of scripts to run in sequence
const scripts = [
  { name: 'direct-import-xml.js', description: 'IMPORTING BASE DATA' },
  { name: 'import-stocks.js', description: 'IMPORTING STOCK DATA' },
  { name: 'import-prices-images.js', description: 'IMPORTING PRICES AND IMAGES' }
];

// Run scripts in sequence
async function runScripts() {
  let currentScriptIndex = 0;
  
  const runScript = (scriptIndex) => {
    if (scriptIndex >= scripts.length) {
      console.log("\n========================================");
      console.log("FULL IMPORT PROCESS COMPLETED SUCCESSFULLY");
      console.log("========================================");
      console.timeEnd('Complete import process');
      return;
    }
    
    const script = scripts[scriptIndex];
    console.log("\n========================================");
    console.log(`STEP ${scriptIndex + 1}: ${script.description}`);
    console.log("========================================\n");
    
    const scriptPath = path.join(__dirname, script.name);
    console.log(`Executing: ${scriptPath} ${xmlFile}`);
    
    const child = spawn('node', [scriptPath, xmlFile], { stdio: 'inherit' });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`Script ./${script.name} completed successfully`);
        runScript(scriptIndex + 1);
      } else {
        console.log("\n========================================");
        console.log("IMPORT PROCESS FAILED");
        console.log("========================================");
        console.error(`Error: Script ./${script.name} failed with code ${code}`);
        process.exit(1);
      }
    });
  };
  
  runScript(currentScriptIndex);
}

runScripts(); 