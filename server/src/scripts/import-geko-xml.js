/**
 * GEKO XML Import Script
 * 
 * This script imports product data from the GEKO XML file directly into the database.
 * It's designed for one-time use, not as a recurring process.
 * 
 * Usage: 
 *   node src/scripts/import-geko-xml.js [path/to/geko-products.xml]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from absolute path
const envPath = path.resolve(__dirname, '../../../.env');
console.log(`Loading environment variables from: ${envPath}`);
dotenv.config({ path: envPath });

// Show database connection parameters without expor os dados sensíveis
console.log('Database Connection Parameters:');
console.log('NODE_ENV =', process.env.NODE_ENV);
console.log('NEON_DB_URL is set:', !!process.env.NEON_DB_URL);
console.log('POSTGRES_URL is set:', !!process.env.POSTGRES_URL);
console.log('DB_HOST =', process.env.DB_HOST);
console.log('DB_PORT =', process.env.DB_PORT);
console.log('DB_USER is set:', !!process.env.DB_USER);
console.log('DB_NAME =', process.env.DB_NAME);
console.log('DB_SSL =', process.env.DB_SSL);

// Rest of imports after environment variables are loaded
import { parse } from '../utils/geko-xml-parser.js';
import SyncHealthService from '../services/sync-health-service.js';
import sequelize from '../config/database.js';
import logger from '../config/logger.js';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import Producer from '../models/producer.model.js';
import Unit from '../models/unit.model.js';
import Variant from '../models/variant.model.js';
import Stock from '../models/stock.model.js';
import Price from '../models/price.model.js';
import Image from '../models/image.model.js';
import DataValidator from '../utils/data-validator.js';

// Default XML file path (can be overridden by command line argument)
const DEFAULT_XML_PATH = path.join(process.cwd(), 'geko_products_en.xml');

// Configuration for retry logic
const RETRY_CONFIG = {
  MAX_RETRIES: 3,                // Maximum number of retry attempts
  INITIAL_DELAY: 1000,           // Initial delay in milliseconds (1 second)
  BACKOFF_FACTOR: 2,             // Exponential backoff multiplier
  JITTER_MAX: 500,               // Maximum random jitter in milliseconds
  RETRY_ERRORS: [                // Error types that should trigger a retry
    'SequelizeConnectionError',
    'SequelizeTimeoutError',
    'SequelizeConnectionTimedOutError',
    'SequelizeConnectionRefusedError'
  ]
};

// Exponential backoff function for retries
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate retry delay with exponential backoff and jitter
 * @param {number} attempt - Current retry attempt (0-based)
 * @returns {number} Delay in milliseconds
 */
function calculateRetryDelay(attempt) {
  // Exponential backoff: initialDelay * (backoffFactor ^ attempt)
  const exponentialDelay = RETRY_CONFIG.INITIAL_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_FACTOR, attempt);
  
  // Add random jitter to prevent synchronized retries
  const jitter = Math.random() * RETRY_CONFIG.JITTER_MAX;
  
  return exponentialDelay + jitter;
}

/**
 * Determine if an error should trigger a retry
 * @param {Error} error - The error to check
 * @returns {boolean} Whether this error should trigger a retry
 */
function isRetryableError(error) {
  // Check if error name matches any in the retry errors list
  if (RETRY_CONFIG.RETRY_ERRORS.includes(error.name)) {
    return true;
  }
  
  // Check for network-related errors or other temporary failures
  const errorMessage = error.message.toLowerCase();
  return errorMessage.includes('timeout') || 
         errorMessage.includes('connection') ||
         errorMessage.includes('network') ||
         errorMessage.includes('temporarily unavailable');
}

/**
 * Execute a database operation with retry logic
 * @param {Function} operation - Function that returns a Promise
 * @param {string} operationName - Name of the operation for logging
 * @param {Object} tracking - Sync health tracking object
 * @returns {Promise} Result of the operation
 */
async function executeWithRetry(operation, operationName, tracking) {
  let lastError;
  
  for (let attempt = 0; attempt < RETRY_CONFIG.MAX_RETRIES; attempt++) {
    try {
      // If not the first attempt, log the retry
      if (attempt > 0) {
        logger.info(`Retry attempt ${attempt + 1}/${RETRY_CONFIG.MAX_RETRIES} for ${operationName}`);
      }
      
      // Execute the operation
      return await operation();
      
    } catch (error) {
      lastError = error;
      
      // Determine if we should retry
      if (attempt < RETRY_CONFIG.MAX_RETRIES - 1 && isRetryableError(error)) {
        // Calculate delay with exponential backoff
        const delay = calculateRetryDelay(attempt);
        
        logger.warn(`Operation ${operationName} failed with error: ${error.message}`);
        logger.info(`Retrying in ${Math.round(delay / 1000)} seconds...`);
        
        // Wait before next retry
        await delay(delay);
      } else {
        // Record error in health tracking
        if (tracking) {
          SyncHealthService.recordError(
            tracking, 
            'DATABASE_OPERATION_FAILED', 
            `${operationName} failed after ${attempt + 1} attempts: ${error.message}`
          );
        }
        
        // If we've exhausted retries or it's not a retryable error, rethrow
        logger.error(`Operation ${operationName} failed after ${attempt + 1} attempts: ${error.message}`);
        throw error;
      }
    }
  }
  
  // This shouldn't be reached, but just in case
  throw lastError;
}

/**
 * Imports data from the XML file into the database
 * @param {string} xmlFilePath - Path to the GEKO XML file
 */
async function importXmlData(xmlFilePath) {
  let tracking = null;
  
  try {
    console.log('Creating tracking record...');
    tracking = SyncHealthService.startSyncTracking('manual_import', xmlFilePath);
    
    console.log(`Starting GEKO XML import from file: ${xmlFilePath}`);
    
    // Check if file exists (already checked in main function)
    console.log('Reading XML file...');
    
    // Get file stats for logging
    const fileStats = fs.statSync(xmlFilePath);
    const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);
    console.log(`File size: ${fileSizeMB} MB, Last modified: ${fileStats.mtime}`);
    
    // Read XML file
    const xmlData = fs.readFileSync(xmlFilePath, 'utf8');
    console.log(`Successfully read file with size: ${xmlData.length} bytes`);
    
    // Test database connection before proceeding
    console.log('Testing database connection...');
    try {
      await sequelize.authenticate();
      console.log('Database connection established successfully');
    } catch (dbError) {
      console.error('Unable to connect to the database:', dbError);
      return {
        success: false,
        error: `Database connection failed: ${dbError.message}`
      };
    }
    
    // Parse XML data
    console.log('Parsing XML data...');
    const transformedData = parse(xmlData);
    console.log('XML parsed successfully. Beginning database import...');
    
    // Save data to database within a transaction
    console.log('Starting database transaction...');
    const transaction = await executeWithRetry(
      () => sequelize.transaction(),
      'Begin transaction',
      tracking
    );
    
    try {
      logger.info('Starting database transaction for import...');
      
      // Import categories in batches
      logger.info(`Importing ${transformedData.categories.size} categories...`);
      let processedItems = 0;
      for (const category of transformedData.categories.values()) {
        await executeWithRetry(
          () => Category.upsert(category, { transaction }),
          `Category import: ${category.id}`,
          tracking
        );
        
        processedItems++;
        if (processedItems % 50 === 0) {
          logger.info(`Processed ${processedItems}/${transformedData.categories.size} categories`);
        }
      }
      
      // Import producers in batches
      logger.info(`Importing ${transformedData.producers.size} producers...`);
      processedItems = 0;
      for (const producer of transformedData.producers.values()) {
        await executeWithRetry(
          () => Producer.upsert(producer, { transaction }),
          `Producer import: ${producer.id}`,
          tracking
        );
        
        processedItems++;
        if (processedItems % 10 === 0) {
          logger.info(`Processed ${processedItems}/${transformedData.producers.size} producers`);
        }
      }
      
      // Import units
      logger.info(`Importing ${transformedData.units.size} units...`);
      for (const unit of transformedData.units.values()) {
        await executeWithRetry(
          () => Unit.upsert(unit, { transaction }),
          `Unit import: ${unit.id}`,
          tracking
        );
      }
      
      // Import products in batches
      logger.info(`Importing ${transformedData.products.size} products...`);
      processedItems = 0;
      for (const product of transformedData.products.values()) {
        await executeWithRetry(
          () => Product.upsert(product, { transaction }),
          `Product import: ${product.code}`,
          tracking
        );
        
        processedItems++;
        if (processedItems % 1000 === 0) {
          logger.info(`Processed ${processedItems}/${transformedData.products.size} products`);
        }
      }
      
      // Import variants in batches
      logger.info(`Importing ${transformedData.variants.size} variants...`);
      processedItems = 0;
      for (const variant of transformedData.variants.values()) {
        await executeWithRetry(
          () => Variant.upsert(variant, { transaction }),
          `Variant import: ${variant.code}`,
          tracking
        );
        
        processedItems++;
        if (processedItems % 1000 === 0) {
          logger.info(`Processed ${processedItems}/${transformedData.variants.size} variants`);
        }
      }
      
      // Import stocks in batches
      logger.info(`Importing ${transformedData.stocks.size} stock records...`);
      processedItems = 0;
      for (const stock of transformedData.stocks.values()) {
        await executeWithRetry(
          () => Stock.upsert(stock, { transaction }),
          `Stock import: ${stock.id}`,
          tracking
        );
        
        processedItems++;
        if (processedItems % 1000 === 0) {
          logger.info(`Processed ${processedItems}/${transformedData.stocks.size} stock records`);
        }
      }
      
      // Import prices in batches
      logger.info(`Importing ${transformedData.prices.size} price records...`);
      processedItems = 0;
      for (const price of transformedData.prices.values()) {
        await executeWithRetry(
          () => Price.upsert(price, { transaction }),
          `Price import: ${price.id}`,
          tracking
        );
        
        processedItems++;
        if (processedItems % 2000 === 0) {
          logger.info(`Processed ${processedItems}/${transformedData.prices.size} price records`);
        }
      }
      
      // Import images in batches
      logger.info(`Importing ${transformedData.images.size} images...`);
      processedItems = 0;
      for (const image of transformedData.images.values()) {
        await executeWithRetry(
          () => Image.upsert(image, { transaction }),
          `Image import: ${image.id}`,
          tracking
        );
        
        processedItems++;
        if (processedItems % 3000 === 0) {
          logger.info(`Processed ${processedItems}/${transformedData.images.size} images`);
        }
      }
      
      // Commit transaction
      await executeWithRetry(
        () => transaction.commit(),
        'Commit transaction',
        tracking
      );
      logger.info('Database transaction committed successfully');
      
      // Record successful sync
      await SyncHealthService.finishSyncTracking(tracking, 'success', xmlData.length);
      
      // Log summary
      logger.info('=== Import Summary ===');
      logger.info(`Categories: ${transformedData.categories.size}`);
      logger.info(`Producers: ${transformedData.producers.size}`);
      logger.info(`Units: ${transformedData.units.size}`);
      logger.info(`Products: ${transformedData.products.size}`);
      logger.info(`Variants: ${transformedData.variants.size}`);
      logger.info(`Stocks: ${transformedData.stocks.size}`);
      logger.info(`Prices: ${transformedData.prices.size}`);
      logger.info(`Images: ${transformedData.images.size}`);
      logger.info(`Total entities: ${
        transformedData.categories.size + 
        transformedData.producers.size + 
        transformedData.units.size + 
        transformedData.products.size + 
        transformedData.variants.size + 
        transformedData.stocks.size + 
        transformedData.prices.size + 
        transformedData.images.size
      }`);
      
      return {
        success: true,
        stats: {
          categories: transformedData.categories.size,
          producers: transformedData.producers.size,
          units: transformedData.units.size,
          products: transformedData.products.size,
          variants: transformedData.variants.size,
          stocks: transformedData.stocks.size,
          prices: transformedData.prices.size,
          images: transformedData.images.size
        }
      };
      
    } catch (error) {
      // Rollback transaction on error
      try {
        await transaction.rollback();
        logger.error(`Database transaction rolled back: ${error.message}`);
      } catch (rollbackErr) {
        logger.error(`Failed to rollback transaction: ${rollbackErr.message}`);
      }
      
      // Record failed sync
      SyncHealthService.recordError(tracking, 'DATABASE_ERROR', error.message);
      await SyncHealthService.finishSyncTracking(tracking, 'error', xmlData.length);
      
      throw error;
    }
    
  } catch (error) {
    logger.error(`Import failed: ${error.message}`);
    logger.error(error.stack);
    
    // Record failed sync if not already recorded
    if (tracking.status !== 'error') {
      SyncHealthService.recordError(tracking, 'PROCESSING_ERROR', error.message);
      await SyncHealthService.finishSyncTracking(tracking, 'error', 0);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Set logging to console for better visibility
    console.log("========================================");
    console.log("STARTING GEKO XML IMPORT");
    console.log("========================================");
    
    // Get XML file path from command line args or use default
    const xmlFilePath = process.argv[2] || DEFAULT_XML_PATH;
    console.log(`Using XML file: ${xmlFilePath}`);
    
    // Check if file exists
    if (!fs.existsSync(xmlFilePath)) {
      console.error(`ERROR: File not found: ${xmlFilePath}`);
      process.exit(1);
    }
    
    console.log(`File exists, size: ${(fs.statSync(xmlFilePath).size / (1024 * 1024)).toFixed(2)} MB`);
    console.log("Starting import process...");
    
    // Run import
    const result = await importXmlData(xmlFilePath);
    
    // Display result
    if (result.success) {
      console.log("========================================");
      console.log("GEKO XML import completed successfully!");
      console.log("Import stats:", result.stats);
      console.log("========================================");
      process.exit(0);
    } else {
      console.error("========================================");
      console.error("GEKO XML import failed:", result.error);
      console.error("========================================");
      process.exit(1);
    }
    
  } catch (error) {
    console.error("========================================");
    console.error('Fatal error during import:', error);
    console.error("========================================");
    process.exit(1);
  }
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export default importXmlData; 