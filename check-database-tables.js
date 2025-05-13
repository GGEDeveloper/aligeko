// Script to check tables in the database
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });

// Database URL from environment variables
const dbUrl = process.env.NEON_DB_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('No database URL found in environment variables');
  process.exit(1);
}

// Create Sequelize instance
const sequelize = new Sequelize(dbUrl, {
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

// Check database connection and list tables
async function checkDatabaseTables() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Query to get all table names
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (results.length === 0) {
      console.log('ℹ️ No tables found in the database.');
    } else {
      console.log(`\n📋 Found ${results.length} tables in the database:\n`);
      results.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name}`);
      });
    }
    
    // Check if "Products" table exists (the one used in the API)
    const productsTable = results.find(row => row.table_name.toLowerCase() === 'products');
    if (productsTable) {
      console.log(`\n✅ The "Products" table exists as "${productsTable.table_name}".`);
      
      // Check columns in the Products table
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${productsTable.table_name}'
        ORDER BY ordinal_position;
      `);
      
      console.log(`\n📋 Columns in the "${productsTable.table_name}" table:\n`);
      columns.forEach((col, index) => {
        console.log(`${index + 1}. ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log(`\n❌ The "Products" table DOES NOT exist in the database.`);
      console.log('This explains the API error: "relation \\"Products\\" does not exist"');
    }
  } catch (error) {
    console.error('❌ Error connecting to database:', error.message);
    console.error('Original error:', error);
  } finally {
    // Close the connection
    await sequelize.close();
  }
}

// Run the function
checkDatabaseTables(); 