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
import { checkAndManageStorage } from './storage-management.js';
import colors from 'colors';

// Start global performance measurements
console.time('Tempo total de execução');

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from absolute path
const envPath = path.resolve(__dirname, '../../../.env');
console.log(`Carregando variáveis de ambiente de: ${envPath}`);
dotenv.config({ path: envPath });

// Show database connection parameters without exposing sensitive data
console.log('Parâmetros de Conexão com o Banco de Dados:');
console.log('NODE_ENV =', process.env.NODE_ENV);
console.log('NEON_DB_URL está definido:', !!process.env.NEON_DB_URL);
console.log('POSTGRES_URL está definido:', !!process.env.POSTGRES_URL);
console.log('DB_HOST =', process.env.DB_HOST);
console.log('DB_PORT =', process.env.DB_PORT);
console.log('DB_USER está definido:', !!process.env.DB_USER);
console.log('DB_NAME =', process.env.DB_NAME);
console.log('DB_SSL =', process.env.DB_SSL);

/**
 * Define models directly in this script to avoid import issues
 */
function defineModels(sequelize) {
  // Product Model
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
      unique: true
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
    },
    ean: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    producer_code: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category_id: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    producer_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_id: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    vat: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 23
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: 'active'
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['code'] }]
  });

  // Category Model
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
    },
    parent_id: {
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

  // Producer Model
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
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Producer',
    tableName: 'producers',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['name'] }]
  });

  // Unit Model
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

  // Variant Model
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
      unique: true
    },
    weight: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    gross_weight: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    size: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    color: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: 'active'
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
    ]
  });

  // Stock Model
  class Stock extends Model {}
  Stock.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    }
  }, {
    sequelize,
    modelName: 'Stock',
    tableName: 'stocks',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['variant_id'] }]
  });

  // Price Model
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
    price_type: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: 'retail'
    },
    currency: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: 'EUR'
    },
    min_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Price',
    tableName: 'prices',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['variant_id'] }]
  });

  // Image Model
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
    indexes: [{ fields: ['product_id'] }]
  });

  // Document Model
  class Document extends Model {}
  Document.init({
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
    type: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: 'pdf'
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    language: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: 'en'
    }
  }, {
    sequelize,
    modelName: 'Document',
    tableName: 'documents',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['product_id'] }]
  });

  // ProductProperty Model
  class ProductProperty extends Model {}
  ProductProperty.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    group: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: 'General'
    },
    language: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: 'en'
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    is_filterable: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'ProductProperty',
    tableName: 'product_properties',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['product_id'] },
      { fields: ['name'] }
    ]
  });

  // Define relationships
  Product.hasMany(Variant, { foreignKey: 'product_id' });
  Variant.belongsTo(Product, { foreignKey: 'product_id' });

  Variant.hasMany(Price, { foreignKey: 'variant_id' });
  Price.belongsTo(Variant, { foreignKey: 'variant_id' });
  
  Variant.hasOne(Stock, { foreignKey: 'variant_id' });
  Stock.belongsTo(Variant, { foreignKey: 'variant_id' });

  Product.hasMany(Image, { foreignKey: 'product_id' });
  Image.belongsTo(Product, { foreignKey: 'product_id' });

  Product.hasMany(Document, { foreignKey: 'product_id' });
  Document.belongsTo(Product, { foreignKey: 'product_id' });

  Product.hasMany(ProductProperty, { foreignKey: 'product_id' });
  ProductProperty.belongsTo(Product, { foreignKey: 'product_id' });

  return {
    Product,
    Category,
    Producer,
    Unit,
    Variant,
    Stock,
    Price,
    Image,
    Document,
    ProductProperty
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
  
  console.time('Tempo total de importação');
  
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
  
  try {
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
    console.log('Criando conexão direta com o banco de dados...'.info);
    console.time('Conexão com banco de dados');
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
      throw new Error('Variável de ambiente NEON_DB_URL não está definida');
    }
    
    // Test database connection
    console.log('Testando conexão com o banco de dados...'.info);
    await sequelize.authenticate();
    console.timeEnd('Conexão com banco de dados');
    console.log('Conexão com o banco de dados bem-sucedida!'.success);
    
    // Define models
    console.log('Definindo modelos...'.info);
    const models = defineModels(sequelize);
    console.log('Modelos definidos com sucesso.'.success);

    // Read XML file with performance tracking
    console.log('Lendo arquivo XML...'.info);
    console.time('Leitura do XML');
    xmlData = fs.readFileSync(xmlFilePath, 'utf8');
    console.timeEnd('Leitura do XML');
    console.log(`Arquivo lido com sucesso, tamanho: ${(xmlData.length / (1024 * 1024)).toFixed(2)} MB`.success);
    
    // Parse XML data
    console.log('Analisando dados XML...'.info);
    console.time('Análise do XML');
    try {
      const transformedData = await parse(xmlData);
      console.timeEnd('Análise do XML');
      console.log('Dados XML analisados com sucesso!'.success);
      console.log(`Encontrados ${transformedData.products.length} produtos`.success);
      
      // Free memory - We no longer need the raw XML data
      xmlData = null;
      global.gc && global.gc(); // Trigger garbage collection if available
      
      // Display sample of first product for debugging
      if (transformedData.products.length > 0) {
        console.log('Amostra de dados do produto:'.data, JSON.stringify(transformedData.products[0], null, 2));
      }
      
      // Limit product count if specified
      if (options.limitProductCount && transformedData.products.length > options.limitProductCount) {
        console.log(`\n⚠️ Limitando a ${options.limitProductCount} produtos (de ${transformedData.products.length})`.warn);
        transformedData.products = transformedData.products.slice(0, options.limitProductCount);
        
        // Clean up relationships for non-imported products
        const includedProductCodes = new Set(transformedData.products.map(p => p.code));
        
        transformedData.variants = transformedData.variants.filter(v => 
          includedProductCodes.has(v.product_code));
          
        transformedData.images = transformedData.images.filter(i => 
          includedProductCodes.has(i.product_code));
      }
      
      // Truncate descriptions if specified
      if (options.truncateDescriptions) {
        console.log(`\n📝 Truncando descrições longas para máximo de ${options.maxDescriptionLength} caracteres`.info);
        transformedData.products.forEach(product => {
          if (product.long_description && product.long_description.length > options.maxDescriptionLength) {
            product.long_description = product.long_description.substring(0, options.maxDescriptionLength) + '...';
          }
          if (product.short_description && product.short_description.length > Math.floor(options.maxDescriptionLength / 2)) {
            product.short_description = product.short_description.substring(0, Math.floor(options.maxDescriptionLength / 2)) + '...';
          }
        });
      }
      
      // Start a transaction
      console.log('Iniciando transação no banco de dados...'.info);
      transaction = await sequelize.transaction();
      
      try {
        // Create GekoImportService instance
        console.log('Inicializando serviço de importação GEKO...'.info);
        const GekoImportService = (await import('../services/geko-import-service.js')).default;
        const gekoImportService = new GekoImportService(models, {
          batchSize: BATCH_SIZE,
          updateExisting: true,
          skipImages: options.skipImages
        });
        
        // Import data
        console.log('Importando dados...'.info);
        console.time('Importação de dados');
        const importStats = await gekoImportService.importData(transformedData, transaction);
        console.timeEnd('Importação de dados');
        
        // Commit transaction
        console.log('Confirmando transação...'.info);
        await transaction.commit();
        
        // Log import statistics
        console.log('='.repeat(80).bold);
        console.log('IMPORTAÇÃO CONCLUÍDA COM SUCESSO!'.success.bold);
        console.log('='.repeat(80).bold);
        console.log('\n📊 Estatísticas de importação:'.info);
        console.log(`   Tempo total: ${importStats.totalTime.toFixed(2)} segundos`.data);
        
        // Log created entities
        console.log('\n✨ Entidades Criadas:'.success);
        Object.entries(importStats.created).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`.data);
        });
        
        // Log updated entities
        console.log('\n🔄 Entidades Atualizadas:'.info);
        Object.entries(importStats.updated).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`.data);
        });
        
        // Log skipped entities
        if (Object.keys(importStats.skipped).length > 0) {
          console.log('\n⚠️ Entidades Ignoradas:'.warn);
          Object.entries(importStats.skipped).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`.data);
          });
        }
        
        // Log errors
        if (Object.keys(importStats.errors).length > 0) {
          console.log('\n❌ Erros:'.error);
          Object.entries(importStats.errors).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`.data);
          });
        }
        
        // Check storage state after import
        console.log('\n🔍 Verificando novo estado do armazenamento...'.info);
        const newStorageInfo = await checkAndManageStorage();
        console.log(`   Tamanho após importação: ${newStorageInfo.storageInfo.currentSizeGB.toFixed(3)} GB / ${newStorageInfo.storageInfo.limit.gb} GB (${newStorageInfo.storageInfo.percentOfLimit.toFixed(1)}%)`.data);
        console.log(`   Status: ${newStorageInfo.storageInfo.status.toUpperCase()}`.data);
        
        // Final timing
        console.timeEnd('Tempo total de importação');
        console.log('\n✅ Processo de importação concluído com sucesso!'.success.bold);
        
      } catch (error) {
        // Rollback transaction in case of error
        if (transaction) {
          console.log('Revertendo transação devido a erro...'.error);
          await transaction.rollback();
        }
        
        throw error;
      } finally {
        // Final cleanup
        if (sequelize) {
          await sequelize.close();
        }
      }
    } catch (error) {
      console.error('========================================');
      console.error(`FALHA NA IMPORTAÇÃO XML: ${error.message}`.error);
      console.error('========================================');
      console.error(error.stack);
    } finally {
      // Free memory one last time
      xmlData = null;
      global.gc && global.gc(); // Trigger garbage collection if available
    }
  } catch (error) {
    console.error('========================================');
    console.error(`FALHA NA IMPORTAÇÃO XML: ${error.message}`.error);
    console.error('========================================');
    console.error(error.stack);
  } finally {
    // Free memory one last time
    xmlData = null;
    global.gc && global.gc(); // Trigger garbage collection if available
  }

  // Add performance timing at the end of main function
  console.timeEnd('Tempo total de execução');
}

// Run the main function
main(); 