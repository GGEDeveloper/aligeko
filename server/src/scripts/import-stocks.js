/**
 * Direct GEKO XML Import Script for Stock Data
 * 
 * This script imports inventory/stock data from the GEKO XML file
 * to complement the product and variant data already in the database.
 * 
 * It builds on the optimized performance patterns established in direct-import-xml.js.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { Sequelize, DataTypes } from 'sequelize';
import { parse } from '../utils/geko-xml-parser.js';

// Start global performance measurements
console.time('Total execution time');

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(path.join(__dirname, '../../../.env')) });

// Constants
const DEFAULT_XML_PATH = path.join(__dirname, '../../../geko_products_en.xml');
const BATCH_SIZE = 500; // Optimal batch size based on performance testing

/**
 * Main function
 */
async function main() {
  let xmlData;
  let sequelize;
  try {
    console.log("========================================");
    console.log("STARTING STOCK DATA IMPORT");
    console.log("========================================");
    
    // Get XML file path from command line args or use default
    const xmlFilePath = process.argv[2] || DEFAULT_XML_PATH;
    
    // Handle properly the input path - check if it's absolute
    let absoluteXmlPath;
    if (path.isAbsolute(xmlFilePath)) {
      absoluteXmlPath = xmlFilePath;
    } else {
      absoluteXmlPath = path.resolve(path.join(__dirname, '../../../', xmlFilePath));
    }
    
    console.log(`Using XML file: ${absoluteXmlPath}`);
    
    // Check if file exists
    if (!fs.existsSync(absoluteXmlPath)) {
      console.error(`ERROR: File not found: ${absoluteXmlPath}`);
      process.exit(1);
    }
    
    console.log(`File exists, size: ${(fs.statSync(absoluteXmlPath).size / (1024 * 1024)).toFixed(2)} MB`);
    
    // Read XML file
    console.time('Reading XML file');
    xmlData = fs.readFileSync(absoluteXmlPath, 'utf8');
    console.timeEnd('Reading XML file');
    console.log(`Successfully read file with length: ${xmlData.length} bytes`);
    
    // Create database connection
    console.log('Creating database connection...');
    sequelize = new Sequelize(process.env.NEON_DB_URL, {
      dialect: 'postgres',
      ssl: true,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false,
      pool: {
        max: 10,        // Increased for better concurrency
        min: 0,
        idle: 20000,    // Increased idle timeout (ms)
        acquire: 120000 // Increased timeout for batch operations (ms)
      }
    });
    
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection successful!');
    
    // Define models
    const Variant = sequelize.define('Variant', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      code: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, { 
      tableName: 'variants',
      timestamps: true,
      underscored: true
    });
    
    const Stock = sequelize.define('Stock', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      variant_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      min_order_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      warehouse_location: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      last_updated: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, { 
      tableName: 'stocks',
      timestamps: true,
      underscored: true
    });
    
    try {
      // Start transaction
      const transaction = await sequelize.transaction();
      
      try {
        // Parse XML
        console.time('XML parsing');
        const transformedData = await parse(xmlData);
        console.timeEnd('XML parsing');
        
        // Create lookup tables for variant codes to IDs
        console.time('Building lookups');
        
        // Get all variants from database for lookup
        const variants = await Variant.findAll({
          attributes: ['id', 'code'],
          transaction
        });
        
        // Create maps for fast lookup
        const variantCodeToId = {};
        variants.forEach(variant => {
          variantCodeToId[variant.code] = variant.id;
        });
        
        console.timeEnd('Building lookups');
        
        // Process stock data
        // Check for stock data either directly or in variants array
        let stocksToProcess = [];
        
        if (transformedData.stocks && transformedData.stocks.length > 0) {
          console.log(`Processing ${transformedData.stocks.length} direct stock entries...`);
          stocksToProcess = transformedData.stocks;
        } else if (transformedData.variants && transformedData.variants.length > 0) {
          console.log(`Extracting stock data from ${transformedData.variants.length} variants...`);
          
          // Extract stock data from variants
          for (const variant of transformedData.variants) {
            if (variant.stock) {
              stocksToProcess.push({
                variant_code: variant.code,
                quantity: variant.stock.quantity,
                available: variant.stock.available,
                min_order_quantity: variant.stock.min_order_quantity,
                warehouse_location: variant.stock.warehouse_location || null
              });
            }
          }
          console.log(`Extracted ${stocksToProcess.length} stock entries from variants`);
        }
        
        if (stocksToProcess.length > 0) {
          console.time('Stock import');
          
          const stocksToCreate = [];
          
          for (const stockData of stocksToProcess) {
            // Skip if we don't have the variant ID
            if (!variantCodeToId[stockData.variant_code]) {
              console.log(`Skipping stock for unknown variant code: ${stockData.variant_code}`);
              continue;
            }
            
            stocksToCreate.push({
              variant_id: variantCodeToId[stockData.variant_code],
              quantity: stockData.quantity || 0,
              available: stockData.available === true || stockData.available === 'true' || stockData.quantity > 0,
              min_order_quantity: stockData.min_order_quantity || 1,
              warehouse_location: stockData.warehouse_location || null,
              last_updated: new Date(),
              created_at: new Date(),
              updated_at: new Date()
            });
          }
          
          // Import stocks in batches
          let importedStocks = 0;
          for (let i = 0; i < stocksToCreate.length; i += BATCH_SIZE) {
            const batch = stocksToCreate.slice(i, i + BATCH_SIZE);
            try {
              await Stock.bulkCreate(batch, { 
                transaction,
                ignoreDuplicates: true
              });
              importedStocks += batch.length;
              console.log(`Imported ${importedStocks}/${stocksToCreate.length} stock entries`);
            } catch (error) {
              console.error(`Error importing stock batch ${i+1}-${Math.min(i+BATCH_SIZE, stocksToCreate.length)}:`, error.message);
            }
          }
          
          console.timeEnd('Stock import');
          console.log(`Imported ${importedStocks} stock entries successfully`);
        } else {
          console.log('No stock data found in XML');
        }
        
        // Commit transaction
        await transaction.commit();
        console.log('Transaction committed successfully');
        
      } catch (error) {
        // Rollback transaction on error
        await transaction.rollback();
        console.error('========================================');
        console.error(`XML IMPORT FAILED: ${error.message}`);
        console.error('========================================');
        console.error(error.stack);
      }
    } catch (error) {
      console.error('========================================');
      console.error(`TRANSACTION ERROR: ${error.message}`);
      console.error('========================================');
      console.error(error.stack);
    } finally {
      // Free memory
      let xmlDataRef = xmlData;
      xmlData = null;
      xmlDataRef = null;
      global.gc && global.gc(); // Trigger garbage collection if available
      
      // Close database connection
      if (sequelize) {
        console.log('Closing database connection...');
        await sequelize.close();
      }
    }
  } catch (error) {
    console.error('========================================');
    console.error(`XML IMPORT FAILED: ${error.message}`);
    console.error('========================================');
    console.error(error.stack);
  } finally {
    // Free memory
    let xmlDataRef = xmlData;
    xmlData = null;
    xmlDataRef = null;
    global.gc && global.gc(); // Trigger garbage collection if available
    
    // Close database connection
    if (sequelize) {
      console.log('Closing database connection...');
      await sequelize.close();
    }
  }
}

// Run the main function
main()
  .then(() => {
    console.timeEnd('Total execution time');
    console.log('Import process completed');
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    console.timeEnd('Total execution time');
    process.exit(1);
  }); 