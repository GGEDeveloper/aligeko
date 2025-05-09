/**
 * Direct Import XML Script
 * 
 * This script imports data from a GEKO XML file directly into the database.
 * It uses the enhanced GekoXmlParser to parse the XML and imports the data
 * with optimized batch processing and transaction management.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { Sequelize, DataTypes, Model } from 'sequelize';
import { parse } from '../utils/geko-xml-parser.js';
import xml2js from 'xml2js';
import logger from '../config/logger.js';
import Document from '../models/document.js';
import ProductProperty from '../models/product-property.js';
import { importXmlData } from '../services/geko-import-service.js';
import { checkAndManageStorage } from './storage-management.js';
import colors from 'colors';

// Start global performance measurements
console.time('Total execution time');

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from absolute path
const envPath = path.resolve(__dirname, '../../../.env');
console.log(`Loading environment variables from: ${envPath}`);
dotenv.config({ path: envPath });

// Show database connection parameters without exposing sensitive data
console.log('Database Connection Parameters:');
console.log('NODE_ENV =', process.env.NODE_ENV);
console.log('NEON_DB_URL is set:', !!process.env.NEON_DB_URL);
console.log('POSTGRES_URL is set:', !!process.env.POSTGRES_URL);
console.log('DB_HOST =', process.env.DB_HOST);
console.log('DB_PORT =', process.env.DB_PORT);
console.log('DB_USER is set:', !!process.env.DB_USER);
console.log('DB_NAME =', process.env.DB_NAME);
console.log('DB_SSL =', process.env.DB_SSL);

// Get command line arguments
const xmlFilePath = process.argv[2];
if (!xmlFilePath) {
  console.error('Please provide a path to the XML file as a command line argument');
  process.exit(1);
}

// Check if file exists
try {
  if (!fs.existsSync(xmlFilePath)) {
    console.error(`ERROR: File not found: ${xmlFilePath}`);
    process.exit(1);
  }
  
  // Get file size
  const stats = fs.statSync(xmlFilePath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`File exists, size: ${fileSizeMB} MB`);
} catch (error) {
  console.error(`ERROR: Failed to access file: ${error.message}`);
  process.exit(1);
}

console.log('========================================');
console.log('STARTING DIRECT GEKO XML IMPORT');
console.log('========================================');
console.log(`Using XML file: ${xmlFilePath}`);

/**
 * Define models directly in this script to avoid import issues
 */
function defineModels(sequelize) {
  // Product Model - CORRIGIDO
  class Product extends Model {}
  Product.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true // Add unique constraint for optimization
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    description_long: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description_short: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['code'] }] // Add index for faster lookups
  });

  // Category Model - CORRIGIDO
  class Category extends Model {}
  Category.init({
    id: {
      type: DataTypes.TEXT,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true,
    underscored: true
  });

  // Producer Model - CORRIGIDO
  class Producer extends Model {}
  Producer.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true // Add unique constraint for optimization
    }
  }, {
    sequelize,
    modelName: 'Producer',
    tableName: 'producers',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['name'] }] // Add index for faster lookups
  });

  // Unit Model - CORRIGIDO
  class Unit extends Model {}
  Unit.init({
    id: {
      type: DataTypes.TEXT,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    moq: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'Unit',
    tableName: 'units',
    timestamps: true,
    underscored: true
  });

  // Variant Model - CORRIGIDO
  class Variant extends Model {}
  Variant.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true // Add unique constraint for optimization
    },
    weight: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    gross_weight: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Variant',
    tableName: 'variants',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['product_id'] }, 
      { fields: ['code'] }
    ] // Add indexes for faster lookups
  });

  // Price Model - CORRIGIDO
  class Price extends Model {}
  Price.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    variant_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gross_price: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    net_price: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    srp_gross: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    srp_net: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Price',
    tableName: 'prices',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['variant_id'] }] // Add index for faster lookups
  });

  // Image Model - CORRIGIDO
  class Image extends Model {}
  Image.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
      allowNull: true,
      defaultValue: false
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Image',
    tableName: 'images',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['product_id'] }] // Add index for faster lookups
  });

  // Define relationships
  Product.hasMany(Variant, { foreignKey: 'product_id' });
  Variant.belongsTo(Product, { foreignKey: 'product_id' });

  Variant.hasMany(Price, { foreignKey: 'variant_id' });
  Price.belongsTo(Variant, { foreignKey: 'variant_id' });

  Product.hasMany(Image, { foreignKey: 'product_id' });
  Image.belongsTo(Product, { foreignKey: 'product_id' });

  return {
    Product,
    Category,
    Producer,
    Unit,
    Variant,
    Price,
    Image
  };
}

// Function to process documents
async function processDocuments(productXml, productId, batch = []) {
  if (!productXml.documents || !productXml.documents.document) {
    return batch;
  }
  
  const documents = Array.isArray(productXml.documents.document) 
    ? productXml.documents.document 
    : [productXml.documents.document];
  
  for (const doc of documents) {
    if (!doc.url) continue;
    
    batch.push({
      product_id: productId,
      url: doc.url.trim(),
      type: doc.type || null,
      title: doc.title || doc.name || `Document ${batch.length + 1}`,
      language: doc.language || 'en',
      created_at: new Date(),
      updated_at: new Date()
    });
  }
  
  return batch;
}

// Function to process product properties
async function processProductProperties(productXml, productId, batch = []) {
  // Look for properties in various possible XML structures
  const specs = productXml.specifications || productXml.properties || productXml.specs || {};
  let propertyItems = [];
  
  if (specs.property && Array.isArray(specs.property)) {
    propertyItems = specs.property;
  } else if (specs.spec && Array.isArray(specs.spec)) {
    propertyItems = specs.spec;
  } else if (specs.item && Array.isArray(specs.item)) {
    propertyItems = specs.item;
  } else if (typeof specs.property === 'object' && specs.property !== null) {
    propertyItems = [specs.property];
  }
  
  if (propertyItems.length === 0) {
    return batch;
  }
  
  for (let i = 0; i < propertyItems.length; i++) {
    const prop = propertyItems[i];
    if (!prop.name && !prop.key) continue;
    
    batch.push({
      product_id: productId,
      name: (prop.name || prop.key).trim(),
      value: prop.value || '',
      language: prop.language || 'en',
      group: prop.group || 'General',
      order: prop.order || i,
      is_filterable: prop.filterable === 'true' || false,
      is_public: prop.public !== 'false', // Default to true unless explicitly set to false
      created_at: new Date(),
      updated_at: new Date()
    });
  }
  
  return batch;
}

/**
 * Main function to run the import process
 */
async function main() {
  let sequelize = null;
  let transaction = null;
  let xmlData = null;
  
  // Increase batch size for better performance
  const BATCH_SIZE = 500; // Increased from 10 to 500 for much better throughput
  
  console.time('Total import time');
  
  console.log('========================================');
  console.log('STARTING DIRECT GEKO XML IMPORT');
  console.log('========================================');
  console.log(`Using XML file: ${xmlFilePath}`);
  console.log('Process environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    NEON_DB_URL: process.env.NEON_DB_URL ? '[SET]' : '[NOT SET]'
  });
  
  try {
    // Configurar cores para console
    colors.setTheme({
      info: 'blue',
      warn: 'yellow',
      error: 'red',
      success: 'green',
      data: 'grey',
      highlight: 'cyan',
      bold: 'bold'
    });
    
    console.log('='.repeat(80).bold);
    console.log('IMPORTAÇÃO DIRETA DE XML GEKO'.bold);
    console.log('='.repeat(80).bold);
    
    // Verificar armazenamento antes de prosseguir
    console.log('\n🔍 Verificando armazenamento disponível...'.info);
    const storageCheck = await checkAndManageStorage({
      warningThresholdPercent: 80,
      criticalThresholdPercent: 95,
      autoCleanupOnWarning: false,
      autoCleanupOnCritical: true,
      preventImportOnCritical: true,
      backupBeforeCleanup: true
    });
    
    if (!storageCheck.canProceed) {
      console.error(`\n❌ IMPORTAÇÃO CANCELADA: ${storageCheck.message}`.error.bold);
      console.log('\nExecute uma destas ações para resolver o problema:'.warn);
      console.log('1. Execute limpeza manual: node storage-management.js cleanup');
      console.log('2. Aumente o limite de armazenamento (upgrade do plano Neon)');
      console.log('3. Importe com opções limitadas: node direct-import-xml.js --limit=100 --skip-images');
      process.exit(1);
    }
    
    if (storageCheck.cleanupPerformed) {
      console.log(`\n✨ LIMPEZA AUTOMÁTICA: ${storageCheck.message}`.info.bold);
      if (storageCheck.cleanupResult) {
        console.log(`   Espaço liberado: ${storageCheck.cleanupResult.spaceFreed.megabytes.toFixed(2)} MB (${storageCheck.cleanupResult.percentReduction.toFixed(1)}%)`.success);
      }
    }
    
    // Exibir detalhes do armazenamento
    console.log('\n📊 Estado atual do armazenamento:'.info);
    console.log(`   Tamanho: ${storageCheck.storageInfo.currentSizeGB.toFixed(3)} GB / ${storageCheck.storageInfo.limit.gb} GB (${storageCheck.storageInfo.percentOfLimit.toFixed(1)}%)`.data);
    console.log(`   Status: ${storageCheck.storageInfo.status.toUpperCase()}`.data);
    
    // Configurar opções de importação com base no status de armazenamento
    const options = {
      skipImages: false,
      limitProductCount: null,
      truncateDescriptions: false,
      maxDescriptionLength: 1000
    };
    
    // Adaptar opções baseado no estado de armazenamento
    if (storageCheck.storageInfo.status === 'warning') {
      console.log('\n⚠️ MODO DE ECONOMIA DE ARMAZENAMENTO ATIVADO'.warn.bold);
      options.limitProductCount = 500;
      options.skipImages = true;
      options.truncateDescriptions = true;
      options.maxDescriptionLength = 200;
    }
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    let xmlFilePath = null;
    
    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith('--')) {
        const [key, value] = args[i].substring(2).split('=');
        
        switch (key) {
          case 'limit':
            options.limitProductCount = parseInt(value, 10);
            break;
          case 'skip-images':
            options.skipImages = true;
            break;
          case 'truncate':
            options.truncateDescriptions = true;
            options.maxDescriptionLength = parseInt(value, 10) || 200;
            break;
        }
      } else if (!xmlFilePath) {
        xmlFilePath = args[i];
      }
    }
    
    // Se não for especificado, usar o arquivo padrão
    if (!xmlFilePath) {
      xmlFilePath = '../../geko_products_en.xml';
      console.log('\n⚠️ Arquivo XML não especificado, usando o padrão:'.warn);
      console.log(`   ${xmlFilePath}`.data);
    }
    
    console.log('\n🔧 Opções de importação:'.info);
    console.log(`   Limite de produtos: ${options.limitProductCount ? options.limitProductCount : 'Sem limite'}`.data);
    console.log(`   Pular imagens: ${options.skipImages ? 'Sim' : 'Não'}`.data);
    console.log(`   Truncar descrições: ${options.truncateDescriptions ? 'Sim' : 'Não'}`.data);
    if (options.truncateDescriptions) {
      console.log(`   Comprimento máximo: ${options.maxDescriptionLength} caracteres`.data);
    }

    // Create direct connection to database using NEON_DB_URL
    console.log('Creating direct database connection...');
    console.time('Database connection');
    if (process.env.NEON_DB_URL) {
      sequelize = new Sequelize(process.env.NEON_DB_URL, {
        dialect: 'postgres',
        logging: false, // Set to console.log for debugging
        ssl: true,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        pool: {
          max: 10, // Increased for better concurrency
          min: 0,
          idle: 20000, // Increased idle timeout
          acquire: 120000, // Increased timeout for batch operations
          evict: 30000 // Cleanup connections more frequently
        }
      });
    } else {
      throw new Error('NEON_DB_URL environment variable is not set');
    }
    
    // Test database connection
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.timeEnd('Database connection');
    console.log('Database connection successful!');
    
    // Define models
    console.log('Defining models...');
    const models = defineModels(sequelize);
    console.log('Models defined successfully.');

    // Read XML file with performance tracking
    console.log('Reading XML file...');
    console.time('XML reading');
    xmlData = fs.readFileSync(xmlFilePath, 'utf8');
    console.timeEnd('XML reading');
    console.log(`Successfully read file with size: ${(xmlData.length / (1024 * 1024)).toFixed(2)} MB`);
    
    // Parse XML data
    console.log('Parsing XML data...');
    console.time('XML parsing');
    try {
      const transformedData = await parse(xmlData);
      console.timeEnd('XML parsing');
      console.log('XML data parsed successfully!');
      console.log(`Found ${transformedData.products.length} products`);
      
      // Free memory - We no longer need the raw XML data
      xmlData = null;
      global.gc && global.gc(); // Trigger garbage collection if available
      
      // Display sample of first product for debugging
      if (transformedData.products.length > 0) {
        console.log('Sample product data:', JSON.stringify(transformedData.products[0], null, 2));
      }
      
      // Start a transaction
      console.log('Starting database transaction...');
      transaction = await sequelize.transaction();
      
      try {
        // Pre-create lookup tables for faster processing
        console.time('Creating lookup tables');
        
        // Create map of product code to array index for faster lookups
        const productCodeMap = {};
        transformedData.products.forEach((product, index) => {
          productCodeMap[product.code] = index;
        });
        
        // Create sets of existing entities to avoid duplicates
        const existingProducerNames = new Set();
        const existingCategoryIds = new Set();
        const existingUnitIds = new Set();
        
        console.timeEnd('Creating lookup tables');
        
        // Process categories if present
        if (transformedData.categories && transformedData.categories.length > 0) {
          console.log(`Importing ${transformedData.categories.length} categories...`);
          console.time('Category import');
          
          // Check for existing categories to avoid duplicates
          try {
            const existingCategories = await models.Category.findAll({
              attributes: ['id'],
              transaction
            });
            existingCategories.forEach(category => existingCategoryIds.add(category.id));
          } catch (error) {
            console.warn('Error checking existing categories:', error.message);
          }
          
          // Filter out existing categories
          const newCategories = transformedData.categories.filter(
            category => !existingCategoryIds.has(category.id)
          );
          
          if (newCategories.length > 0) {
            for (let i = 0; i < newCategories.length; i += BATCH_SIZE) {
              const batch = newCategories.slice(i, i + BATCH_SIZE);
              await models.Category.bulkCreate(batch, { transaction });
              console.log(`Imported categories batch ${i+1} to ${Math.min(i+BATCH_SIZE, newCategories.length)} (${batch.length} records)`);
            }
          }
          console.timeEnd('Category import');
        }
        
        // Process producers if present
        if (transformedData.producers && transformedData.producers.length > 0) {
          console.log(`Importing ${transformedData.producers.length} producers...`);
          console.time('Producer import');
          
          // Check for existing producers to avoid duplicates
          try {
            const existingProducers = await models.Producer.findAll({
              attributes: ['name'],
              transaction
            });
            existingProducers.forEach(producer => existingProducerNames.add(producer.name));
          } catch (error) {
            console.warn('Error checking existing producers:', error.message);
          }
          
          // Filter out existing producers
          const newProducers = transformedData.producers.filter(
            producer => !existingProducerNames.has(producer.name)
          );
          
          if (newProducers.length > 0) {
            for (let i = 0; i < newProducers.length; i += BATCH_SIZE) {
              const batch = newProducers.slice(i, i + BATCH_SIZE);
              await models.Producer.bulkCreate(batch, { transaction });
              console.log(`Imported producers batch ${i+1} to ${Math.min(i+BATCH_SIZE, newProducers.length)} (${batch.length} records)`);
            }
          }
          console.timeEnd('Producer import');
        }
        
        // Process units if present
        if (transformedData.units && transformedData.units.length > 0) {
          console.log(`Importing ${transformedData.units.length} units...`);
          console.time('Unit import');
          
          // Check for existing units to avoid duplicates
          try {
            const existingUnits = await models.Unit.findAll({
              attributes: ['id'],
              transaction
            });
            existingUnits.forEach(unit => existingUnitIds.add(unit.id));
          } catch (error) {
            console.warn('Error checking existing units:', error.message);
          }
          
          // Filter out existing units
          const newUnits = transformedData.units.filter(
            unit => !existingUnitIds.has(unit.id)
          );
          
          if (newUnits.length > 0) {
            for (let i = 0; i < newUnits.length; i += BATCH_SIZE) {
              const batch = newUnits.slice(i, i + BATCH_SIZE);
              await models.Unit.bulkCreate(batch, { transaction });
              console.log(`Imported units batch ${i+1} to ${Math.min(i+BATCH_SIZE, newUnits.length)} (${batch.length} records)`);
            }
          }
          console.timeEnd('Unit import');
        }
        
        // =================== PRODUCT IMPORT ===================
        console.log(`Importing ${transformedData.products.length} products...`);
        console.time('Product import');
        
        const productsWithIds = [];
        const productCodeToId = {};
        
        for (let i = 0; i < transformedData.products.length; i += BATCH_SIZE) {
          // Process product batch
          console.time(`Product batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.products.length)}`);
          const batch = transformedData.products.slice(i, i + BATCH_SIZE);
          
          // Prepare bulk data for faster insert
          const productBulkData = batch.map(product => {
            return {
              code: product.code,
              name: product.name || 'Unnamed Product',
              description_long: product.description || '',
              description_short: product.short_description || ''
            };
          });
          
          try {
            // Bulk create products - without updateOnDuplicate which was causing errors
            const createdProducts = await models.Product.bulkCreate(productBulkData, { 
              transaction,
              returning: true // Get back the inserted records with IDs
            });
            
            // Store created products
            productsWithIds.push(...createdProducts);
            
            // Update product code to ID mapping
            createdProducts.forEach(product => {
              productCodeToId[product.code] = product.id;
            });
          } catch (error) {
            console.error(`Error importing product batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.products.length)}:`, error.message);
            // Continue with next batch instead of failing entire import
          }
          
          console.timeEnd(`Product batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.products.length)}`);
          console.log(`Imported products batch ${i+1} to ${Math.min(i+BATCH_SIZE, transformedData.products.length)} (${productBulkData.length} records)`);
        }
        console.timeEnd('Product import');
        
        // =================== VARIANT IMPORT ===================
        console.log(`Importing ${transformedData.variants.length} variants...`);
        console.time('Variant import');
        
        const variantsWithIds = [];
        const variantCodeToId = {};
        
        for (let i = 0; i < transformedData.variants.length; i += BATCH_SIZE) {
          console.time(`Variant batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.variants.length)}`);
          const batch = transformedData.variants.slice(i, i + BATCH_SIZE);
          
          // Prepare bulk variant data
          const variantBulkData = batch.map(variant => {
            // Get product ID from mapping
            const productId = productCodeToId[variant.code];
            if (!productId) {
              return null; // Skip invalid variants
            }
            
            // Prepare the variant data
            return {
              product_id: productId,
              code: variant.code,
              weight: variant.weight,
              gross_weight: variant.gross_weight
            };
          }).filter(v => v !== null); // Remove null entries
          
          if (variantBulkData.length > 0) {
            try {
              // Bulk create variants - without updateOnDuplicate which was causing errors
              const createdVariants = await models.Variant.bulkCreate(variantBulkData, { 
                transaction,
                returning: true // Return the created objects with IDs
              });
              
              // Store the created variants
              variantsWithIds.push(...createdVariants);
              
              // Update variant code to ID mapping
              createdVariants.forEach(variant => {
                variantCodeToId[variant.code] = variant.id;
              });
            } catch (error) {
              console.error(`Error importing variant batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.variants.length)}:`, error.message);
              // Continue with next batch
            }
          }
          
          console.timeEnd(`Variant batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.variants.length)}`);
          console.log(`Imported variants batch ${i+1} to ${Math.min(i+BATCH_SIZE, transformedData.variants.length)} (${variantBulkData.length} records)`);
        }
        console.timeEnd('Variant import');
        
        // =================== PRICE IMPORT ===================
        if (transformedData.prices && transformedData.prices.length > 0) {
          console.log(`Importing ${transformedData.prices.length} prices...`);
          console.time('Price import');
          
          for (let i = 0; i < transformedData.prices.length; i += BATCH_SIZE) {
            console.time(`Price batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.prices.length)}`);
            const batch = transformedData.prices.slice(i, i + BATCH_SIZE);
            
            // Prepare bulk price data
            const priceBulkData = batch.map(price => {
              const variantId = variantCodeToId[price.code];
              if (!variantId) {
                return null; // Skip invalid prices
              }
              
              return {
                variant_id: variantId,
                gross_price: price.gross_price || 0,
                net_price: price.net_price || 0,
                srp_gross: price.srp_gross || null,
                srp_net: price.srp_net || null
              };
            }).filter(p => p !== null); // Remove null entries
            
            if (priceBulkData.length > 0) {
              try {
                // Bulk create prices - without updateOnDuplicate
                await models.Price.bulkCreate(priceBulkData, { 
                  transaction
                });
              } catch (error) {
                console.error(`Error importing price batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.prices.length)}:`, error.message);
                // Continue with next batch
              }
            }
            
            console.timeEnd(`Price batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.prices.length)}`);
            console.log(`Imported prices batch ${i+1} to ${Math.min(i+BATCH_SIZE, transformedData.prices.length)} (${priceBulkData.length} records)`);
          }
          console.timeEnd('Price import');
        } else {
          console.log('No prices to import');
        }
        
        // =================== IMAGE IMPORT ===================
        if (transformedData.images && transformedData.images.length > 0) {
          console.log(`Importing ${transformedData.images.length} images...`);
          console.time('Image import');
          
          for (let i = 0; i < transformedData.images.length; i += BATCH_SIZE) {
            console.time(`Image batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.images.length)}`);
            const batch = transformedData.images.slice(i, i + BATCH_SIZE);
            
            // Prepare bulk image data
            const imageBulkData = batch.map(image => {
              const productCode = image.product_code || image.code;
              const productId = productCodeToId[productCode];
              
              if (!productId) {
                return null; // Skip invalid images
              }
              
              return {
                product_id: productId,
                url: image.url || '',
                is_main: image.is_main || false,
                display_order: image.display_order || 0
              };
            }).filter(i => i !== null); // Remove null entries
            
            if (imageBulkData.length > 0) {
              try {
                // Bulk create images - without updateOnDuplicate
                await models.Image.bulkCreate(imageBulkData, { 
                  transaction
                });
              } catch (error) {
                console.error(`Error importing image batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.images.length)}:`, error.message);
                // Continue with next batch
              }
            }
            
            console.timeEnd(`Image batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.images.length)}`);
            console.log(`Imported images batch ${i+1} to ${Math.min(i+BATCH_SIZE, transformedData.images.length)} (${imageBulkData.length} records)`);
          }
          console.timeEnd('Image import');
        } else {
          console.log('No images to import');
        }
        
        // Process documents
        const documentBatch = [];
        const propertyBatch = [];
        
        for (let i = 0; i < transformedData.products.length; i++) {
          const product = transformedData.products[i];
          const productId = productCodeToId[product.code];
          
          // Process documents
          await processDocuments(product, productId, documentBatch);
          
          // Process product properties
          await processProductProperties(product, productId, propertyBatch);
        }
        
        // Insert documents in batches
        if (documentBatch.length > 0) {
          const createdDocuments = await Document.bulkCreate(documentBatch, { 
            transaction 
          });
          console.log(`Processed ${createdDocuments.length} documents`);
        }
        
        // Insert product properties in batches
        if (propertyBatch.length > 0) {
          const createdProperties = await ProductProperty.bulkCreate(propertyBatch, { 
            transaction 
          });
          console.log(`Processed ${createdProperties.length} product properties`);
        }
        
        // Commit the transaction
        console.log('Committing transaction...');
        await transaction.commit();
        console.log('Transaction committed successfully.');
        
        // Print import summary
        console.log('========================================');
        console.log('IMPORT SUMMARY');
        console.log('========================================');
        console.log(`Products: ${productsWithIds.length}`);
        console.log(`Variants: ${variantsWithIds.length}`);
        
        // Success!
        console.log('========================================');
        console.log('XML IMPORT COMPLETED SUCCESSFULLY');
        console.log('========================================');
        
      } catch (error) {
        // Rollback the transaction if something goes wrong
        if (transaction) {
          console.error('Error during import, rolling back transaction...');
          await transaction.rollback();
        }
        throw error;
      }
      
    } catch (error) {
      console.error('========================================');
      console.error(`XML IMPORT FAILED: ${error.message}`);
      console.error('========================================');
      console.error(error.stack);
    } finally {
      // Free memory - avoid reference to transformedData which might not exist
      xmlData = null;
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
    // Free memory one last time
    xmlData = null;
    global.gc && global.gc(); // Trigger garbage collection if available
  }

  // Add performance timing at the end of main function
  console.timeEnd('Total import time');
  console.timeEnd('Total execution time');
}

// Run the main function
main(); 