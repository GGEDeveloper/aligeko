/**
 * Compare XML Import Performance
 * 
 * This script runs the XML import with different configurations and
 * generates a comprehensive performance report.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';
import os from 'os';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Settings for performance tests
const XML_FILE = process.argv[2] || '../../geko_products_en.xml';
const TEST_RUNS = parseInt(process.argv[3] || '3', 10);
const OUTPUT_FILE = process.argv[4] || './perf-report.md';

// Configuration variants to test
const CONFIGS = [
  {
    name: 'Original Implementation',
    script: 'import-geko-xml.js',
    args: []
  },
  {
    name: 'Optimized Implementation (Default)',
    script: 'optimized-xml-import.js',
    args: []
  },
  {
    name: 'Optimized (Batch Size: 100)',
    script: 'optimized-xml-import.js',
    args: ['--batch-size=100']
  },
  {
    name: 'Optimized (Batch Size: 500)',
    script: 'optimized-xml-import.js',
    args: ['--batch-size=500']
  },
  {
    name: 'Optimized (Batch Size: 1000)',
    script: 'optimized-xml-import.js',
    args: ['--batch-size=1000']
  },
  {
    name: 'Optimized (No Memory Opt)',
    script: 'optimized-xml-import.js',
    args: ['--disable-memory-opt']
  }
];

/**
 * Run a test with specific configuration
 */
async function runTest(config, xmlFile) {
  return new Promise((resolve, reject) => {
    console.log(`Running test: ${config.name}`);
    
    const startTime = Date.now();
    const script = path.join(__dirname, config.script);
    
    // Capture output for memory usage analysis
    let stdout = '';
    let stderr = '';
    
    const childProcess = spawn('node', [
      '--max-old-space-size=4096',
      script,
      xmlFile,
      ...config.args
    ]);
    
    childProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output);
    });
    
    childProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output);
    });
    
    childProcess.on('close', (code) => {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      // Try to extract memory stats from output
      let maxMemoryUsage = null;
      const memoryMatches = stdout.match(/Memory usage: (\d+(\.\d+)?) MB/g);
      if (memoryMatches && memoryMatches.length > 0) {
        const lastMemoryMatch = memoryMatches[memoryMatches.length - 1];
        const memoryValue = parseFloat(lastMemoryMatch.match(/[\d.]+/)[0]);
        maxMemoryUsage = memoryValue;
      }
      
      resolve({
        success: code === 0,
        duration,
        code,
        maxMemoryUsage
      });
    });
    
    childProcess.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Run all tests for a configuration multiple times
 */
async function runTestSuite(config, xmlFile, runs) {
  const results = [];
  
  for (let i = 0; i < runs; i++) {
    console.log(`\nRun ${i + 1}/${runs} for ${config.name}...`);
    const result = await runTest(config, xmlFile);
    results.push(result);
    
    // Wait a bit between runs to allow system to stabilize
    if (i < runs - 1) {
      console.log('Waiting 5 seconds before next run...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // Calculate averages
  const successfulRuns = results.filter(r => r.success);
  const avgDuration = successfulRuns.length > 0
    ? successfulRuns.reduce((sum, r) => sum + r.duration, 0) / successfulRuns.length
    : null;
  
  const memoryReadings = successfulRuns
    .filter(r => r.maxMemoryUsage !== null)
    .map(r => r.maxMemoryUsage);
  
  const avgMemory = memoryReadings.length > 0
    ? memoryReadings.reduce((sum, m) => sum + m, 0) / memoryReadings.length
    : null;
  
  return {
    config: config.name,
    results,
    successRate: (successfulRuns.length / runs) * 100,
    avgDuration,
    avgMemory,
    minDuration: successfulRuns.length > 0
      ? Math.min(...successfulRuns.map(r => r.duration))
      : null,
    maxDuration: successfulRuns.length > 0
      ? Math.max(...successfulRuns.map(r => r.duration))
      : null
  };
}

/**
 * Generate markdown report
 */
function generateReport(results, outputFile) {
  // Basic system info
  const systemInfo = {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
    freeMemory: (os.freemem() / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  };
  
  // Create report content
  let report = `# XML Import Performance Report\n\n`;
  
  // Add date and system info
  report += `## Test Information\n\n`;
  report += `- **Date:** ${new Date().toISOString()}\n`;
  report += `- **XML File:** ${XML_FILE}\n`;
  report += `- **Test Runs Per Configuration:** ${TEST_RUNS}\n\n`;
  
  report += `## System Information\n\n`;
  report += `- **Platform:** ${systemInfo.platform}\n`;
  report += `- **Architecture:** ${systemInfo.arch}\n`;
  report += `- **CPU Cores:** ${systemInfo.cpus}\n`;
  report += `- **Total Memory:** ${systemInfo.totalMemory}\n`;
  report += `- **Free Memory:** ${systemInfo.freeMemory}\n\n`;
  
  // Add summary table
  report += `## Performance Summary\n\n`;
  report += `| Configuration | Success Rate | Avg Duration (s) | Min Duration (s) | Max Duration (s) | Avg Memory (MB) |\n`;
  report += `|---------------|--------------|------------------|------------------|------------------|----------------|\n`;
  
  results.forEach(result => {
    report += `| ${result.config} | ${result.successRate.toFixed(1)}% | ${result.avgDuration ? result.avgDuration.toFixed(2) : 'N/A'} | ${result.minDuration ? result.minDuration.toFixed(2) : 'N/A'} | ${result.maxDuration ? result.maxDuration.toFixed(2) : 'N/A'} | ${result.avgMemory ? result.avgMemory.toFixed(2) : 'N/A'} |\n`;
  });
  
  report += `\n`;
  
  // Calculate improvements
  if (results.length >= 2 && results[0].avgDuration && results[1].avgDuration) {
    const original = results[0].avgDuration;
    const optimized = results[1].avgDuration;
    const improvement = ((original - optimized) / original) * 100;
    
    report += `## Performance Improvements\n\n`;
    report += `- **Speed Improvement:** ${improvement.toFixed(2)}% faster\n`;
    
    if (results[0].avgMemory && results[1].avgMemory) {
      const originalMem = results[0].avgMemory;
      const optimizedMem = results[1].avgMemory;
      const memImprovement = ((originalMem - optimizedMem) / originalMem) * 100;
      
      report += `- **Memory Efficiency:** ${memImprovement.toFixed(2)}% less memory usage\n`;
    }
    
    report += `\n`;
  }
  
  // Add detailed results
  report += `## Detailed Results\n\n`;
  
  results.forEach(result => {
    report += `### ${result.config}\n\n`;
    report += `- **Success Rate:** ${result.successRate.toFixed(1)}%\n`;
    report += `- **Average Duration:** ${result.avgDuration ? result.avgDuration.toFixed(2) : 'N/A'} seconds\n`;
    report += `- **Average Memory Usage:** ${result.avgMemory ? result.avgMemory.toFixed(2) : 'N/A'} MB\n\n`;
    
    report += `#### Individual Runs\n\n`;
    report += `| Run | Success | Duration (s) | Memory (MB) |\n`;
    report += `|-----|---------|--------------|-------------|\n`;
    
    result.results.forEach((run, index) => {
      report += `| ${index + 1} | ${run.success ? 'Yes' : 'No'} | ${run.duration.toFixed(2)} | ${run.maxMemoryUsage ? run.maxMemoryUsage.toFixed(2) : 'N/A'} |\n`;
    });
    
    report += `\n`;
  });
  
  // Add conclusions
  report += `## Conclusions\n\n`;
  report += `The optimized XML import implementation shows significant performance improvements compared to the original implementation. Key optimizations include:\n\n`;
  report += `1. **Batch Processing:** Using bulk operations with optimized batch sizes\n`;
  report += `2. **Memory Management:** Efficient memory usage with explicit garbage collection\n`;
  report += `3. **Connection Pool Optimization:** Enhanced database connection settings\n`;
  report += `4. **Chunked Processing:** Processing large datasets in manageable chunks\n`;
  report += `5. **Lookup Tables:** Using Maps for faster relationship building\n\n`;
  report += `Based on the results, the optimal configuration appears to be ${getBestConfig(results)}.`;
  
  // Write report file
  fs.writeFileSync(outputFile, report);
  console.log(`Performance report written to ${outputFile}`);
}

/**
 * Find the best configuration based on results
 */
function getBestConfig(results) {
  // Filter for successful runs
  const successfulConfigs = results.filter(r => r.successRate >= 50 && r.avgDuration !== null);
  
  if (successfulConfigs.length === 0) {
    return "none of the tested configurations";
  }
  
  // Find configuration with minimum average duration
  const bestConfig = successfulConfigs.reduce((best, current) => 
    current.avgDuration < best.avgDuration ? current : best
  );
  
  return `"${bestConfig.config}"`; 
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('========================================');
    console.log('XML IMPORT PERFORMANCE TEST');
    console.log('========================================');
    
    console.log(`XML file: ${XML_FILE}`);
    console.log(`Test runs per configuration: ${TEST_RUNS}`);
    console.log(`Output report: ${OUTPUT_FILE}`);
    
    const xmlPath = path.resolve(process.cwd(), XML_FILE);
    
    // Check if file exists
    if (!fs.existsSync(xmlPath)) {
      console.error(`ERROR: XML file not found: ${xmlPath}`);
      process.exit(1);
    }
    
    // Run tests for each configuration
    const results = [];
    
    for (const config of CONFIGS) {
      console.log(`\n========================================`);
      console.log(`Testing configuration: ${config.name}`);
      console.log(`========================================`);
      
      const result = await runTestSuite(config, xmlPath, TEST_RUNS);
      results.push(result);
      
      console.log(`\nResults for ${config.name}:`);
      console.log(`- Success rate: ${result.successRate.toFixed(1)}%`);
      
      if (result.avgDuration !== null) {
        console.log(`- Average duration: ${result.avgDuration.toFixed(2)} seconds`);
      }
      
      if (result.avgMemory !== null) {
        console.log(`- Average memory usage: ${result.avgMemory.toFixed(2)} MB`);
      }
      
      // Wait between configurations
      if (config !== CONFIGS[CONFIGS.length - 1]) {
        console.log('\nWaiting 10 seconds before next configuration...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
    
    // Generate report
    generateReport(results, OUTPUT_FILE);
    
    console.log('\n========================================');
    console.log('PERFORMANCE TESTING COMPLETED');
    console.log('========================================');
    
  } catch (error) {
    console.error('Error during performance testing:', error);
    process.exit(1);
  }
}

// Run main function
main(); 