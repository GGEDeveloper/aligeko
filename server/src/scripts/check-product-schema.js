/**
 * Products Table Schema Check
 * 
 * This script inspects the actual structure of the products table
 * to help debug the XML import and query process.
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
  console.log('PRODUCTS TABLE SCHEMA INSPECTION');
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
    
    // Get table structure
    console.log('\n========================================');
    console.log('PRODUCTS TABLE COLUMNS');
    console.log('========================================');
    
    const columnsQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'products'
      ORDER BY ordinal_position;
    `;
    
    const columns = await sequelize.query(columnsQuery, { type: QueryTypes.SELECT });
    
    console.log('Products table columns:');
    columns.forEach(column => {
      console.log(`- ${column.column_name} (${column.data_type}) ${column.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'} ${column.column_default ? 'DEFAULT: ' + column.column_default : ''}`);
    });
    
    // Get foreign keys
    console.log('\n========================================');
    console.log('PRODUCTS TABLE FOREIGN KEYS');
    console.log('========================================');
    
    const fkQuery = `
      SELECT
        tc.constraint_name,
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
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'products';
    `;
    
    const foreignKeys = await sequelize.query(fkQuery, { type: QueryTypes.SELECT });
    
    console.log('Products table foreign keys:');
    if (foreignKeys.length === 0) {
      console.log('No foreign keys defined in table structure');
    } else {
      foreignKeys.forEach(fk => {
        console.log(`- ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name} (${fk.constraint_name})`);
      });
    }
    
    // Sample data check
    console.log('\n========================================');
    console.log('PRODUCTS SAMPLE DATA');
    console.log('========================================');
    
    const sampleQuery = `
      SELECT * FROM products LIMIT 1;
    `;
    
    const sampleData = await sequelize.query(sampleQuery, { type: QueryTypes.SELECT });
    
    console.log('Sample product record:');
    if (sampleData.length > 0) {
      console.log(JSON.stringify(sampleData[0], null, 2));
    } else {
      console.log('No products found');
    }
    
    // Check relationship fields
    console.log('\n========================================');
    console.log('CHECKING RELATIONSHIP FIELDS');
    console.log('========================================');
    
    // Count products with producer relationship
    try {
      const producerFieldQuery = `
        SELECT producer_id, COUNT(*) 
        FROM products 
        GROUP BY producer_id 
        LIMIT 5;
      `;
      
      const producerCounts = await sequelize.query(producerFieldQuery, { type: QueryTypes.SELECT });
      console.log('Producer relationships:');
      console.log(JSON.stringify(producerCounts, null, 2));
    } catch (error) {
      console.log('producer_id field check failed:', error.message);
    }
    
    // Try with different field name
    try {
      const producerCodeQuery = `
        SELECT producer_code, COUNT(*) 
        FROM products 
        GROUP BY producer_code 
        LIMIT 5;
      `;
      
      const producerCodeCounts = await sequelize.query(producerCodeQuery, { type: QueryTypes.SELECT });
      console.log('producer_code field counts:');
      console.log(JSON.stringify(producerCodeCounts, null, 2));
    } catch (error) {
      console.log('producer_code field check failed:', error.message);
    }
    
    // Check category relationship
    try {
      const categoryQuery = `
        SELECT category_id, COUNT(*) 
        FROM products 
        GROUP BY category_id 
        LIMIT 5;
      `;
      
      const categoryCounts = await sequelize.query(categoryQuery, { type: QueryTypes.SELECT });
      console.log('Category relationships:');
      console.log(JSON.stringify(categoryCounts, null, 2));
    } catch (error) {
      console.log('category_id field check failed:', error.message);
    }
    
  } catch (error) {
    console.error('Error inspecting schema:', error);
  } finally {
    // Close database connection
    if (sequelize) {
      console.log('\nClosing database connection...');
      await sequelize.close();
    }
    
    console.timeEnd('Total execution time');
    console.log('\nSchema inspection completed');
  }
}

main(); 