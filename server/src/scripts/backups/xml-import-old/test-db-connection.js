/**
 * Test DB Connection Script
 * 
 * This script tests the connection to the Neon PostgreSQL database
 * using the environment variables from .env
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Sequelize } from 'sequelize';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '../../../.env') });

console.log('Checking environment variables:');
console.log('NODE_ENV =', process.env.NODE_ENV);
console.log('NEON_DB_URL =', process.env.NEON_DB_URL ? '[SET]' : '[NOT SET]');
console.log('POSTGRES_URL =', process.env.POSTGRES_URL ? '[SET]' : '[NOT SET]');
console.log('DB_HOST =', process.env.DB_HOST);
console.log('DB_PORT =', process.env.DB_PORT);
console.log('DB_USER =', process.env.DB_USER ? '[SET]' : '[NOT SET]');
console.log('DB_PASSWORD =', process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]');
console.log('DB_NAME =', process.env.DB_NAME);
console.log('DB_SSL =', process.env.DB_SSL);

// Try direct connection with Neon URL
async function testNeonConnection() {
  if (!process.env.NEON_DB_URL) {
    console.log('NEON_DB_URL not set, skipping this test');
    return false;
  }

  const sequelize = new Sequelize(process.env.NEON_DB_URL, {
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

  try {
    console.log('Testing direct Neon connection...');
    await sequelize.authenticate();
    console.log('Neon connection SUCCESS!');
    return true;
  } catch (error) {
    console.error('Neon connection FAILED:', error);
    return false;
  } finally {
    await sequelize.close();
  }
}

// Try connection with individual parameters
async function testIndividualConnection() {
  if (!process.env.DB_HOST) {
    console.log('DB_HOST not set, skipping this test');
    return false;
  }

  const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialect: 'postgres',
    logging: true,
    ssl: process.env.DB_SSL === 'true',
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  });

  try {
    console.log('Testing individual parameters connection...');
    await sequelize.authenticate();
    console.log('Individual connection SUCCESS!');
    return true;
  } catch (error) {
    console.error('Individual connection FAILED:', error);
    return false;
  } finally {
    await sequelize.close();
  }
}

// Try connection with Vercel Postgres URL
async function testVercelConnection() {
  if (!process.env.POSTGRES_URL) {
    console.log('POSTGRES_URL not set, skipping this test');
    return false;
  }

  const sequelize = new Sequelize(process.env.POSTGRES_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });

  try {
    console.log('Testing Vercel Postgres connection...');
    await sequelize.authenticate();
    console.log('Vercel connection SUCCESS!');
    return true;
  } catch (error) {
    console.error('Vercel connection FAILED:', error);
    return false;
  } finally {
    await sequelize.close();
  }
}

// Run all tests
async function runTests() {
  console.log('========================================');
  console.log('TESTING DATABASE CONNECTIONS');
  console.log('========================================');

  const neonResult = await testNeonConnection();
  const individualResult = await testIndividualConnection();
  const vercelResult = await testVercelConnection();

  console.log('========================================');
  console.log('TEST RESULTS:');
  console.log('Neon Connection:', neonResult ? 'SUCCESS' : 'FAILED');
  console.log('Individual Connection:', individualResult ? 'SUCCESS' : 'FAILED');
  console.log('Vercel Connection:', vercelResult ? 'SUCCESS' : 'FAILED');
  console.log('========================================');

  if (!neonResult && !individualResult && !vercelResult) {
    console.error('ALL CONNECTIONS FAILED!');
    console.error('Make sure your .env file has the correct database credentials');
  }
}

runTests(); 