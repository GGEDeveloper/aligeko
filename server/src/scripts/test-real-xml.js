/**
 * Test script for the enhanced GEKO XML Parser with real data
 * 
 * This script tests the parser with the actual GEKO XML file
 */

import { parse } from '../utils/geko-xml-parser.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to XML file in project root (try both options)
const xmlFileOptions = [
  path.resolve(__dirname, '../../../geko_products_en.xml'),
  path.resolve(__dirname, '../../../produkty_xml_3_26-04-2025_12_51_02_en.xml')
];

// Test function
async function testRealXmlParser() {
  console.log('========================================');
  console.log('Testing GEKO XML Parser with real data...');
  console.log('========================================');
  
  // Try to find a valid XML file
  let xmlFilePath = null;
  let xmlData = null;
  
  for (const filePath of xmlFileOptions) {
    console.log(`Checking for XML file at: ${filePath}`);
    
    if (fs.existsSync(filePath)) {
      xmlFilePath = filePath;
      console.log(`Found XML file at: ${xmlFilePath}`);
      
      // Get file stats
      const stats = fs.statSync(xmlFilePath);
      console.log(`File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
      
      try {
        // Read the XML file
        console.time('Reading XML file');
        xmlData = fs.readFileSync(xmlFilePath, 'utf8');
        console.timeEnd('Reading XML file');
        console.log(`Successfully read XML data: ${(xmlData.length / (1024 * 1024)).toFixed(2)} MB of text`);
        break;
      } catch (readError) {
        console.error(`Error reading XML file: ${readError.message}`);
      }
    }
  }
  
  if (!xmlData) {
    console.error('Could not find a valid XML file to test with');
    console.log('Tried the following paths:');
    xmlFileOptions.forEach(path => console.log(`- ${path}`));
    return;
  }
  
  try {
    // Parse the XML
    console.log('Starting XML parser...');
    console.time('Total parsing time');
    const result = await parse(xmlData);
    console.timeEnd('Total parsing time');
    
    // Print statistics
    console.log('\nExtracted data counts:');
    Object.keys(result).forEach(key => {
      console.log(`- ${key}: ${Array.isArray(result[key]) ? result[key].length : 'unknown'} items`);
    });
    
    // Sample data from each entity (only if items exist)
    if (result.products && result.products.length > 0) {
      console.log('\nSample Product:');
      console.log(JSON.stringify(result.products[0], null, 2));
    }
    
    if (result.variants && result.variants.length > 0) {
      console.log('\nSample Variant:');
      console.log(JSON.stringify(result.variants[0], null, 2));
    }
    
    if (result.productProperties && result.productProperties.length > 0) {
      console.log('\nSample Properties:');
      const uniqueProperties = new Set();
      result.productProperties.slice(0, 100).forEach(prop => {
        uniqueProperties.add(prop.name);
      });
      console.log(`Unique property names in first 100 items: ${Array.from(uniqueProperties).join(', ')}`);
    }
    
    // Save transformation result to a JSON file for inspection
    const outputJsonPath = path.resolve(__dirname, '../../../geko_transformed_data.json');
    console.log(`\nSaving transformed data sample to: ${outputJsonPath}`);
    
    try {
      fs.writeFileSync(
        outputJsonPath, 
        JSON.stringify({
          products: result.products.slice(0, 5),  // Just a few items to avoid huge files
          categories: result.categories.slice(0, 5),
          producers: result.producers.slice(0, 5),
          units: result.units.slice(0, 5),
          variants: result.variants.slice(0, 5),
          stocks: result.stocks.slice(0, 5),
          prices: result.prices.slice(0, 5),
          images: result.images.slice(0, 5),
          documents: result.documents.slice(0, 5),
          productProperties: result.productProperties.slice(0, 5)
        }, null, 2)
      );
      console.log('JSON file saved successfully');
    } catch (writeError) {
      console.error(`Error saving JSON file: ${writeError.message}`);
    }
    
    console.log('\n========================================');
    console.log('Test completed successfully!');
    console.log('========================================');
  } catch (error) {
    console.error('========================================');
    console.error('Error testing parser with real data:');
    console.error(error);
    console.error('========================================');
  }
}

// Run the test
console.log('Starting test...');
testRealXmlParser(); 