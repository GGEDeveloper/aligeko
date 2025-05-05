/**
 * Script to run database migrations in production environment
 * Used by the Vercel build process
 */

import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

console.log('Starting database migration...');

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
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  throw new Error('No database connection URL provided');
}

// Create Umzug instance for migrations
const umzug = new Umzug({
  migrations: {
    glob: 'dist/migrations/*.js',
    resolve: ({ name, path, context }) => {
      // Load the migration file
      const migration = require(path);
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

// Run all pending migrations
async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Run migrations
    const migrations = await umzug.up();
    
    console.log('Migrations completed successfully:');
    migrations.forEach(migration => {
      console.log(`- ${migration.name}`);
    });
    
    console.log('All migrations have been executed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations(); 