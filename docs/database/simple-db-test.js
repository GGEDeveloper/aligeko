/**
 * Simple Neon Database Connection Test
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connection string from environment variables
const connectionString = process.env.NEON_DB_URL || 
                         process.env.POSTGRES_URL || 
                         process.env.DATABASE_URL;

console.log('Connecting to Neon PostgreSQL database...');
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

// Test connection and list tables
async function testDatabase() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Connection successful!');
    
    // List tables
    const [tables] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tables.length === 0) {
      console.log('No tables found in database');
    } else {
      console.log(`\nFound ${tables.length} tables:`);
      tables.forEach((row, i) => console.log(`${i+1}. ${row.table_name}`));
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
  } finally {
    await sequelize.close();
    console.log('\nConnection closed');
  }
}

testDatabase(); 