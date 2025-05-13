// Script to debug products table issues and query data
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
  console.error('❌ No database URL found in environment variables');
  process.exit(1);
}

console.log('====== DATABASE DEBUG SCRIPT ======');
console.log('Using database URL:', dbUrl.substring(0, 40) + '...');

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

async function debugDatabaseIssues() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully');
    
    // 1. Check tables in the database
    console.log('\n📋 Checking database tables...');
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log(`Found ${tables.length} tables:`);
    tables.forEach((row, i) => console.log(`${i+1}. ${row.table_name}`));
    
    // 2. Find products table (case-insensitive)
    const productsTable = tables.find(t => 
      t.table_name.toLowerCase() === 'products'
    );
    
    if (!productsTable) {
      console.log('❌ No products table found in the database');
      return;
    }
    
    console.log(`\n✅ Found products table: "${productsTable.table_name}"`);
    
    // 3. Check table structure
    console.log('\n📋 Checking products table structure...');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = '${productsTable.table_name}'
      ORDER BY ordinal_position;
    `);
    
    console.log(`Found ${columns.length} columns in table "${productsTable.table_name}":`);
    columns.forEach((col, i) => {
      console.log(`${i+1}. ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // 4. Check if there's data in the table
    console.log('\n📋 Checking if products table has data...');
    const [count] = await sequelize.query(`
      SELECT COUNT(*) as count FROM "${productsTable.table_name}";
    `);
    
    console.log(`Found ${count[0].count} products in database.`);
    
    // 5. Check the first few records
    if (parseInt(count[0].count) > 0) {
      console.log('\n📋 Fetching sample of products...');
      const [products] = await sequelize.query(`
        SELECT * FROM "${productsTable.table_name}" LIMIT 3;
      `);
      
      console.log('Product sample:');
      products.forEach((product, i) => {
        console.log(`\nProduct ${i+1}:`);
        for (const [key, value] of Object.entries(product)) {
          if (value !== null && value !== undefined) {
            const displayValue = typeof value === 'string' && value.length > 50 
              ? value.substring(0, 50) + '...' 
              : value;
            console.log(`  ${key}: ${displayValue}`);
          }
        }
      });
    }
    
    // 6. Identify the issue
    console.log('\n📊 DIAGNOSIS SUMMARY:');
    if (parseInt(count[0].count) === 0) {
      console.log('✅ The database connection is working');
      console.log('✅ The products table exists:', productsTable.table_name);
      console.log('❌ ISSUE: There are 0 products in the database table');
      console.log('\n🔧 SOLUTION: Seed data into the products table');
    } else {
      console.log('✅ The database connection is working');
      console.log('✅ The products table exists:', productsTable.table_name);
      console.log('✅ There are', count[0].count, 'products in the database');
      console.log('\n🧐 The issue might be with the API query or response handling');
      console.log('\n🔧 SOLUTION:');
      console.log('1. Check why the API query is returning an empty array');
      console.log('2. Verify that the column names in the SQL query match the actual table structure');
      console.log('3. Ensure there are no WHERE clauses filtering out all products');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Original error:', error);
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('\n🔄 Database connection closed');
  }
}

// Run the debug function
debugDatabaseIssues(); 