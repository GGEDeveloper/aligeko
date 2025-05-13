// Deployment script for authentication fix
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import chalk from 'chalk';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });

// Console output formatting
const success = (msg) => console.log(chalk.green(`✓ ${msg}`));
const warning = (msg) => console.log(chalk.yellow(`⚠️ ${msg}`));
const error = (msg) => console.log(chalk.red(`✗ ${msg}`));
const info = (msg) => console.log(chalk.blue(`ℹ ${msg}`));
const header = (msg) => console.log(chalk.bold.white(`\n=== ${msg} ===`));

// Execute commands synchronously and log output
const execPromise = (cmd) => {
  return new Promise((resolve, reject) => {
    console.log(`\n> Executing: ${cmd}\n`);
    
    const childProcess = exec(cmd);
    
    childProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    childProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    childProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`\n> Command completed successfully\n`);
        resolve();
      } else {
        console.error(`\n> Command failed with code ${code}\n`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
};

// Main deployment function
async function deploy() {
  try {
    console.log('\n========== STARTING DEPLOYMENT PROCESS ==========\n');
    
    // 1. Build the client
    console.log('Step 1: Building client');
    await execPromise('cd client && npm run build');
    
    // 2. Build the server
    console.log('Step 2: Building server');
    await execPromise('cd server && npm run build');
    
    // 3. Deploy to Vercel
    console.log('Step 3: Deploying to Vercel');
    await execPromise('vercel --prod');
    
    console.log('\n========== DEPLOYMENT COMPLETED SUCCESSFULLY ==========\n');
    console.log('Fix Summary:');
    console.log('- Added PUBLIC_ROUTES constant to auth.middleware.js');
    console.log('- Modified checkAuth middleware to skip authentication for public routes');
    console.log('- This allows product listings to be viewed without authentication');
    console.log('\nTo test the fix, visit the deployed URL and verify that:');
    console.log('1. The home page loads without authentication errors');
    console.log('2. The products page shows the list of products');
    console.log('3. Protected routes like admin pages still require authentication');
    
  } catch (error) {
    console.error('\n========== DEPLOYMENT FAILED ==========\n');
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

async function main() {
  console.log(chalk.bold.green('\n=============================================='));
  console.log(chalk.bold.green('  AliTools B2B E-commerce Deployment Fix Tool  '));
  console.log(chalk.bold.green('==============================================\n'));

  try {
    // Check environment variables
    header('Checking Environment Variables');
    const requiredVars = ['NEON_DB_URL', 'NODE_ENV'];
    const missingVars = [];

    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        missingVars.push(varName);
        error(`Missing required environment variable: ${varName}`);
      } else {
        success(`Found ${varName}`);
      }
    });

    if (missingVars.length > 0) {
      warning('Some required environment variables are missing.');
      console.log(chalk.yellow(`Please add them to your .env or .env.local file`));
    } else {
      success('All required environment variables are present');
    }

    // Check database connection
    header('Testing Database Connection');
    let sequelize;
    try {
      console.log(`Attempting to connect to database...`);
      sequelize = new Sequelize(process.env.NEON_DB_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      });

      await sequelize.authenticate();
      success('Database connection successful');

      // Check tables
      info('Checking database tables...');
      const [tables] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

      if (tables.length === 0) {
        warning('No tables found in the database. The schema may not be initialized.');
      } else {
        success(`Found ${tables.length} tables in the database`);
        console.log(tables.map(t => t.table_name).join(', '));

        // Check products table
        const hasProductsTable = tables.some(t => t.table_name === 'products');
        if (hasProductsTable) {
          const [productCount] = await sequelize.query('SELECT COUNT(*) FROM products');
          success(`Products table exists with ${productCount[0].count} records`);
        } else {
          error('Products table does not exist in the database');
        }
      }
    } catch (dbError) {
      error(`Database connection failed: ${dbError.message}`);
      console.error(dbError);
    }

    // Check server configuration files
    header('Checking Server Configuration');
    
    const configFiles = [
      { path: 'index.js', required: true },
      { path: 'vercel.json', required: true },
      { path: 'client/dist/index.html', required: true }
    ];

    for (const file of configFiles) {
      try {
        await fs.promises.access(path.join(__dirname, file.path), fs.constants.F_OK);
        success(`Found ${file.path}`);
      } catch (err) {
        if (file.required) {
          error(`Required file ${file.path} is missing`);
        } else {
          warning(`Optional file ${file.path} is missing`);
        }
      }
    }

    // Check if server is running
    header('Testing Local API');
    try {
      info('Checking if server is running at http://localhost:5000...');
      const response = await fetch('http://localhost:5000/api/v1/products?limit=1', {
        timeout: 3000 // 3 second timeout
      });
      
      if (response.ok) {
        success(`API is accessible (${response.status} ${response.statusText})`);
        
        const data = await response.json();
        if (data && (data.products || data.rows)) {
          success('API returns product data in the expected format');
        } else {
          warning('API response format may be incorrect');
          console.log('Response:', JSON.stringify(data, null, 2));
        }
      } else {
        warning(`API returned an error: ${response.status} ${response.statusText}`);
      }
    } catch (apiError) {
      warning(`Could not connect to local API: ${apiError.message}`);
      info('The server may not be running or might be using a different port');
    }

    // Check static files
    header('Checking Client Build');
    try {
      const clientDistDir = path.join(__dirname, 'client/dist');
      const assets = await fs.promises.readdir(path.join(clientDistDir, 'assets'));
      success(`Found ${assets.length} assets in client/dist/assets`);
      
      // Check index.html
      const indexHtml = await fs.promises.readFile(path.join(clientDistDir, 'index.html'), 'utf8');
      if (indexHtml.includes('<div id="root"></div>')) {
        success('index.html contains root element');
      } else {
        warning('index.html might not have the expected root element');
      }
    } catch (buildError) {
      error(`Error checking client build: ${buildError.message}`);
      warning('The client may not be built. Run "cd client && npm run build" to build it.');
    }

    // Final summary
    header('Deployment Readiness Summary');
    console.log(chalk.bold('Next steps:'));
    console.log('1. Fix any errors or warnings listed above');
    console.log('2. Build the client if needed: cd client && npm run build');
    console.log('3. Deploy to Vercel using: vercel --prod');
    console.log('4. Check Vercel logs for any deployment errors');
    console.log('5. Verify your deployed site at your Vercel URL');
    console.log('\nRefer to docs/deployment_guide.md and docs/vercel_deployment_config.md for more details');

  } catch (error) {
    console.error('An unexpected error occurred:', error);
  }
}

// Script to fix products table issues and query data
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

main().catch(err => {
  console.error('Script execution failed:', err);
  process.exit(1);
}); 