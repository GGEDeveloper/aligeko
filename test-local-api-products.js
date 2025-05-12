import fetch from 'node-fetch';

// Configuration
const API_URL = 'http://localhost:5000/api';
const API_VERSION = 'v1';
const PRODUCTS_ENDPOINT = `${API_URL}/${API_VERSION}/products`;

console.log('====== LOCAL API TEST ======');
console.log(`Testing endpoint: ${PRODUCTS_ENDPOINT}`);

async function testLocalProductsAPI() {
  try {
    const response = await fetch(PRODUCTS_ENDPOINT);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('\nAPI Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Basic validation
    if (!data.success) {
      throw new Error('API response indicates failure');
    }
    
    if (!data.data?.items || !Array.isArray(data.data.items)) {
      throw new Error('API response does not contain an items array');
    }
    
    console.log('\n✅ Local API is working correctly!');
    console.log(`- Found ${data.data.items.length} products`);
    console.log(`- Total items: ${data.data.meta.totalItems}`);
    console.log(`- Total pages: ${data.data.meta.totalPages}`);
    
    // Show first product if available
    if (data.data.items.length > 0) {
      const product = data.data.items[0];
      console.log('\nFirst product:');
      console.log(JSON.stringify(product, null, 2));
    }
    
  } catch (error) {
    console.error('\n❌ Local API test failed:');
    console.error(error.message);
    console.log('\nMake sure your local server is running on port 5000');
    console.log('Start it with: node index.js');
    process.exit(1);
  }
}

testLocalProductsAPI(); 