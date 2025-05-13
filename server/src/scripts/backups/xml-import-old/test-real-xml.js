/**
 * Test script for the enhanced GEKO XML Parser using a real XML file
 * 
 * This script tests the parser with a real GEKO XML file to verify it correctly extracts all fields.
 */

import fs from 'fs';
import path from 'path';
import { parse } from '../utils/geko-xml-parser.js';

// Check command line arguments
const xmlFilePath = process.argv[2];
if (!xmlFilePath) {
  console.error('Please provide a path to an XML file as a command line argument');
  process.exit(1);
}

// Test function
async function testParser(xmlFilePath) {
  console.log(`Testing GEKO XML Parser with file: ${xmlFilePath}`);
  console.log('--------------------------------------------------');
  
  try {
    // Read XML file
    console.time('Read XML file');
    const xmlData = fs.readFileSync(xmlFilePath, 'utf8');
    console.timeEnd('Read XML file');
    console.log(`File size: ${(xmlData.length / (1024 * 1024)).toFixed(2)} MB`);
    
    // Parse XML
    console.time('Parse XML');
    const result = await parse(xmlData);
    console.timeEnd('Parse XML');
    
    // Print out structure of result
    console.log('\nTransformation result structure:');
    Object.keys(result).forEach(key => {
      console.log(`- ${key}: ${Array.isArray(result[key]) ? result[key].length : typeof result[key]} items`);
    });
    
    // Print out details of extracted data (limit to 5 examples each)
    console.log('\nProducts (first 5):');
    result.products.slice(0, 5).forEach(p => console.log(`  - ${p.code}: ${p.name} (EAN: ${p.ean})`));

    console.log('\nCategories (first 5):');
    result.categories.slice(0, 5).forEach(c => console.log(`  - ${c.id}: ${c.name} (path: ${c.path})`));
    
    console.log('\nProducers (first 5):');
    result.producers.slice(0, 5).forEach(p => console.log(`  - ${p.name}`));
    
    console.log('\nUnits (first 5):');
    result.units.slice(0, 5).forEach(u => console.log(`  - ${u.id}: ${u.name}`));
    
    console.log('\nVariants (first 5):');
    if (result.variants.length > 0) {
      result.variants.slice(0, 5).forEach(v => console.log(`  - ${v.code} (product: ${v.product_code})`));
    } else {
      console.log('  No variants found.');
    }
    
    console.log('\nStocks (first 5):');
    if (result.stocks.length > 0) {
      result.stocks.slice(0, 5).forEach(s => console.log(`  - Variant ${s.variant_code}: ${s.quantity} units`));
    } else {
      console.log('  No stocks found.');
    }
    
    console.log('\nPrices (first 5):');
    if (result.prices.length > 0) {
      result.prices.slice(0, 5).forEach(p => console.log(`  - Variant ${p.variant_code}: ${p.gross_price} ${p.currency || 'EUR'}`));
    } else {
      console.log('  No prices found.');
    }
    
    console.log('\nImages (first 5):');
    if (result.images.length > 0) {
      result.images.slice(0, 5).forEach(i => console.log(`  - Product ${i.product_code}: ${i.url} (main: ${i.is_main})`));
    } else {
      console.log('  No images found.');
    }
    
    console.log('\nDocuments (first 5):');
    if (result.documents.length > 0) {
      result.documents.slice(0, 5).forEach(d => console.log(`  - Product ${d.product_code}: ${d.name || 'Unnamed'} (${d.url})`));
    } else {
      console.log('  No documents found.');
    }
    
    console.log('\nProduct Properties (first 5):');
    if (result.productProperties.length > 0) {
      result.productProperties.slice(0, 5).forEach(p => console.log(`  - Product ${p.product_code}: ${p.name}: ${p.value}`));
    } else {
      console.log('  No product properties found.');
    }
    
    // Save sample of transformed data to a JSON file for inspection
    const outputPath = path.join(path.dirname(xmlFilePath), 'geko_transformed_data.json');
    
    // Create a sample with limited items for each category
    const sample = {};
    Object.keys(result).forEach(key => {
      if (Array.isArray(result[key])) {
        sample[key] = result[key].slice(0, 20); // Take first 20 items of each type
      } else {
        sample[key] = result[key];
      }
    });
    
    fs.writeFileSync(outputPath, JSON.stringify(sample, null, 2));
    console.log(`\nSample of transformed data saved to: ${outputPath}`);
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing parser:', error);
  }
}

// Run the test
testParser(xmlFilePath); 