/**
 * Neon Database Explorer
 * 
 * This script connects to the Neon PostgreSQL database and lists all tables in the database.
 * Run with: node docs/database/neon-db-explorer.js
 */

import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

console.log('Connecting to Neon PostgreSQL database...');

// Use connection string from environment variables
const connectionString = process.env.NEON_DB_URL || 
                         process.env.POSTGRES_URL ||
                         process.env.DATABASE_URL;

if (!connectionString) {
  console.error('No database connection string found in environment variables.');
  console.error('Please ensure NEON_DB_URL, POSTGRES_URL or DATABASE_URL is set.');
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

async function exploreDatabase() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connection to Neon DB established successfully!');
    
    // Get all tables in the database
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tables.length === 0) {
      console.log('No tables found in the database.');
      return;
    }
    
    console.log(`\nFound ${tables.length} tables in the database:`);
    tables.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Database connection error:');
    console.error(error.message);
    if (error.parent) {
      console.error('Parent error:', error.parent.message);
    }
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('\nConnection closed.');
  }
}

// Run the exploration
exploreDatabase(); 