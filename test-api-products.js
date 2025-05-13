import fetch from 'node-fetch';

async function testProductsApi() {
  try {
    console.log('Testing products API endpoint...');
    
    // Send request to the deployed products API endpoint
    const url = 'https://aligekow.vercel.app/api/v1/products?limit=5';
    console.log(`Sending request to ${url}`);
    const response = await fetch(url, {
      timeout: 10000 // 10 second timeout
    });
    
    // Check response status
    console.log(`API Response Status: ${response.status} ${response.statusText}`);
    
    // Parse response JSON
    const data = await response.json();
    console.log('API Response Data:', JSON.stringify(data, null, 2));
    
    // Check if response contains products
    if (data.products || data.rows) {
      console.log('✅ Products found in API response');
      
      // Log product count
      const products = data.products || data.rows || [];
      console.log(`Number of products: ${products.length}`);
      
      // Log first product
      if (products.length > 0) {
        console.log('First product:', JSON.stringify(products[0], null, 2));
      }
    } else if (data.data && (data.data.products || data.data.items || data.data.rows)) {
      console.log('✅ Products found in nested data structure');
      
      // Log product count
      const products = data.data.products || data.data.items || data.data.rows || [];
      console.log(`Number of products: ${products.length}`);
      
      // Log first product details
      if (products.length > 0) {
        console.log('First product:', JSON.stringify(products[0], null, 2));
      }
    } else {
      console.log('❌ No products found in API response');
      console.log('Response structure:', Object.keys(data));
      
      if (data.message) {
        console.log('API message:', data.message);
      }
    }
  } catch (error) {
    console.error('Error testing products API:', error);
  }
}

testProductsApi(); 