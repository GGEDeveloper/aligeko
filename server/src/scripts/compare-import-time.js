/**
 * Import Performance Comparison Utility
 * 
 * This script helps compare the performance of XML imports across different runs.
 * It takes import time measurements from log files or command output and generates
 * comparative metrics and visualizations.
 * 
 * Usage:
 * node src/scripts/compare-import-time.js [options]
 * 
 * Options:
 *   --file1=<path>    Path to the first import log file
 *   --file2=<path>    Path to the second import log file
 *   --name1=<string>  Name for the first import (default: "Before")
 *   --name2=<string>  Name for the second import (default: "After")
 *   --output=<path>   Path to save the comparison report (default: stdout)
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Configurable options
const options = {
  file1: null,
  file2: null,
  name1: 'Before',
  name2: 'After',
  output: null
};

// Parse command line arguments
process.argv.slice(2).forEach(arg => {
  const [key, value] = arg.split('=');
  if (key && value) {
    const optionKey = key.replace(/^--/, '');
    if (optionKey in options) {
      options[optionKey] = value;
    }
  }
});

// Helper function to extract timing data from a file
async function extractTimingData(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return null;
  }
  
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  const timingData = {
    xmlParsing: null,
    categoryImport: null,
    producerImport: null,
    unitImport: null,
    productImport: null,
    variantImport: null,
    priceImport: null,
    imageImport: null,
    totalImport: null,
    totalExecution: null,
    productCount: null,
    variantCount: null
  };
  
  // Regular expressions to match timing info
  const regexPatterns = {
    xmlParsing: /XML parsing: ([\d.]+)s/,
    categoryImport: /Category import: ([\d.]+)ms/,
    producerImport: /Producer import: ([\d.]+)ms/,
    unitImport: /Unit import: ([\d.]+)ms/,
    productImport: /Product import: ([\d.]+)s/,
    variantImport: /Variant import: ([\d.]+)s/,
    priceImport: /Price import: ([\d.]+)s/,
    imageImport: /Image import: ([\d.]+)s/,
    totalImport: /Total import time: ([\d.]+)s/,
    totalExecution: /Total execution time: ([\d.]+)s/,
    productCount: /Products: (\d+)/,
    variantCount: /Variants: (\d+)/
  };
  
  // Process the file line by line
  for await (const line of rl) {
    for (const [key, pattern] of Object.entries(regexPatterns)) {
      const match = line.match(pattern);
      if (match && match[1]) {
        // Convert to consistent units (ms)
        let value = parseFloat(match[1]);
        if (key.endsWith('Import') && !key.startsWith('total') && line.includes('ms')) {
          value = value / 1000; // Convert ms to seconds for consistent units
        }
        timingData[key] = value;
      }
    }
  }
  
  return timingData;
}

// Generate comparison report
async function generateComparisonReport() {
  const data1 = await extractTimingData(options.file1);
  const data2 = await extractTimingData(options.file2);
  
  if (!data1 && !data2) {
    console.error('No valid input files provided');
    return;
  }
  
  // If only one file provided, just show its data
  if (!data1 || !data2) {
    const data = data1 || data2;
    const name = data1 ? options.name1 : options.name2;
    
    console.log(`\n======== Import Performance Data (${name}) ========`);
    console.log(`Products: ${data.productCount || 'N/A'}`);
    console.log(`Variants: ${data.variantCount || 'N/A'}`);
    console.log('\nTiming Information:');
    console.log(`XML Parsing: ${data.xmlParsing ? data.xmlParsing.toFixed(2) + 's' : 'N/A'}`);
    console.log(`Category Import: ${data.categoryImport ? (data.categoryImport).toFixed(3) + 's' : 'N/A'}`);
    console.log(`Producer Import: ${data.producerImport ? (data.producerImport).toFixed(3) + 's' : 'N/A'}`);
    console.log(`Unit Import: ${data.unitImport ? (data.unitImport).toFixed(3) + 's' : 'N/A'}`);
    console.log(`Product Import: ${data.productImport ? data.productImport.toFixed(2) + 's' : 'N/A'}`);
    console.log(`Variant Import: ${data.variantImport ? data.variantImport.toFixed(2) + 's' : 'N/A'}`);
    console.log(`Total Import Time: ${data.totalImport ? data.totalImport.toFixed(2) + 's' : 'N/A'}`);
    console.log(`Total Execution Time: ${data.totalExecution ? data.totalExecution.toFixed(2) + 's' : 'N/A'}`);
    return;
  }
  
  // Generate comparison report
  const report = [
    `\n======== Import Performance Comparison ========`,
    `\nData Size:`,
    `Products: ${data1.productCount || 'N/A'} (${options.name1}) vs ${data2.productCount || 'N/A'} (${options.name2})`,
    `Variants: ${data1.variantCount || 'N/A'} (${options.name1}) vs ${data2.variantCount || 'N/A'} (${options.name2})`,
    `\nTiming Comparison:`,
  ];
  
  // Compare all timing metrics
  const metrics = [
    { key: 'xmlParsing', label: 'XML Parsing' },
    { key: 'categoryImport', label: 'Category Import' },
    { key: 'producerImport', label: 'Producer Import' },
    { key: 'unitImport', label: 'Unit Import' },
    { key: 'productImport', label: 'Product Import' },
    { key: 'variantImport', label: 'Variant Import' },
    { key: 'priceImport', label: 'Price Import' },
    { key: 'imageImport', label: 'Image Import' },
    { key: 'totalImport', label: 'Total Import Time' },
    { key: 'totalExecution', label: 'Total Execution Time' }
  ];
  
  metrics.forEach(({ key, label }) => {
    const value1 = data1[key];
    const value2 = data2[key];
    
    if (value1 !== null && value2 !== null) {
      const diff = value1 - value2;
      const percentChange = ((diff / value1) * 100).toFixed(1);
      const improvement = diff > 0 ? 'faster' : 'slower';
      
      report.push(`${label}: ${value1.toFixed(2)}s → ${value2.toFixed(2)}s (${Math.abs(percentChange)}% ${improvement})`);
    } else if (value1 !== null || value2 !== null) {
      const availableValue = value1 !== null ? `${value1.toFixed(2)}s (${options.name1})` : `${value2.toFixed(2)}s (${options.name2})`;
      report.push(`${label}: ${availableValue} (only available in one dataset)`);
    }
  });
  
  // Add summary
  if (data1.totalImport !== null && data2.totalImport !== null) {
    const totalDiff = data1.totalImport - data2.totalImport;
    const totalPercentChange = ((totalDiff / data1.totalImport) * 100).toFixed(1);
    
    report.push(`\n======== Summary ========`);
    report.push(`Overall Performance Change: ${Math.abs(totalPercentChange)}% ${totalDiff > 0 ? 'improvement' : 'regression'}`);
    report.push(`Absolute Time Saved: ${Math.abs(totalDiff).toFixed(2)} seconds per import`);
  }
  
  // Output the report
  const reportText = report.join('\n');
  if (options.output) {
    fs.writeFileSync(options.output, reportText);
    console.log(`Report saved to ${options.output}`);
  } else {
    console.log(reportText);
  }
}

// Run the comparison
generateComparisonReport().catch(err => {
  console.error('Error generating comparison report:', err);
}); 