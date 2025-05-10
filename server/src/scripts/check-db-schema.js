/**
 * Database Schema Check Script
 * 
 * This script provides detailed information about the database schema
 * including tables, columns, and relationships.
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
  console.log('DATABASE SCHEMA DETAILS');
  console.log('========================================');
  
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
      logging: false
    });
    
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection successful!');
    
    // Get list of tables
    const tables = await sequelize.query(
      "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'",
      { type: QueryTypes.SELECT }
    );
    
    console.log(`\nFound ${tables.length} tables:`);
    console.log(tables.map(t => t.tablename).join(', '));
    
    // For each table, get column information
    for (const { tablename } of tables) {
      console.log(`\n--- TABLE: ${tablename} ---`);
      
      const columns = await sequelize.query(
        `SELECT column_name, data_type, character_maximum_length, 
                column_default, is_nullable 
         FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = ?
         ORDER BY ordinal_position`,
        { 
          replacements: [tablename],
          type: QueryTypes.SELECT 
        }
      );
      
      console.log('Columns:');
      columns.forEach(column => {
        const dataType = column.data_type + 
          (column.character_maximum_length ? `(${column.character_maximum_length})` : '');
        
        const nullable = column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = column.column_default ? `DEFAULT ${column.column_default}` : '';
        
        console.log(`- ${column.column_name}: ${dataType} ${nullable} ${defaultVal}`);
      });
      
      // Get primary key information
      const primaryKeys = await sequelize.query(
        `SELECT ccu.column_name
         FROM information_schema.table_constraints tc
         JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
         WHERE tc.table_schema = 'public' AND tc.table_name = ? AND tc.constraint_type = 'PRIMARY KEY'`,
        { 
          replacements: [tablename],
          type: QueryTypes.SELECT 
        }
      );
      
      if (primaryKeys.length > 0) {
        console.log('Primary Key(s):', primaryKeys.map(pk => pk.column_name).join(', '));
      }
      
      // Get foreign key information
      const foreignKeys = await sequelize.query(
        `SELECT kcu.column_name, ccu.table_name AS referenced_table, ccu.column_name AS referenced_column
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
         JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
         WHERE tc.table_schema = 'public' AND tc.table_name = ? AND tc.constraint_type = 'FOREIGN KEY'`,
        { 
          replacements: [tablename],
          type: QueryTypes.SELECT 
        }
      );
      
      if (foreignKeys.length > 0) {
        console.log('Foreign Keys:');
        foreignKeys.forEach(fk => {
          console.log(`- ${fk.column_name} -> ${fk.referenced_table}(${fk.referenced_column})`);
        });
      }
      
      // Get index information
      const indices = await sequelize.query(
        `SELECT indexname, indexdef
         FROM pg_indexes
         WHERE schemaname = 'public' AND tablename = ?`,
        { 
          replacements: [tablename],
          type: QueryTypes.SELECT 
        }
      );
      
      if (indices.length > 0) {
        console.log('Indices:');
        indices.forEach(idx => {
          console.log(`- ${idx.indexname}: ${idx.indexdef}`);
        });
      }
      
      // Get sample data if not an internal table
      if (!['SequelizeMeta'].includes(tablename)) {
        const sampleData = await sequelize.query(
          `SELECT * FROM "${tablename}" LIMIT 1`,
          { type: QueryTypes.SELECT }
        );
        
        if (sampleData.length > 0) {
          console.log('Sample Record:');
          console.log(JSON.stringify(sampleData[0], null, 2));
        }
      }
    }
    
    console.log('\n========================================');
    console.log('DATABASE SCHEMA CHECK COMPLETE');
    console.log('========================================');
    
    // Close database connection
    await sequelize.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('========================================');
    console.error(`SCHEMA CHECK FAILED: ${error.message}`);
    console.error('========================================');
    console.error(error.stack);
    
    // Close database connection if it exists
    if (sequelize) {
      try {
        await sequelize.close();
        console.log('Database connection closed');
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
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