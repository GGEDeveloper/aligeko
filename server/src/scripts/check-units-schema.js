/**
 * Units Table Schema Check
 * 
 * This script inspects the actual structure of the units table
 * to help debug the incompatibility issue.
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
  console.log('UNITS TABLE SCHEMA INSPECTION');
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
    
    // Get table structure for units
    console.log('\n========================================');
    console.log('UNITS TABLE COLUMNS');
    console.log('========================================');
    
    const columnsQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'units'
      ORDER BY ordinal_position;
    `;
    
    const columns = await sequelize.query(columnsQuery, { type: QueryTypes.SELECT });
    
    console.log('Units table columns:');
    columns.forEach(column => {
      console.log(`- ${column.column_name} (${column.data_type}) ${column.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'} ${column.column_default ? 'DEFAULT: ' + column.column_default : ''}`);
    });
    
    // Get sample data
    console.log('\n========================================');
    console.log('UNITS SAMPLE DATA');
    console.log('========================================');
    
    const sampleData = await sequelize.query(
      `SELECT * FROM units LIMIT 10`,
      { type: QueryTypes.SELECT }
    );
    
    console.log('Sample units:');
    console.log(JSON.stringify(sampleData, null, 2));
    
    // Check tables referenced by foreign keys
    console.log('\n========================================');
    console.log('CHECKING OTHER RELATED TABLES');
    console.log('========================================');
    
    // Check producers
    console.log('\nProducers table:');
    const producersColumnsQuery = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'producers' AND column_name = 'id'
      LIMIT 1;
    `;
    
    const producersColumns = await sequelize.query(producersColumnsQuery, { type: QueryTypes.SELECT });
    console.log(`producers.id type: ${producersColumns.length ? producersColumns[0].data_type : 'unknown'}`);
    
    // Check categories
    console.log('\nCategories table:');
    const categoriesColumnsQuery = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'categories' AND column_name = 'id'
      LIMIT 1;
    `;
    
    const categoriesColumns = await sequelize.query(categoriesColumnsQuery, { type: QueryTypes.SELECT });
    console.log(`categories.id type: ${categoriesColumns.length ? categoriesColumns[0].data_type : 'unknown'}`);
    
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