import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const API_VERSION = 'v1'; // Hardcoded to v1 to match server implementation
const PRODUCTS_ENDPOINT = `${API_URL}/${API_VERSION}/products`;

console.log('====== PRODUCTS API VERIFICATION TEST ======');

async function testProductsAPI() {
  try {
    console.log(`Testing products endpoint: ${PRODUCTS_ENDPOINT}`);
    
    // Test with different page sizes to verify behavior
    const pageSizes = [1, 5, 20];
    
    for (const limit of pageSizes) {
      console.log(`\nTesting with limit=${limit}...`);
      
      const response = await fetch(`${PRODUCTS_ENDPOINT}?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validation checks
      console.log(`Response status: ${response.status}`);
      console.log(`Success flag: ${data.success}`);
      
      if (!data.success) {
        throw new Error(`API returned success=false: ${data.error}`);
      }
      
      // Validate data structure
      if (!data.data || !data.data.items || !data.data.meta) {
        throw new Error('Invalid response structure: missing data.items or data.meta');
      }
      
      // Check if items is an array
      const isItemsArray = Array.isArray(data.data.items);
      console.log(`Items is array: ${isItemsArray}`);
      
      if (!isItemsArray) {
        throw new Error('Items is not an array!');
      }
      
      // Validate item count matches the requested limit (or total if less)
      const expectedCount = Math.min(limit, data.data.meta.totalItems);
      const actualCount = data.data.items.length;
      
      console.log(`Expected item count: ${expectedCount}`);
      console.log(`Actual item count: ${actualCount}`);
      console.log(`Total items in database: ${data.data.meta.totalItems}`);
      console.log(`Total pages: ${data.data.meta.totalPages}`);
      
      if (actualCount !== expectedCount && data.data.meta.totalItems > 0) {
        throw new Error(`Item count mismatch: expected ${expectedCount}, got ${actualCount}`);
      }
      
      // Validate the first item has expected properties
      if (data.data.items.length > 0) {
        const firstItem = data.data.items[0];
        console.log('\nSample product:');
        console.log(`- ID: ${firstItem.id}`);
        console.log(`- Name: ${firstItem.name || '[No name]'}`);
        console.log(`- Code: ${firstItem.code || '[No code]'}`);
      }
    }
    
    console.log('\n✅ All tests passed!');
    console.log('The products API is working correctly with the expected array format.');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error);
    process.exit(1);
  }
}

testProductsAPI(); 