/**
 * Database Persistence Service Test Script
 * 
 * This script tests the optimized database persistence service by:
 * 1. Reading an XML file
 * 2. Parsing it with GekoXmlParser
 * 3. Persisting the data using the new DatabasePersistenceService
 * 4. Reporting detailed performance metrics
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import GekoXmlParser from '../utils/geko-xml-parser.js';
import GekoImportService from '../services/geko-import-service.js';
import DatabasePersistenceService from '../services/database-persistence.service.js';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '../../../.env');
console.log(`Loading environment variables from: ${envPath}`);
dotenv.config({ path: envPath });

/**
 * Performance testing options
 */
const testOptions = {
  batchSizes: [100, 500, 1000],
  skipImages: false,
  updateExisting: true,
  memoryManagement: true,
  numberOfRuns: 1  // Number of times to run each test
};

/**
 * Run a test with specific options
 */
async function runTest(xmlFilePath, options) {
  console.log('========================================');
  console.log(`TEST RUN: Batch Size=${options.batchSize}`);
  console.log('========================================');
  
  try {
    // Read XML file
    console.time('XML file reading');
    const xmlData = fs.readFileSync(xmlFilePath, 'utf8');
    console.timeEnd('XML file reading');
    console.log(`File size: ${(xmlData.length / (1024 * 1024)).toFixed(2)} MB`);
    
    // Parse XML data
    console.time('XML parsing');
    const gekoParser = new GekoXmlParser();
    const transformedData = await gekoParser.parse(xmlData);
    console.timeEnd('XML parsing');
    console.log(`Parsed ${transformedData.products.length} products`);
    
    // Free memory
    const xmlDataSize = xmlData.length;
    xmlData = null;
    global.gc && global.gc();
    
    // Create GekoImportService instance
    const importService = new GekoImportService();
    
    // Persist data using the optimized service
    console.time('Database persistence');
    const result = await importService.persistTransformedData(transformedData, options);
    console.timeEnd('Database persistence');
    
    // Print performance metrics
    console.log('========================================');
    console.log('PERFORMANCE METRICS');
    console.log('========================================');
    console.log(`Batch size: ${options.batchSize}`);
    console.log(`Total time: ${result.totalTime.toFixed(2)} seconds`);
    console.log(`Records per second: ${result.recordsPerSecond}`);
    console.log(`XML size: ${(xmlDataSize / (1024 * 1024)).toFixed(2)} MB`);
    
    // Entity metrics
    console.log('========================================');
    console.log('ENTITY COUNTS');
    console.log('========================================');
    Object.entries(result.entityCounts).forEach(([entity, count]) => {
      if (count > 0) {
        console.log(`${entity}: ${count}`);
      }
    });
    
    // Created/updated counts
    if (result.stats?.created) {
      console.log('========================================');
      console.log('CREATED RECORDS');
      console.log('========================================');
      Object.entries(result.stats.created).forEach(([entity, count]) => {
        console.log(`${entity}: ${count}`);
      });
    }
    
    if (result.stats?.updated) {
      console.log('========================================');
      console.log('UPDATED RECORDS');
      console.log('========================================');
      Object.entries(result.stats.updated).forEach(([entity, count]) => {
        if (count > 0) {
          console.log(`${entity}: ${count}`);
        }
      });
    }
    
    return result;
  } catch (error) {
    console.error(`Test run failed: ${error.message}`);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

/**
 * Main function to run performance tests
 */
async function main() {
  // Get command line arguments
  const xmlFilePath = process.argv[2];
  if (!xmlFilePath) {
    console.error('Please provide a path to the XML file as a command line argument');
    process.exit(1);
  }
  
  // Check if file exists
  if (!fs.existsSync(xmlFilePath)) {
    console.error(`ERROR: File not found: ${xmlFilePath}`);
    process.exit(1);
  }
  
  console.log('========================================');
  console.log('DATABASE PERSISTENCE PERFORMANCE TEST');
  console.log('========================================');
  console.log(`Using XML file: ${xmlFilePath}`);
  
  const results = [];
  
  // Run tests with different batch sizes
  for (const batchSize of testOptions.batchSizes) {
    for (let run = 0; run < testOptions.numberOfRuns; run++) {
      const options = {
        batchSize,
        skipImages: testOptions.skipImages,
        updateExisting: testOptions.updateExisting,
        memoryManagement: testOptions.memoryManagement,
        runNumber: run + 1
      };
      
      const result = await runTest(xmlFilePath, options);
      results.push({
        batchSize,
        runNumber: run + 1,
        ...result
      });
      
      // Sleep between runs to let system stabilize
      if (run < testOptions.numberOfRuns - 1) {
        console.log('Waiting between test runs...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  
  // Display comparison of results
  console.log('========================================');
  console.log('PERFORMANCE COMPARISON');
  console.log('========================================');
  
  results.forEach(result => {
    if (result.success) {
      console.log(`Batch size ${result.batchSize} (Run ${result.runNumber}): ${result.totalTime.toFixed(2)}s, ${result.recordsPerSecond} records/sec`);
    } else {
      console.log(`Batch size ${result.batchSize} (Run ${result.runNumber}): FAILED - ${result.error}`);
    }
  });
  
  // Find optimal batch size
  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length > 0) {
    const optimal = successfulResults.reduce((best, current) => {
      return (current.recordsPerSecond > best.recordsPerSecond) ? current : best;
    });
    
    console.log('========================================');
    console.log(`OPTIMAL BATCH SIZE: ${optimal.batchSize}`);
    console.log(`Best performance: ${optimal.totalTime.toFixed(2)}s, ${optimal.recordsPerSecond} records/sec`);
    console.log('========================================');
  }
  
  console.log('Performance testing completed.');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
}); 