/**
 * Check Table Schema Script
 * 
 * This script connects to the database and retrieves the schema information
 * for the tables we need for the XML import.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Sequelize } from 'sequelize';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from absolute path
const envPath = path.resolve(__dirname, '../../../.env');
console.log(`Loading environment variables from: ${envPath}`);
dotenv.config({ path: envPath });

// Tables to check
const TABLES = [
  'products',
  'categories',
  'producers',
  'units',
  'variants',
  'stocks',
  'prices',
  'images'
];

async function main() {
  let sequelize = null;
  
  try {
    // Create direct connection to database
    console.log('Creating database connection...');
    sequelize = new Sequelize(process.env.NEON_DB_URL, {
      dialect: 'postgres',
      logging: false,
      ssl: true,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });
    
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection successful!');
    
    // Check if tables exist
    for (const table of TABLES) {
      try {
        console.log(`\n=== Checking schema for table: ${table} ===`);
        
        // Get table info
        const query = `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = '${table}'
          ORDER BY ordinal_position;
        `;
        
        const [results] = await sequelize.query(query);
        
        if (results.length === 0) {
          console.log(`Table '${table}' does not exist or has no columns.`);
          continue;
        }
        
        // Display column information
        console.log('Column Name | Data Type | Nullable | Default');
        console.log('------------|-----------|----------|--------');
        
        for (const column of results) {
          console.log(
            `${column.column_name.padEnd(12)} | ` +
            `${column.data_type.padEnd(9)} | ` +
            `${column.is_nullable.padEnd(8)} | ` +
            `${(column.column_default || 'NULL')}`
          );
        }
        
        // Check primary key
        const pkQuery = `
          SELECT a.attname
          FROM   pg_index i
          JOIN   pg_attribute a ON a.attrelid = i.indrelid
                               AND a.attnum = ANY(i.indkey)
          WHERE  i.indrelid = '${table}'::regclass
          AND    i.indisprimary;
        `;
        
        const [pkResults] = await sequelize.query(pkQuery);
        
        if (pkResults.length > 0) {
          console.log('\nPrimary Key:');
          pkResults.forEach(pk => console.log(`- ${pk.attname}`));
        } else {
          console.log('\nNo primary key defined.');
        }
        
        // Check foreign keys
        const fkQuery = `
          SELECT
              tc.table_schema, 
              tc.constraint_name, 
              tc.table_name, 
              kcu.column_name, 
              ccu.table_schema AS foreign_table_schema,
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
          WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='${table}';
        `;
        
        const [fkResults] = await sequelize.query(fkQuery);
        
        if (fkResults.length > 0) {
          console.log('\nForeign Keys:');
          fkResults.forEach(fk => {
            console.log(`- ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
          });
        } else {
          console.log('\nNo foreign keys defined.');
        }
        
      } catch (error) {
        console.error(`Error checking schema for table '${table}':`, error.message);
      }
    }
    
  } catch (error) {
    console.error('Failed to check schema:', error.message);
    console.error(error.stack);
  } finally {
    if (sequelize) {
      await sequelize.close();
      console.log('\nDatabase connection closed.');
    }
  }
}

main(); 