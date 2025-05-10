/**
 * Debug GEKO XML Import Script
 * 
 * This script tests the basics of GEKO XML parsing with minimal dependencies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import GekoXmlParser from '../utils/geko-xml-parser.js';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Constants
const DEFAULT_XML_PATH = path.join(__dirname, '../../../geko_products_en.xml');

/**
 * Main function
 */
async function main() {
  try {
    console.log("========================================");
    console.log("STARTING GEKO XML DEBUG");
    console.log("========================================");
    
    // Get XML file path from command line args or use default
    const xmlFilePath = process.argv[2] || DEFAULT_XML_PATH;
    console.log(`Using XML file: ${xmlFilePath}`);
    
    // Check if file exists
    if (!fs.existsSync(xmlFilePath)) {
      console.error(`ERROR: File not found: ${xmlFilePath}`);
      process.exit(1);
    }
    
    console.log(`File exists, size: ${(fs.statSync(xmlFilePath).size / (1024 * 1024)).toFixed(2)} MB`);
    console.log("Starting XML read...");
    
    // Read XML file
    const xmlData = fs.readFileSync(xmlFilePath, 'utf8');
    console.log(`Successfully read file with length: ${xmlData.length} bytes`);
    console.log(`First 100 chars: ${xmlData.substring(0, 100)}`);
    
    // Create parser
    console.log("Creating parser...");
    const parser = new GekoXmlParser();
    
    // Parse XML data
    console.log("Starting XML parsing with GekoXmlParser...");
    const transformedData = parser.parse(xmlData);
    
    // Display result
    console.log("========================================");
    console.log("Transformation complete with the following counts:");
    console.log(`- Products: ${transformedData.products.length}`);
    console.log(`- Categories: ${transformedData.categories.length}`);
    console.log(`- Producers: ${transformedData.producers.length}`);
    console.log(`- Units: ${transformedData.units.length}`);
    console.log(`- Variants: ${transformedData.variants.length}`);
    console.log(`- Stocks: ${transformedData.stocks.length}`);
    console.log(`- Prices: ${transformedData.prices.length}`);
    console.log(`- Images: ${transformedData.images.length}`);
    
    // Print a sample product
    if (transformedData.products.length > 0) {
      console.log("\nSample product:");
      console.log(JSON.stringify(transformedData.products[0], null, 2));
    }
    
    // Print a sample variant
    if (transformedData.variants.length > 0) {
      console.log("\nSample variant:");
      console.log(JSON.stringify(transformedData.variants[0], null, 2));
    }
    
    // Print a sample price
    if (transformedData.prices.length > 0) {
      console.log("\nSample price:");
      console.log(JSON.stringify(transformedData.prices[0], null, 2));
    }
    
    console.log("========================================");
    
  } catch (error) {
    console.error("========================================");
    console.error('Fatal error during debug:', error);
    console.error("========================================");
    process.exit(1);
  }
}

// Run the script
main(); 