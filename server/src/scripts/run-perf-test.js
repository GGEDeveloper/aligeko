/**
 * Performance Test Script for XML Import
 * 
 * This script benchmarks XML import performance with different batch sizes
 * and optimization strategies.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import { GekoXmlParser } from '../utils/geko-xml-parser.js';

// Use ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Configuration
const DEFAULT_XML_FILE = path.resolve(__dirname, '../../../geko_products_en.xml');
const BATCH_SIZES = [100, 500, 1000, 2000];
const RUNS_PER_BATCH_SIZE = 3;

/**
 * Run a single performance test with a specific batch size
 * @param {string} xmlFilePath - Path to the XML file to import
 * @param {number} batchSize - Batch size to use for the import
 * @returns {Object} - Performance metrics
 */
async function runPerformanceTest(xmlFilePath, batchSize) {
  console.log(`\n=== Running test with batch size: ${batchSize} ===`);
  
  try {
    // Set up test
    const xmlData = fs.readFileSync(xmlFilePath, 'utf8');
    console.log(`XML file loaded: ${(xmlData.length / (1024 * 1024)).toFixed(2)} MB`);
    
    // Initialize parser
    const parser = new GekoXmlParser({
      batchSize,
      enableLogging: false // Disable logging for clean performance metrics
    });
    
    // Measure parsing performance
    console.time('XML parsing');
    const parseStartMemory = process.memoryUsage().heapUsed;
    const parseStartTime = Date.now();
    
    const transformedData = await parser.parseXml(xmlData);
    
    const parseEndTime = Date.now();
    const parseEndMemory = process.memoryUsage().heapUsed;
    console.timeEnd('XML parsing');
    
    // Print metrics
    const productCount = transformedData.products.length;
    const parseTimeMs = parseEndTime - parseStartTime;
    const memoryUsedMB = (parseEndMemory - parseStartMemory) / (1024 * 1024);
    
    console.log(`Products processed: ${productCount}`);
    console.log(`Parse time: ${parseTimeMs} ms (${(parseTimeMs / 1000).toFixed(2)} seconds)`);
    console.log(`Products per second: ${Math.round(productCount / (parseTimeMs / 1000))}`);
    console.log(`Memory used: ${memoryUsedMB.toFixed(2)} MB`);
    
    // Free memory
    global.gc && global.gc();
    
    return {
      batchSize,
      productCount,
      parseTimeMs,
      productsPerSecond: Math.round(productCount / (parseTimeMs / 1000)),
      memoryUsedMB
    };
  } catch (error) {
    console.error(`Performance test failed: ${error.message}`);
    console.error(error.stack);
    return {
      batchSize,
      error: error.message
    };
  }
}

/**
 * Run a full performance test suite with different batch sizes
 * @param {string} xmlFilePath - Path to the XML file to import
 */
async function runPerformanceTestSuite(xmlFilePath) {
  console.log(`\n===== XML IMPORT PERFORMANCE TEST SUITE =====`);
  console.log(`XML file: ${xmlFilePath}`);
  console.log(`Runs per batch size: ${RUNS_PER_BATCH_SIZE}`);
  console.log(`===============================================\n`);
  
  const results = [];
  
  // Test each batch size multiple times
  for (const batchSize of BATCH_SIZES) {
    const batchResults = [];
    
    for (let i = 0; i < RUNS_PER_BATCH_SIZE; i++) {
      console.log(`Run ${i + 1}/${RUNS_PER_BATCH_SIZE} for batch size ${batchSize}`);
      const result = await runPerformanceTest(xmlFilePath, batchSize);
      batchResults.push(result);
      
      // Small delay between runs to allow for GC
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Calculate average metrics for this batch size
    const successfulRuns = batchResults.filter(r => !r.error);
    if (successfulRuns.length > 0) {
      const avgParseTimeMs = successfulRuns.reduce((sum, r) => sum + r.parseTimeMs, 0) / successfulRuns.length;
      const avgProductsPerSecond = successfulRuns.reduce((sum, r) => sum + r.productsPerSecond, 0) / successfulRuns.length;
      const avgMemoryUsedMB = successfulRuns.reduce((sum, r) => sum + r.memoryUsedMB, 0) / successfulRuns.length;
      
      results.push({
        batchSize,
        avgParseTimeMs,
        avgProductsPerSecond,
        avgMemoryUsedMB,
        runs: successfulRuns.length
      });
    }
  }
  
  // Print summary
  console.log(`\n===== PERFORMANCE TEST SUMMARY =====`);
  console.table(results);
  
  // Determine optimal batch size based on products per second
  const bestResult = results.reduce((best, current) => {
    return current.avgProductsPerSecond > best.avgProductsPerSecond ? current : best;
  }, results[0]);
  
  console.log(`\nRecommended optimal batch size: ${bestResult.batchSize}`);
  console.log(`Average parse time: ${(bestResult.avgParseTimeMs / 1000).toFixed(2)} seconds`);
  console.log(`Average products per second: ${Math.round(bestResult.avgProductsPerSecond)}`);
  console.log(`Average memory used: ${bestResult.avgMemoryUsedMB.toFixed(2)} MB`);
}

/**
 * Main function
 */
async function main() {
  const xmlFilePath = process.argv[2] || DEFAULT_XML_FILE;
  
  if (!fs.existsSync(xmlFilePath)) {
    console.error(`XML file not found: ${xmlFilePath}`);
    console.log(`Usage: node run-perf-test.js [path-to-xml-file]`);
    process.exit(1);
  }
  
  try {
    await runPerformanceTestSuite(xmlFilePath);
    console.log('\nPerformance tests completed successfully.');
  } catch (error) {
    console.error(`Performance tests failed: ${error.message}`);
    console.error(error.stack);
  } finally {
    // Close database connection
    await sequelize.close();
  }
}

// Run the main function
main(); 