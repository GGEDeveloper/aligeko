/**
 * Database Relations Test Script
 * 
 * This script tests the relationships between database tables after the migration.
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
  console.log('TESTING DATABASE RELATIONSHIPS');
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
    
    // Get database constraints
    console.log('\n========================================');
    console.log('CHECKING FOREIGN KEY CONSTRAINTS');
    console.log('========================================');
    
    const constraintsQuery = `
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, tc.constraint_name;
    `;
    
    const constraints = await sequelize.query(constraintsQuery, { type: QueryTypes.SELECT });
    
    console.log('Foreign key constraints:');
    constraints.forEach(constraint => {
      console.log(`- ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name} (${constraint.constraint_name})`);
    });
    
    // Test product-category relationship
    console.log('\n========================================');
    console.log('TESTING PRODUCT-CATEGORY RELATIONSHIP');
    console.log('========================================');
    
    const productCategoriesQuery = `
      SELECT 
        p.id, p.name, p.category_id, 
        c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LIMIT 5;
    `;
    
    const productCategories = await sequelize.query(productCategoriesQuery, { type: QueryTypes.SELECT });
    
    console.log(`Found ${productCategories.length} products with categories:`);
    console.log(JSON.stringify(productCategories, null, 2));
    
    // Test product-producer relationship
    console.log('\n========================================');
    console.log('TESTING PRODUCT-PRODUCER RELATIONSHIP');
    console.log('========================================');
    
    const productProducersQuery = `
      SELECT 
        p.id, p.name, p.producer_id, 
        pr.name as producer_name
      FROM products p
      JOIN producers pr ON p.producer_id = pr.id
      LIMIT 5;
    `;
    
    const productProducers = await sequelize.query(productProducersQuery, { type: QueryTypes.SELECT });
    
    console.log(`Found ${productProducers.length} products with producers:`);
    console.log(JSON.stringify(productProducers, null, 2));
    
    // Test variant-stock relationship
    console.log('\n========================================');
    console.log('TESTING VARIANT-STOCK RELATIONSHIP');
    console.log('========================================');
    
    const variantStocksQuery = `
      SELECT 
        v.id, v.code, 
        s.quantity, s.available, s.min_order_quantity
      FROM variants v
      JOIN stocks s ON v.id = s.variant_id
      LIMIT 5;
    `;
    
    const variantStocks = await sequelize.query(variantStocksQuery, { type: QueryTypes.SELECT });
    
    console.log(`Found ${variantStocks.length} variants with stock information:`);
    console.log(JSON.stringify(variantStocks, null, 2));
    
    // Test variant-price relationship
    console.log('\n========================================');
    console.log('TESTING VARIANT-PRICE RELATIONSHIP');
    console.log('========================================');
    
    const variantPricesQuery = `
      SELECT 
        v.id, v.code, 
        p.gross_price, p.net_price
      FROM variants v
      JOIN prices p ON v.id = p.variant_id
      LIMIT 5;
    `;
    
    const variantPrices = await sequelize.query(variantPricesQuery, { type: QueryTypes.SELECT });
    
    console.log(`Found ${variantPrices.length} variants with price information:`);
    console.log(JSON.stringify(variantPrices, null, 2));
    
    // Test product details view
    console.log('\n========================================');
    console.log('TESTING PRODUCT DETAILS VIEW');
    console.log('========================================');
    
    const productDetailsQuery = `
      SELECT * FROM product_details LIMIT 2;
    `;
    
    const productDetails = await sequelize.query(productDetailsQuery, { type: QueryTypes.SELECT });
    
    console.log(`Product details from view:`);
    console.log(JSON.stringify(productDetails, null, 2));
    
  } catch (error) {
    console.error('Error testing relationships:', error);
  } finally {
    // Close database connection
    if (sequelize) {
      console.log('\nClosing database connection...');
      await sequelize.close();
    }
    
    console.timeEnd('Total execution time');
    console.log('\nRelationship tests completed');
  }
}

main(); 