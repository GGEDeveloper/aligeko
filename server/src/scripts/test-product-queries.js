/**
 * Product Query Testing Script - Enhanced Version
 * 
 * This script tests various query operations on the imported product data:
 * 1. Basic product search by name/description
 * 2. Category navigation and filtering
 * 3. Producer filtering
 * 4. Complex joins for product details
 * 5. Search functionality tests
 * 6. Relationship validation
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Sequelize, QueryTypes } from 'sequelize';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(path.join(__dirname, '../../../.env')) });

// Start timing
console.time('Total execution time');

async function main() {
  console.log('========================================');
  console.log('TESTING PRODUCT QUERIES');
  console.log('========================================');
  
  let sequelize;
  try {
    // Create database connection
    console.log('Creating database connection...');
    sequelize = new Sequelize(process.env.NEON_DB_URL, {
      dialect: 'postgres',
      ssl: true,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    });
    
    await sequelize.authenticate();
    console.log('Database connection successful!');
    
    // ==========================================
    // Test 1: Basic Product Search
    // ==========================================
    console.log('\n========================================');
    console.log('TEST 1: BASIC PRODUCT SEARCH');
    console.log('========================================');
    
    console.time('Search by name');
    const productsByName = await sequelize.query(
      "SELECT id, code, name FROM products WHERE name ILIKE '%wheel%' LIMIT 5",
      { type: QueryTypes.SELECT }
    );
    console.timeEnd('Search by name');
    
    console.log(`Found ${productsByName.length} products with 'wheel' in the name:`);
    console.log(JSON.stringify(productsByName, null, 2));
    
    // ==========================================
    // Test 2: Category Navigation
    // ==========================================
    console.log('\n========================================');
    console.log('TEST 2: CATEGORY NAVIGATION');
    console.log('========================================');
    
    // Get top level categories
    console.time('Top level categories');
    const topCategories = await sequelize.query(
      "SELECT id, name, path FROM categories WHERE path NOT LIKE '%\\\\%' LIMIT 10",
      { type: QueryTypes.SELECT }
    );
    console.timeEnd('Top level categories');
    
    console.log(`Found ${topCategories.length} top level categories:`);
    console.log(JSON.stringify(topCategories, null, 2));
    
    // Get subcategories for a specific path
    if (topCategories.length > 0) {
      const topCategoryName = topCategories[0].name;
      console.time('Subcategories');
      const subcategories = await sequelize.query(
        "SELECT id, name, path FROM categories WHERE path LIKE $path AND path <> $exactPath LIMIT 10",
        { 
          type: QueryTypes.SELECT,
          bind: { 
            path: `${topCategoryName}%`,
            exactPath: topCategoryName
          }
        }
      );
      console.timeEnd('Subcategories');
      
      console.log(`Found ${subcategories.length} subcategories for '${topCategoryName}':`);
      console.log(JSON.stringify(subcategories, null, 2));
    }
    
    // ==========================================
    // Test 3: Producer Filtering
    // ==========================================
    console.log('\n========================================');
    console.log('TEST 3: PRODUCER FILTERING');
    console.log('========================================');
    
    // Get producers
    console.time('Producers');
    const producers = await sequelize.query(
      `SELECT p.id, p.name
       FROM producers p
       LIMIT 5`,
      { type: QueryTypes.SELECT }
    );
    console.timeEnd('Producers');
    
    console.log(`Found ${producers.length} producers:`);
    console.log(JSON.stringify(producers, null, 2));
    
    // Get some products
    console.time('Sample products');
    const sampleProducts = await sequelize.query(
      `SELECT id, code, name, producer_code
       FROM products
       LIMIT 5`,
      { type: QueryTypes.SELECT }
    );
    console.timeEnd('Sample products');
    
    console.log(`Sample products:`);
    console.log(JSON.stringify(sampleProducts, null, 2));
    
    // ==========================================
    // Test 4: Product Details
    // ==========================================
    console.log('\n========================================');
    console.log('TEST 4: PRODUCT DETAILS');
    console.log('========================================');
    
    // Get detailed product information
    console.time('Product details');
    const productDetails = await sequelize.query(
      `SELECT p.id, p.code, p.name, p.description_long,
              v.id as variant_id, v.code as variant_code
       FROM products p
       LEFT JOIN variants v ON v.product_id = p.id
       WHERE p.code = 'C00049'
       LIMIT 10`,
      { type: QueryTypes.SELECT }
    );
    console.timeEnd('Product details');
    
    console.log(`Product details for 'C00049':`);
    console.log(JSON.stringify(productDetails, null, 2));
    
    // ==========================================
    // Test 5: Search Functionality
    // ==========================================
    console.log('\n========================================');
    console.log('TEST 5: SEARCH FUNCTIONALITY');
    console.log('========================================');
    
    // Full text search
    console.time('Full text search');
    const searchResults = await sequelize.query(
      `SELECT id, code, name, description_short
       FROM products
       WHERE name ILIKE $query OR description_long ILIKE $query OR description_short ILIKE $query
       LIMIT 5`,
      { 
        type: QueryTypes.SELECT,
        bind: { query: '%jack%' }
      }
    );
    console.timeEnd('Full text search');
    
    console.log(`Found ${searchResults.length} results for 'jack':`);
    console.log(JSON.stringify(searchResults, null, 2));
    
    // Code search
    console.time('Code search');
    const codeSearchResults = await sequelize.query(
      `SELECT id, code, name
       FROM products
       WHERE code LIKE $query
       LIMIT 5`,
      { 
        type: QueryTypes.SELECT,
        bind: { query: 'C00%' }
      }
    );
    console.timeEnd('Code search');
    
    console.log(`Found ${codeSearchResults.length} results for code 'C00%':`);
    console.log(JSON.stringify(codeSearchResults, null, 2));
    
    // ==========================================
    // Test 6: Relationship Validation
    // ==========================================
    console.log('\n========================================');
    console.log('TEST 6: RELATIONSHIP VALIDATION');
    console.log('========================================');
    
    // Check product-variant relationships
    console.time('Product-variant relationships');
    const productVariantStats = await sequelize.query(
      `SELECT 
         COUNT(DISTINCT p.id) as total_products,
         COUNT(DISTINCT v.id) as total_variants,
         COUNT(DISTINCT p.id) FILTER (WHERE v.id IS NOT NULL) as products_with_variants
       FROM products p
       LEFT JOIN variants v ON p.id = v.product_id`,
      { type: QueryTypes.SELECT }
    );
    console.timeEnd('Product-variant relationships');
    
    console.log(`Product-variant relationship statistics:`);
    console.log(JSON.stringify(productVariantStats, null, 2));
    
  } catch (error) {
    console.error('Error executing queries:', error);
  } finally {
    // Close database connection
    if (sequelize) {
      console.log('\nClosing database connection...');
      await sequelize.close();
    }
    
    console.timeEnd('Total execution time');
    console.log('\nQuery testing completed');
  }
}

main(); 