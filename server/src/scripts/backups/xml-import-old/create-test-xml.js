/**
 * Create Test XML
 * 
 * This script creates a smaller test XML file from the full GEKO XML file
 * for faster testing of the import process.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import xml2js from 'xml2js';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default values
const FULL_XML_FILE = process.argv[2] || '../../geko_products_en.xml';
const PRODUCT_COUNT = parseInt(process.argv[3] || '100', 10);
const OUTPUT_FILE = process.argv[4] || './test-data.xml';

async function main() {
  try {
    console.log('Creating test XML file...');
    console.log(`Source file: ${FULL_XML_FILE}`);
    console.log(`Product count: ${PRODUCT_COUNT}`);
    console.log(`Output file: ${OUTPUT_FILE}`);
    
    // Verify source file exists
    const sourcePath = path.resolve(process.cwd(), FULL_XML_FILE);
    if (!fs.existsSync(sourcePath)) {
      console.error(`ERROR: Source file not found: ${sourcePath}`);
      process.exit(1);
    }
    
    // Read source file
    console.log('Reading source XML file...');
    const xmlData = fs.readFileSync(sourcePath, 'utf8');
    console.log(`Source file size: ${(xmlData.length / (1024 * 1024)).toFixed(2)} MB`);
    
    // Parse XML
    console.log('Parsing XML...');
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true
    });
    
    const result = await parser.parseStringPromise(xmlData);
    
    // Get products array
    const productsContainer = result.geko?.products || result.offer?.products;
    if (!productsContainer) {
      console.error('ERROR: Invalid XML structure, products container not found');
      process.exit(1);
    }
    
    let products = productsContainer.product;
    if (!Array.isArray(products)) {
      products = [products];
    }
    
    console.log(`Total products in source file: ${products.length}`);
    
    // Create subset
    const productCount = Math.min(PRODUCT_COUNT, products.length);
    const subset = products.slice(0, productCount);
    
    console.log(`Selecting ${subset.length} products for test file`);
    
    // Create new XML structure
    const newXml = {
      geko: {
        products: {
          product: subset
        }
      }
    };
    
    // Convert back to XML
    console.log('Converting to XML...');
    const builder = new xml2js.Builder({
      headless: false,
      renderOpts: { pretty: true, indent: '  ' }
    });
    
    const xmlString = builder.buildObject(newXml);
    
    // Write output file
    console.log(`Writing test file: ${OUTPUT_FILE}`);
    const outputPath = path.resolve(process.cwd(), OUTPUT_FILE);
    fs.writeFileSync(outputPath, xmlString);
    
    const outputSize = fs.statSync(outputPath).size;
    console.log(`Test file created successfully: ${(outputSize / (1024 * 1024)).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('Error creating test XML file:', error);
    process.exit(1);
  }
}

main(); 