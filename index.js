// Simple Express server for SPA
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { Sequelize, Op } from 'sequelize';
import * as dotenv from 'dotenv';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });
dotenv.config({ path: join(__dirname, '.env.local') });

console.log('====== ENVIRONMENT ======');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Database URL exists:', !!process.env.NEON_DB_URL || !!process.env.POSTGRES_URL || !!process.env.DATABASE_URL);

// Setup database connection
const setupDatabase = async () => {
  let sequelize = null;
  const dbUrl = process.env.NEON_DB_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('No database URL found in environment variables. Please set NEON_DB_URL, POSTGRES_URL, or DATABASE_URL');
    return null;
  }
  
  try {
    console.log('Initializing Sequelize connection to PostgreSQL...');
    sequelize = new Sequelize(dbUrl, {
      dialect: 'postgres',
      dialectModule: await import('pg'),
      logging: false,
      ssl: true,
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
    
    // Test connection
    await sequelize.authenticate();
    console.log('Successfully connected to the database');
    return sequelize;
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    return null;
  }
};

// Initialize Express
const app = express();

// Apply middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Define a database state object for lazy initialization
const dbState = {
  connection: null,
  isConnecting: false,
  initialized: false,
  connectionPromise: null
};

// Database connection middleware
const connectDb = async (req, res, next) => {
  if (!dbState.initialized && !dbState.isConnecting) {
    dbState.isConnecting = true;
    dbState.connectionPromise = setupDatabase();
    dbState.connection = await dbState.connectionPromise;
    dbState.initialized = !!dbState.connection;
    dbState.isConnecting = false;
  } else if (dbState.isConnecting && dbState.connectionPromise) {
    await dbState.connectionPromise;
  }
  
  req.sequelize = dbState.connection;
  next();
};

// Serve static client files
app.use(express.static(join(__dirname, 'client/dist')));

// API Routes
app.get('/api/v1/products', connectDb, async (req, res) => {
  console.log('Processing request to /api/v1/products with params:', req.query);
  
  // If database connection failed
  if (!req.sequelize) {
    console.error('Database connection not available');
    return res.status(500).json({ 
      success: false, 
      error: 'Database connection failed', 
      details: 'The database connection could not be established. Please check environment variables and ensure the PostgreSQL server is running.'
    });
  }
  
  try {
    // Get query parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Log the pagination parameters for debugging
    console.log(`Query parameters: page=${page}, limit=${limit}, offset=${offset}`);
    
    // Count total products
    const countResult = await req.sequelize.query(
      `SELECT COUNT(*) FROM products`,
      { type: req.sequelize.QueryTypes.SELECT }
    );
    
    // Extract count value properly (from the first row, first column)
    const totalItems = parseInt(countResult[0].count || '0');
    
    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);
    
    // Get products with pagination
    const products = await req.sequelize.query(
      `SELECT * FROM products ORDER BY id LIMIT :limit OFFSET :offset`,
      { 
        replacements: { limit, offset },
        type: req.sequelize.QueryTypes.SELECT 
      }
    );
    
    console.log(`Found ${products ? products.length : 0} products (total: ${totalItems})`);
    
    // Ensure products is always an array
    const productsArray = Array.isArray(products) ? products : [products].filter(Boolean);
    
    // Return the response
    return res.json({
      success: true,
      data: {
        items: productsArray,
        meta: {
          totalItems,
          totalPages,
          currentPage: page,
          itemsPerPage: limit
        }
      }
    });
    
  } catch (error) {
    console.error('Error retrieving products:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Database query failed', 
      details: error.message
    });
  }
});

// SPA fallback route handler
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'client/dist/index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
