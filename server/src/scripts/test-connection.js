/**
 * Script to test database connection
 * This script attempts to connect to the database using the configuration in database.js
 * 
 * Run this script with:
 * node server/src/scripts/test-connection.js
 */

// CommonJS imports
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Log environment detection
console.log(`Running in ${process.env.NODE_ENV || 'development'} environment`);
console.log(`Using connection string: ${process.env.NEON_DB_URL ? 'Neon DB (configured)' : 'Local (default)'}\n`);

// Create database connection based on environment variables
async function createDatabaseConnection() {
  console.log("Creating database connection...");
  
  const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_SSL,
    NEON_DB_URL,
    POSTGRES_URL,
    NODE_ENV
  } = process.env;

  let sequelize;

  if (NODE_ENV === 'production' && POSTGRES_URL) {
    console.log("Using Vercel Postgres connection URL");
    sequelize = new Sequelize(POSTGRES_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });
  } else if (NEON_DB_URL) {
    console.log("Using Neon DB URL");
    sequelize = new Sequelize(NEON_DB_URL, {
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
  } else {
    console.log("Using local database configuration");
    sequelize = new Sequelize({
      host: DB_HOST || 'localhost',
      port: DB_PORT || 5432,
      username: DB_USER || 'postgres',
      password: DB_PASSWORD || 'postgres',
      database: DB_NAME || 'alitools_b2b',
      dialect: 'postgres',
      logging: NODE_ENV === 'development',
      ssl: DB_SSL === 'true',
      dialectOptions: DB_SSL === 'true' ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {}
    });
  }
  
  return sequelize;
}

// Test database connection
async function testConnection() {
  let sequelize;
  
  try {
    // Initialize database connection
    sequelize = await createDatabaseConnection();
    
    // Authenticate
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Check connection by executing a simple query
    const result = await sequelize.query('SELECT NOW() as current_time');
    console.log('Database query successful!');
    console.log('Current database time:', result[0][0].current_time);
    
    // Get database version
    const versionResult = await sequelize.query('SELECT version()');
    console.log('Database version:', versionResult[0][0].version);
    
    // List tables in the public schema
    const tablesResult = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tablesResult[0].length === 0) {
      console.log('No tables found in the database.');
    } else {
      console.log('\nTables in database:');
      tablesResult[0].forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('Database connection test failed:');
    console.error(error);
    process.exit(1);
  } finally {
    // Close the connection if it exists
    if (sequelize) {
      await sequelize.close();
      console.log('\nConnection test completed and connection closed.');
    }
  }
}

// Run the test
testConnection(); 