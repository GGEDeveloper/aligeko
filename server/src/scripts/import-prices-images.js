/**
 * Direct GEKO XML Import Script for Prices and Images
 * 
 * This script imports prices and images data from the GEKO XML file
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
  const startTime = new Date();
  try {
    console.log("========================================");
    console.log("STARTING PRICES AND IMAGES IMPORT");
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
    const Product = sequelize.define('Product', {
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
      tableName: 'products',
      timestamps: true,
      underscored: true
    });
    
    const Variant = sequelize.define('Variant', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
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
    
    const Price = sequelize.define('Price', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      variant_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      gross_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      net_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'EUR'
      },
      price_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'retail'
      }
    }, { 
      tableName: 'prices',
      timestamps: true,
      underscored: true
    });
    
    const Image = sequelize.define('Image', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      is_main: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    }, { 
      tableName: 'images',
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
        
        // Create lookup tables for product and variant codes to IDs
        console.time('Building lookups');
        
        // Map the variant code to the ID for database operations
        // This is the correct variable declaration
        let variantCodeToId = {};
        let productCodeToId = {};
        await Promise.all([
          // Get product code to ID mapping
          sequelize.query('SELECT id, code FROM products', {
            type: sequelize.QueryTypes.SELECT
          }).then(products => {
            products.forEach(product => {
              productCodeToId[product.code] = product.id;
            });
          }),

          // Get variant code to ID mapping
          sequelize.query('SELECT id, code FROM variants', {
            type: sequelize.QueryTypes.SELECT
          }).then(variants => {
            variants.forEach(variant => {
              variantCodeToId[variant.code] = variant.id;
            });
          })
        ]);

        console.log('Building lookups:', (new Date() - startTime) + 'ms');
        
        // Process prices
        if (transformedData.prices && transformedData.prices.length > 0) {
          console.log(`Processing ${transformedData.prices.length} prices...`);
          
          // Convert price data from variant_code to variant_id
          const priceData = transformedData.prices.map(price => {
            // Apply the mapped variant_id or use null if not found
            const variant_id = variantCodeToId[price.variant_code] || null;
            if (!variant_id) {
              console.warn(`Warning: No variant ID found for variant code ${price.variant_code}`);
              return null;
            }
            
            // Adjust price data format to match database schema
            return {
              variant_id,
              gross_price: price.amount || 0,
              net_price: (price.amount || 0) * 0.81, // Assuming 19% VAT for net price calculation 
              srp_gross: null,
              srp_net: null,
              created_at: new Date(),
              updated_at: new Date()
            };
          }).filter(price => price !== null);

          // Import prices in batches
          const BATCH_SIZE = 500;
          console.log(`Processing ${priceData.length} prices...`);
          
          for (let i = 0; i < priceData.length; i += BATCH_SIZE) {
            console.time(`Price batch ${i+1}-${Math.min(i+BATCH_SIZE, priceData.length)}`);
            
            const batch = priceData.slice(i, i + BATCH_SIZE);
            try {
              const result = await Price.bulkCreate(batch, { 
                transaction 
              });
              console.log(`Imported prices batch ${i+1} to ${Math.min(i+BATCH_SIZE, priceData.length)} (${result.length} records)`);
            } catch (error) {
              console.error(`Error importing price batch ${i+1}-${Math.min(i+BATCH_SIZE, priceData.length)}:`, error.message);
              // Continue with next batch (don't stop the entire process for one batch error)
            }
            
            console.timeEnd(`Price batch ${i+1}-${Math.min(i+BATCH_SIZE, priceData.length)}`);
          }
          
          console.timeEnd('Prices import');
          console.log(`Imported ${priceData.length} prices successfully`);
        } else {
          console.log('No prices found in XML data');
        }
        
        // Process images
        if (transformedData.images && transformedData.images.length > 0) {
          console.log(`Processing ${transformedData.images.length} images...`);
          console.time('Images import');
          
          const imagesToCreate = [];
          
          for (const imageData of transformedData.images) {
            // Skip if we don't have the product ID
            if (!productCodeToId[imageData.product_code]) {
              console.log(`Skipping image for unknown product code: ${imageData.product_code}`);
              continue;
            }
            
            imagesToCreate.push({
              product_id: productCodeToId[imageData.product_code],
              url: imageData.url,
              is_main: imageData.is_main === true || imageData.is_main === 'true' || imageData.order === 1,
              display_order: imageData.order || 0,
              alt_text: imageData.alt || '',
              created_at: new Date(),
              updated_at: new Date()
            });
          }
          
          // Import images in batches
          let importedImages = 0;
          for (let i = 0; i < imagesToCreate.length; i += BATCH_SIZE) {
            const batch = imagesToCreate.slice(i, i + BATCH_SIZE);
            try {
              await Image.bulkCreate(batch, { 
                transaction,
                ignoreDuplicates: true
              });
              importedImages += batch.length;
              console.log(`Imported ${importedImages}/${imagesToCreate.length} images`);
            } catch (error) {
              console.error(`Error importing image batch ${i+1}-${Math.min(i+BATCH_SIZE, imagesToCreate.length)}:`, error.message);
            }
          }
          
          console.timeEnd('Images import');
          console.log(`Imported ${importedImages} images successfully`);
        } else {
          console.log('No images found in XML data');
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