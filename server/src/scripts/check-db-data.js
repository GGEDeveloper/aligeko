/**
 * Database Data Validation Script
 * 
 * This script connects to the database and checks:
 * 1. Database connection
 * 2. Record counts in main tables
 * 3. Sample records from each table
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Sequelize, DataTypes, QueryTypes } from 'sequelize';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(path.join(__dirname, '../../../.env')) });

// Start timing
console.time('Total execution time');

async function main() {
  console.log('========================================');
  console.log('STARTING DATABASE VALIDATION');
  console.log('========================================');
  
  // Check environment variables
  console.log('Database Connection Parameters:');
  console.log(`NODE_ENV = ${process.env.NODE_ENV || 'not set'}`);
  console.log(`NEON_DB_URL is set: ${Boolean(process.env.NEON_DB_URL)}`);
  console.log(`POSTGRES_URL is set: ${Boolean(process.env.POSTGRES_URL)}`);

  // Create database connection
  console.log('Creating database connection...');
  console.time('Database connection');
  
  let sequelize;
  try {
    sequelize = new Sequelize(process.env.NEON_DB_URL, {
      dialect: 'postgres',
      ssl: true,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false,
      pool: {
        max: 5,
        min: 0,
        idle: 10000,
        acquire: 30000
      }
    });
    
    // Test connection
    await sequelize.authenticate();
    console.timeEnd('Database connection');
    console.log('Database connection successful!');
    
    // Check which tables exist in the database
    console.log('Checking database schema...');
    const tables = await sequelize.query(
      "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'",
      { type: QueryTypes.SELECT }
    );
    
    console.log('Raw tables result:', JSON.stringify(tables, null, 2));
    
    const tableNames = tables.map(t => t.tablename);
    console.log('Available tables:', tableNames.join(', '));
    
    // Check record counts
    console.log('========================================');
    console.log('CHECKING RECORD COUNTS');
    console.log('========================================');

    // Only query tables that exist
    if (tableNames.includes('categories')) {
      const [{ count: categoryCount }] = await sequelize.query(
        'SELECT COUNT(*) as count FROM categories',
        { type: QueryTypes.SELECT }
      );
      console.log(`Categories: ${categoryCount}`);
      
      // Get sample records
      if (parseInt(categoryCount) > 0) {
        const categories = await sequelize.query(
          'SELECT * FROM categories LIMIT 3',
          { type: QueryTypes.SELECT }
        );
        console.log('Sample Categories:');
        console.log(JSON.stringify(categories, null, 2));
      }
    } else {
      console.log('Categories table does not exist');
    }
    
    if (tableNames.includes('producers')) {
      const [{ count: producerCount }] = await sequelize.query(
        'SELECT COUNT(*) as count FROM producers',
        { type: QueryTypes.SELECT }
      );
      console.log(`Producers: ${producerCount}`);
      
      // Get sample records
      if (parseInt(producerCount) > 0) {
        const producers = await sequelize.query(
          'SELECT * FROM producers LIMIT 3',
          { type: QueryTypes.SELECT }
        );
        console.log('Sample Producers:');
        console.log(JSON.stringify(producers, null, 2));
      }
    } else {
      console.log('Producers table does not exist');
    }
    
    if (tableNames.includes('units')) {
      const [{ count: unitCount }] = await sequelize.query(
        'SELECT COUNT(*) as count FROM units',
        { type: QueryTypes.SELECT }
      );
      console.log(`Units: ${unitCount}`);
      
      // Get sample records
      if (parseInt(unitCount) > 0) {
        const units = await sequelize.query(
          'SELECT * FROM units LIMIT 3',
          { type: QueryTypes.SELECT }
        );
        console.log('Sample Units:');
        console.log(JSON.stringify(units, null, 2));
      }
    } else {
      console.log('Units table does not exist');
    }
    
    if (tableNames.includes('products')) {
      const [{ count: productCount }] = await sequelize.query(
        'SELECT COUNT(*) as count FROM products',
        { type: QueryTypes.SELECT }
      );
      console.log(`Products: ${productCount}`);
      
      // Get sample records
      if (parseInt(productCount) > 0) {
        const products = await sequelize.query(
          'SELECT * FROM products LIMIT 3',
          { type: QueryTypes.SELECT }
        );
        console.log('Sample Products:');
        console.log(JSON.stringify(products, null, 2));
      }
    } else {
      console.log('Products table does not exist');
    }
    
    if (tableNames.includes('variants')) {
      const [{ count: variantCount }] = await sequelize.query(
        'SELECT COUNT(*) as count FROM variants',
        { type: QueryTypes.SELECT }
      );
      console.log(`Variants: ${variantCount}`);
      
      // Get sample records
      if (parseInt(variantCount) > 0) {
        const variants = await sequelize.query(
          'SELECT * FROM variants LIMIT 3',
          { type: QueryTypes.SELECT }
        );
        console.log('Sample Variants:');
        console.log(JSON.stringify(variants, null, 2));
      }
    } else {
      console.log('Variants table does not exist');
    }
    
    // Check for prices and images tables
    if (tableNames.includes('prices')) {
      const [{ count: priceCount }] = await sequelize.query(
        'SELECT COUNT(*) as count FROM prices',
        { type: QueryTypes.SELECT }
      );
      console.log(`Prices: ${priceCount}`);
    } else {
      console.log('Prices table does not exist');
    }
    
    if (tableNames.includes('images')) {
      const [{ count: imageCount }] = await sequelize.query(
        'SELECT COUNT(*) as count FROM images',
        { type: QueryTypes.SELECT }
      );
      console.log(`Images: ${imageCount}`);
    } else {
      console.log('Images table does not exist');
    }
    
    // Validate relationships if needed tables exist
    if (tableNames.includes('products') && tableNames.includes('variants') && 
        tableNames.includes('categories') && tableNames.includes('producers')) {
        
      console.log('========================================');
      console.log('VALIDATING RELATIONSHIPS');
      console.log('========================================');
      
      const products = await sequelize.query(
        'SELECT * FROM products LIMIT 1',
        { type: QueryTypes.SELECT }
      );
      
      if (products.length > 0) {
        const product = products[0];
        
        // Check category relationship
        if (product.category_id) {
          const categories = await sequelize.query(
            'SELECT * FROM categories WHERE id = ?',
            { 
              replacements: [product.category_id],
              type: QueryTypes.SELECT 
            }
          );
          console.log(`Product ${product.code} (ID: ${product.id}):`);
          console.log(`- Category reference exists: ${categories.length > 0 ? 'Yes' : 'No'}`);
        }
        
        // Check producer relationship
        if (product.producer_id) {
          const producers = await sequelize.query(
            'SELECT * FROM producers WHERE id = ?',
            { 
              replacements: [product.producer_id],
              type: QueryTypes.SELECT 
            }
          );
          console.log(`- Producer reference exists: ${producers.length > 0 ? 'Yes' : 'No'}`);
        }
        
        // Check unit relationship
        if (product.unit_id) {
          const units = await sequelize.query(
            'SELECT * FROM units WHERE id = ?',
            { 
              replacements: [product.unit_id],
              type: QueryTypes.SELECT 
            }
          );
          console.log(`- Unit reference exists: ${units.length > 0 ? 'Yes' : 'No'}`);
        }
        
        // Check variants
        const variants = await sequelize.query(
          'SELECT * FROM variants WHERE product_id = ? LIMIT 2',
          { 
            replacements: [product.id],
            type: QueryTypes.SELECT 
          }
        );
        console.log(`- Has variants: ${variants.length > 0 ? 'Yes' : 'No'} (Count: ${variants.length})`);
      }
    }
    
    console.log('========================================');
    console.log('DATABASE VALIDATION COMPLETE');
    console.log('========================================');
    
    // Close database connection
    await sequelize.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('========================================');
    console.error(`DATABASE VALIDATION FAILED: ${error.message}`);
    console.error('========================================');
    console.error(error.stack);
    
    // Close database connection if it exists
    if (sequelize) {
      await sequelize.close();
      console.log('Database connection closed');
    }
  }
}

// Run the main function
main()
  .then(() => {
    console.timeEnd('Total execution time');
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    console.timeEnd('Total execution time');
    process.exit(1);
  }); 