/**
 * SQL Migration Execution Script
 * 
 * This script runs SQL migration files against the database to update
 * the schema and relationships.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(path.join(__dirname, '../../../.env')) });

// Start timing
console.time('Total execution time');

async function executeSqlFile(filePath, sequelize) {
  console.log(`Executing SQL file: ${filePath}`);
  
  // Read the SQL file
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Split the SQL into individual statements
  const statements = sql
    .replace(/--.*$/gm, '') // Remove comments
    .split(';')
    .filter(statement => statement.trim().length > 0);
  
  console.log(`Found ${statements.length} SQL statements to execute`);
  
  // Execute each statement in a transaction
  const transaction = await sequelize.transaction();
  try {
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        // Log short preview of the statement
        const preview = statement.replace(/\s+/g, ' ').substring(0, 50) + (statement.length > 50 ? '...' : '');
        console.log(`Executing statement ${i+1}/${statements.length}: ${preview}`);
        
        // Execute the statement
        await sequelize.query(statement, { transaction });
      }
    }
    
    // Commit the transaction
    await transaction.commit();
    console.log('All statements executed successfully');
    return true;
  } catch (error) {
    // Rollback the transaction on error
    await transaction.rollback();
    console.error(`Error executing SQL: ${error.message}`);
    console.error(`Statement: ${statements[error.index] || 'Unknown'}`);
    throw error;
  }
}

async function main() {
  console.log('========================================');
  console.log('EXECUTING SQL MIGRATION');
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
    
    // Get the SQL file path from command line args or use default
    const sqlFilePath = process.argv[2] || path.join(__dirname, 'add-foreign-keys.sql');
    
    // Execute the SQL file
    await executeSqlFile(sqlFilePath, sequelize);
    
  } catch (error) {
    console.error('Error executing migration:', error);
    process.exit(1);
  } finally {
    // Close database connection
    if (sequelize) {
      console.log('Closing database connection...');
      await sequelize.close();
    }
    
    console.timeEnd('Total execution time');
    console.log('Migration completed');
  }
}

main(); 