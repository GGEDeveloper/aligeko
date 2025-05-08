/**
 * Timestamp Compliance Checker
 * 
 * [2023-06-23 16:45] Initial version
 * 
 * This script scans documentation files to check for timestamp compliance
 * according to the documentation standards.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

// Timestamp regex pattern
const timestampPattern = /\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}\]/;
const headerTimestampPattern = /\*\*Timestamp:\*\* \[\d{4}-\d{2}-\d{2} \d{2}:\d{2}\]/;

// Define directories to scan
const dirsToScan = [
  './docs/deployment',
  './docs/database',
  './docs/branding',
  './docs/development',
  './docs'
];

// Markdown file extensions
const markdownExts = ['.md', '.markdown', '.mdown'];

async function* walkDir(dir) {
  const files = await readdir(dir);
  for (const file of files) {
    if (file === 'archive') continue; // Skip archive directory
    
    const pathToFile = path.join(dir, file);
    const stats = await stat(pathToFile);
    if (stats.isDirectory()) {
      yield* walkDir(pathToFile);
    } else if (stats.isFile() && markdownExts.includes(path.extname(pathToFile).toLowerCase())) {
      yield pathToFile;
    }
  }
}

async function checkFile(filePath) {
  console.log(`Checking ${filePath}...`);
  const content = await readFile(filePath, 'utf8');
  
  const hasTimestamp = timestampPattern.test(content);
  const hasHeaderTimestamp = headerTimestampPattern.test(content);
  
  return {
    filePath,
    hasTimestamp,
    hasHeaderTimestamp,
    compliant: hasTimestamp,
  };
}

async function main() {
  const results = {
    totalFiles: 0,
    compliantFiles: 0,
    nonCompliantFiles: []
  };
  
  for (const dir of dirsToScan) {
    try {
      for await (const filePath of walkDir(dir)) {
        results.totalFiles++;
        
        const fileCheck = await checkFile(filePath);
        if (fileCheck.compliant) {
          results.compliantFiles++;
        } else {
          results.nonCompliantFiles.push(fileCheck.filePath);
        }
      }
    } catch (err) {
      console.error(`Error scanning ${dir}:`, err);
    }
  }
  
  // Report results
  console.log('\n===== Timestamp Compliance Report =====');
  console.log(`Total markdown files scanned: ${results.totalFiles}`);
  console.log(`Compliant files: ${results.compliantFiles} (${Math.round(results.compliantFiles / results.totalFiles * 100)}%)`);
  console.log(`Non-compliant files: ${results.nonCompliantFiles.length}`);
  
  if (results.nonCompliantFiles.length > 0) {
    console.log('\nThe following files need timestamp updates:');
    results.nonCompliantFiles.forEach(file => console.log(`- ${file}`));
  }
}

// Run the script
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 