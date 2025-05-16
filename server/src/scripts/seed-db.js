/**
 * Script to run database seeds in production environment
 * Used after migrations for setting up initial data
 */

import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

console.log('Starting database seeding...');

// Get database configuration from environment variables
const {
  NEON_DB_URL,
  POSTGRES_URL, // Vercel's PostgreSQL connection string
  NODE_ENV
} = process.env;

// Create Sequelize instance
let sequelize;

// Use Vercel Postgres URL if available, otherwise use Neon DB URL
if (POSTGRES_URL) {
  console.log('Using Vercel Postgres connection');
  sequelize = new Sequelize(POSTGRES_URL, {
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else if (NEON_DB_URL) {
  console.log('Using Neon DB connection');
  sequelize = new Sequelize(NEON_DB_URL, {
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  console.error('No database connection URL found in environment');
  process.exit(1);
}

// Setup Umzug for seeders
const umzug = new Umzug({
  migrations: {
    glob: 'src/seeders/*.js',
    resolve: async ({ name, path, context }) => {
      // Import the ESM module
      const migration = await import(path);
      return {
        name,
        up: async () => migration.up(context.queryInterface, context.sequelize),
        down: async () => migration.down(context.queryInterface, context.sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

// Check if seed files exists
const seedDir = path.resolve(process.cwd(), 'src/seeders');
if (!fs.existsSync(seedDir)) {
  console.error(`Seeds directory not found: ${seedDir}`);
  process.exit(1);
}

// Run the seeders
(async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Check pending seeders
    const pending = await umzug.pending();
    console.log(`Found ${pending.length} pending seeders`);
    
    if (pending.length > 0) {
      // Run seeders
      await umzug.up();
      console.log('All seeders executed successfully.');
    } else {
      console.log('No pending seeders to execute.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error running seeders:', error);
    process.exit(1);
  }
})(); 