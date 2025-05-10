/**
 * Neon Database Table Structure Explorer
 * 
 * This script connects to the Neon PostgreSQL database and displays detailed structure
 * for a specific table including columns, primary keys, foreign keys, and indexes.
 * 
 * Usage: node docs/database/show-table-structure.js [tableName]
 * Example: node docs/database/show-table-structure.js products
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get table name from command line argument
const tableName = process.argv[2];

if (!tableName) {
  console.error('Error: Table name is required');
  console.error('Usage: node docs/database/show-table-structure.js [tableName]');
  console.error('Example: node docs/database/show-table-structure.js products');
  process.exit(1);
}

// Connection string from environment variables
const connectionString = process.env.NEON_DB_URL || 
                         process.env.POSTGRES_URL || 
                         process.env.DATABASE_URL;

console.log(`Exploring structure of table: ${tableName}`);
console.log('Connection string available:', connectionString ? 'Yes' : 'No');

if (!connectionString) {
  console.error('No database connection string found in environment variables');
  process.exit(1);
}

// Create database connection
const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
});

// Explore table structure
async function exploreTable() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Connection successful!');
    
    // Check if table exists
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = '${tableName}'
    `);
    
    if (tables.length === 0) {
      console.error(`Table '${tableName}' not found in database`);
      return;
    }
    
    console.log(`\n=== TABLE: ${tableName} ===`);
    
    // Get columns
    const [columns] = await sequelize.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        column_default, 
        is_nullable,
        numeric_precision,
        numeric_scale
      FROM 
        information_schema.columns 
      WHERE 
        table_schema = 'public' AND table_name = '${tableName}'
      ORDER BY 
        ordinal_position
    `);
    
    console.log('\nColumns:');
    columns.forEach(col => {
      let typeInfo = col.data_type;
      if (col.character_maximum_length) {
        typeInfo += `(${col.character_maximum_length})`;
      } else if (col.numeric_precision && col.numeric_scale) {
        typeInfo += `(${col.numeric_precision},${col.numeric_scale})`;
      }
      
      console.log(`  ${col.column_name} ${typeInfo} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Get primary key
    const [primaryKeys] = await sequelize.query(`
      SELECT 
        tc.constraint_name, 
        kcu.column_name 
      FROM 
        information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
      WHERE 
        tc.constraint_type = 'PRIMARY KEY' 
        AND tc.table_schema = 'public' 
        AND tc.table_name = '${tableName}'
    `);
    
    if (primaryKeys.length > 0) {
      console.log('\nPrimary Key:');
      primaryKeys.forEach(pk => {
        console.log(`  ${pk.column_name}`);
      });
    }
    
    // Get foreign keys
    const [foreignKeys] = await sequelize.query(`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = '${tableName}'
    `);
    
    if (foreignKeys.length > 0) {
      console.log('\nForeign Keys:');
      foreignKeys.forEach(fk => {
        console.log(`  ${fk.column_name} REFERENCES ${fk.foreign_table_name}(${fk.foreign_column_name})`);
      });
    }
    
    // Get indexes
    const [indexes] = await sequelize.query(`
      SELECT
        i.relname AS index_name,
        a.attname AS column_name,
        ix.indisunique AS is_unique
      FROM
        pg_class t,
        pg_class i,
        pg_index ix,
        pg_attribute a
      WHERE
        t.oid = ix.indrelid
        AND i.oid = ix.indexrelid
        AND a.attrelid = t.oid
        AND a.attnum = ANY(ix.indkey)
        AND t.relkind = 'r'
        AND t.relname = '${tableName}'
      ORDER BY
        i.relname, a.attnum
    `);
    
    if (indexes.length > 0) {
      console.log('\nIndexes:');
      const indexMap = {};
      
      // Group by index name since an index can span multiple columns
      indexes.forEach(idx => {
        if (!indexMap[idx.index_name]) {
          indexMap[idx.index_name] = {
            columns: [],
            isUnique: idx.is_unique
          };
        }
        indexMap[idx.index_name].columns.push(idx.column_name);
      });
      
      // Print each index
      Object.entries(indexMap).forEach(([indexName, indexInfo]) => {
        console.log(`  ${indexName} ON (${indexInfo.columns.join(', ')}) ${indexInfo.isUnique ? 'UNIQUE' : ''}`);
      });
    }
    
    // Get sample data (limit to first 5 rows)
    try {
      const [sampleData] = await sequelize.query(`
        SELECT * FROM "${tableName}" LIMIT 5
      `);
      
      if (sampleData.length > 0) {
        console.log('\nSample Data (5 rows):');
        console.table(sampleData);
      } else {
        console.log('\nNo data found in table');
      }
    } catch (error) {
      console.error('Error fetching sample data:', error.message);
    }
    
    // Get row count
    const [rowCount] = await sequelize.query(`
      SELECT count(*) AS total FROM "${tableName}"
    `);
    
    console.log(`\nTotal rows: ${rowCount[0].total}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.parent) {
      console.error('Parent error:', error.parent.message);
    }
  } finally {
    await sequelize.close();
    console.log('\nConnection closed');
  }
}

exploreTable(); 