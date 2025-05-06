/**
 * Sequelize CLI configuration file
 * This file is used specifically by sequelize-cli for migrations and seeders
 * It exports a CommonJS module with configuration for different environments
 */

const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get database configuration from environment variables
const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_SSL,
  NEON_DB_URL,
  NODE_ENV
} = process.env;

// Use Neon DB URL if available, otherwise fall back to individual configs
module.exports = {
  development: NEON_DB_URL ? {
    use_env_variable: 'NEON_DB_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  } : {
    username: DB_USER || 'postgres',
    password: DB_PASSWORD || 'postgres',
    database: DB_NAME || 'alitools_b2b',
    host: DB_HOST || 'localhost',
    port: DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: DB_SSL === 'true' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  },
  test: {
    username: DB_USER || 'postgres',
    password: DB_PASSWORD || 'postgres',
    database: DB_NAME || 'alitools_b2b_test',
    host: DB_HOST || 'localhost',
    dialect: 'postgres'
  },
  production: NEON_DB_URL ? {
    use_env_variable: 'NEON_DB_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  } : {
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
}; 