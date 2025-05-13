/**
 * Test Optimized XML Import
 * 
 * This script tests the optimized XML import implementation with various parameters
 * and measures performance metrics.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

// Default XML file path
const DEFAULT_XML_FILE = process.argv[2] || '../../geko_products_en.xml';

// Available test modes
const TEST_MODES = {
  FULL: 'full',         // Full import with all options
  PERF: 'performance',  // Performance comparison
  MEMORY: 'memory',     // Memory usage optimization test
  BATCH: 'batch',       // Batch size comparison
  VALIDATE: 'validate'  // Validation of imported data
};

// Get test mode from command line
const testMode = process.argv[3] || TEST_MODES.VALIDATE;

/**
 * Run XML import with provided options and measure performance
 */
async function runImport(xmlFile, options = []) {
  return new Promise((resolve, reject) => {
    console.log(`Running import with options: ${options.join(' ')}`);
    
    const startTime = Date.now();
    const importScript = path.join(__dirname, 'optimized-xml-import.js');
    
    const args = [importScript, xmlFile, ...options];
    const importProcess = spawn('node', args, {
      stdio: 'inherit'
    });
    
    importProcess.on('close', (code) => {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      if (code === 0) {
        console.log(`Import completed successfully in ${duration.toFixed(2)} seconds`);
        resolve({ success: true, duration });
      } else {
        console.error(`Import failed with code ${code}`);
        resolve({ success: false, duration, code });
      }
    });
    
    importProcess.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Verify database data after import
 */
async function validateData() {
  try {
    console.log('Validating imported data...');
    
    // Run the validation script
    const validationScript = path.join(__dirname, 'check-db-data.js');
    
    return new Promise((resolve, reject) => {
      const validationProcess = spawn('node', [validationScript], {
        stdio: 'inherit'
      });
      
      validationProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Validation completed successfully');
          resolve(true);
        } else {
          console.error(`Validation failed with code ${code}`);
          resolve(false);
        }
      });
      
      validationProcess.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error validating data:', error);
    return false;
  }
}

/**
 * Compare performance with different batch sizes
 */
async function batchSizeComparison(xmlFile) {
  const batchSizes = [10, 50, 100, 500, 1000];
  const results = [];
  
  console.log('Running batch size comparison test...');
  
  for (const batchSize of batchSizes) {
    console.log(`\nTesting batch size: ${batchSize}`);
    const result = await runImport(xmlFile, [`--batch-size=${batchSize}`]);
    
    results.push({
      batchSize,
      duration: result.duration,
      success: result.success
    });
  }
  
  // Print comparison results
  console.log('\nBatch Size Comparison Results:');
  console.log('-----------------------------');
  console.log('Batch Size | Duration (s) | Status');
  console.log('-----------------------------');
  
  results.forEach(result => {
    console.log(`${result.batchSize.toString().padEnd(10)} | ${result.duration.toFixed(2).padEnd(12)} | ${result.success ? 'Success' : 'Failed'}`);
  });
  
  // Find optimal batch size
  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length > 0) {
    const optimal = successfulResults.reduce((prev, current) => 
      (prev.duration < current.duration) ? prev : current
    );
    
    console.log(`\nOptimal batch size: ${optimal.batchSize} (${optimal.duration.toFixed(2)} seconds)`);
  } else {
    console.log('\nNo successful imports to determine optimal batch size');
  }
}

/**
 * Test memory optimization features
 */
async function memoryOptimizationTest(xmlFile) {
  console.log('Running memory optimization test...');
  
  // Test without memory optimizations
  console.log('\nRunning import WITHOUT memory optimizations:');
  const withoutOpt = await runImport(xmlFile, ['--disable-memory-opt']);
  
  // Test with memory optimizations
  console.log('\nRunning import WITH memory optimizations:');
  const withOpt = await runImport(xmlFile, ['--enable-memory-opt']);
  
  // Compare results
  console.log('\nMemory Optimization Results:');
  console.log('-----------------------------');
  console.log('Configuration    | Duration (s) | Status');
  console.log('-----------------------------');
  console.log(`Without Optimizations | ${withoutOpt.duration.toFixed(2)} | ${withoutOpt.success ? 'Success' : 'Failed'}`);
  console.log(`With Optimizations    | ${withOpt.duration.toFixed(2)} | ${withOpt.success ? 'Success' : 'Failed'}`);
  
  if (withoutOpt.success && withOpt.success) {
    const improvement = ((withoutOpt.duration - withOpt.duration) / withoutOpt.duration) * 100;
    console.log(`\nPerformance improvement: ${improvement.toFixed(2)}%`);
  }
}

/**
 * Full performance comparison with old implementation
 */
async function performanceComparison(xmlFile) {
  console.log('Running performance comparison test...');
  
  // Test old implementation
  console.log('\nRunning original import implementation:');
  const oldImport = path.join(__dirname, 'import-geko-xml.js');
  
  const oldResult = await new Promise((resolve, reject) => {
    const startTime = Date.now();
    const importProcess = spawn('node', [oldImport, xmlFile], {
      stdio: 'inherit'
    });
    
    importProcess.on('close', (code) => {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      resolve({
        success: code === 0,
        duration,
        code
      });
    });
    
    importProcess.on('error', (error) => {
      reject(error);
    });
  });
  
  // Test new implementation
  console.log('\nRunning optimized import implementation:');
  const newResult = await runImport(xmlFile);
  
  // Compare results
  console.log('\nPerformance Comparison Results:');
  console.log('-----------------------------');
  console.log('Implementation | Duration (s) | Status');
  console.log('-----------------------------');
  console.log(`Original       | ${oldResult.duration.toFixed(2)} | ${oldResult.success ? 'Success' : 'Failed'}`);
  console.log(`Optimized      | ${newResult.duration.toFixed(2)} | ${newResult.success ? 'Success' : 'Failed'}`);
  
  if (oldResult.success && newResult.success) {
    const improvement = ((oldResult.duration - newResult.duration) / oldResult.duration) * 100;
    console.log(`\nPerformance improvement: ${improvement.toFixed(2)}%`);
  }
}

/**
 * Run comprehensive tests
 */
async function runFullTest(xmlFile) {
  console.log('Running full test suite...');
  
  // Test standard import
  console.log('\n1. Standard Import Test');
  await runImport(xmlFile);
  
  // Validate imported data
  console.log('\n2. Data Validation Test');
  await validateData();
  
  // Batch size comparison
  console.log('\n3. Batch Size Comparison');
  await batchSizeComparison(xmlFile);
  
  // Memory optimization test
  console.log('\n4. Memory Optimization Test');
  await memoryOptimizationTest(xmlFile);
  
  // Performance comparison
  console.log('\n5. Performance Comparison');
  await performanceComparison(xmlFile);
  
  console.log('\nAll tests completed');
}

/**
 * Main function
 */
async function main() {
  console.log('========================================');
  console.log('XML IMPORT TEST SUITE');
  console.log('========================================');
  
  const xmlFile = path.resolve(process.cwd(), DEFAULT_XML_FILE);
  
  // Check if file exists
  if (!fs.existsSync(xmlFile)) {
    console.error(`ERROR: XML file not found: ${xmlFile}`);
    process.exit(1);
  }
  
  console.log(`Using XML file: ${xmlFile}`);
  console.log(`Test mode: ${testMode}`);
  
  // Run selected test
  switch (testMode) {
    case TEST_MODES.FULL:
      await runFullTest(xmlFile);
      break;
    case TEST_MODES.PERF:
      await performanceComparison(xmlFile);
      break;
    case TEST_MODES.MEMORY:
      await memoryOptimizationTest(xmlFile);
      break;
    case TEST_MODES.BATCH:
      await batchSizeComparison(xmlFile);
      break;
    case TEST_MODES.VALIDATE:
      await runImport(xmlFile);
      await validateData();
      break;
    default:
      console.error(`Invalid test mode: ${testMode}`);
      console.log(`Available modes: ${Object.values(TEST_MODES).join(', ')}`);
      process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
}); 