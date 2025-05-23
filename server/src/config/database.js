import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import dbLogger from '../utils/dbLogger.js';

// Load environment variables
dotenv.config({ path: '../../.env' }); // Garante que as variáveis do .env sejam carregadas

// Get database configuration from environment variables
const {
  DB_HOST = 'ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech',
  DB_PORT = 5432,
  DB_USER = 'neondb_owner',
  DB_PASSWORD = 'npg_NEjIVhxi8JZ2',
  DB_NAME = 'neondb',
  DB_SSL = 'true',
  NEON_DB_URL = 'postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require',
  POSTGRES_URL,  // Vercel Postgres connection string
  NODE_ENV = 'development'
} = process.env;

// Create Sequelize instance
let sequelize;

// Database configuration object for Sequelize CLI
const config = {
  development: {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
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

// Priority: NEON_DB_URL > POSTGRES_URL > individual configuration
try {
  if (NEON_DB_URL) {
    console.log('Connecting using NEON_DB_URL');
    // Importar o módulo pg de forma síncrona
    const pg = await import('pg');
    sequelize = new Sequelize(NEON_DB_URL, {
      dialect: 'postgres',
      dialectModule: pg,
      logging: (msg) => dbLogger.debug(msg),
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 10,
        min: 0,
        idle: 20000,
        acquire: 60000,
      }
    });
  } else if (POSTGRES_URL) {
    console.log('Connecting using POSTGRES_URL');
    // Use Vercel Postgres connection URL
    sequelize = new Sequelize(POSTGRES_URL, {
      dialect: 'postgres',
      logging: (msg) => dbLogger.debug(msg),
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });
    config.production.use_env_variable = 'POSTGRES_URL';
  } else if (NEON_DB_URL || process.env.DATABASE_URL) {
    const url = NEON_DB_URL || process.env.DATABASE_URL;
    console.log('Connecting using NEON_DB_URL or DATABASE_URL');
    console.log('Connecting using NEON_DB_URL');
    // Use Neon DB URL for production or development with Neon
    sequelize = new Sequelize(url, {
      dialect: 'postgres',
      logging: NODE_ENV === 'development',
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
    console.log('Connecting using individual database parameters');
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
} catch (error) {
  console.error('Error creating database connection:', error);
  throw error;
}

// Test database connection
const configureDatabase = async () => {
  try {
    // Importar o módulo pg de forma assíncrona
    const pg = await import('pg');
    
    // Se estivermos usando NEON_DB_URL, precisamos configurar o Sequelize com o módulo pg
    if (process.env.NEON_DB_URL) {
      sequelize = new Sequelize(process.env.NEON_DB_URL, {
        dialect: 'postgres',
        dialectModule: pg,
        logging: (msg) => dbLogger.debug(msg),
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        pool: {
          max: 10,
          min: 0,
          idle: 20000,
          acquire: 60000,
        }
      });
    }
    
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sincronizar modelos apenas se não estivermos em produção
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('All models were synchronized successfully.');
    } else {
      console.log('Skipping model synchronization in production');
    }
    
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

// Export the sequelize instance
export default sequelize; 

// Export config for Sequelize CLI (compatible with ES modules)
export { config }; 