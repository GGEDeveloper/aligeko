import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

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
  POSTGRES_URL,  // Vercel Postgres connection string
  NODE_ENV
} = process.env;

// Create Sequelize instance
let sequelize;

// Database configuration object for Sequelize CLI
const config = {
  development: {
    dialect: 'postgres'
  },
  test: {
    dialect: 'postgres'
  },
  production: {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

// Prioridade: POSTGRES_URL (Vercel) > NEON_DB_URL > configuração individual
if (NODE_ENV === 'production' && POSTGRES_URL) {
  // Use Vercel Postgres connection URL
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
  config.production.use_env_variable = 'POSTGRES_URL';
} else if (NEON_DB_URL) {
  // Use Neon DB URL for production or development with Neon
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
  config.development.use_env_variable = 'NEON_DB_URL';
  config.production.use_env_variable = 'NEON_DB_URL';
} else {
  // Use local database for development
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
  
  // Set up config for local connection
  config.development.host = DB_HOST || 'localhost';
  config.development.port = DB_PORT || 5432;
  config.development.username = DB_USER || 'postgres';
  config.development.password = DB_PASSWORD || 'postgres';
  config.development.database = DB_NAME || 'alitools_b2b';
}

// Test database connection
export const configureDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync database models in development (only if NODE_ENV is development)
    if (NODE_ENV === 'development') {
      console.log('Syncing database models...');
      // await sequelize.sync({ alter: true });
      console.log('Database models synced successfully.');
    }
    
    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

// Export the sequelize instance
export default sequelize; 

// CommonJS exports for Sequelize CLI
module.exports = config; 