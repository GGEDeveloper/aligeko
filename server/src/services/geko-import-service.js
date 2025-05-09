/**
 * GEKO Import Service
 * 
 * This service is responsible for importing GEKO XML data into the database.
 * It handles transaction management, batch processing, and proper relationship
 * creation between entities.
 */

import logger from '../config/logger.js';
import { Op } from 'sequelize';
import fs from 'fs';
import sequelize from '../config/sequelize.js';
import { Category, Producer, Unit, Product, Variant, Stock, Price, Image, Document, ProductProperty } from '../models/index.js';
import GekoXmlParser from '../utils/geko-xml-parser.js';

/**
 * Service for importing GEKO XML data into the database
 */
class GekoImportService {
  /**
   * Initialize the import service with database models
   * @param {Object} models - Database models
   * @param {Object} options - Import options
   */
  constructor(models, options = {}) {
    this.models = models;
    this.options = {
      batchSize: options.batchSize || 500,
      updateExisting: options.updateExisting || true,
      skipImages: options.skipImages || false,
      ...options
    };
    
    this.stats = {
      created: {},
      updated: {},
      skipped: {},
      errors: {},
      startTime: null,
      endTime: null
    };
    
    this.lookupMaps = {
      categories: new Map(),
      producers: new Map(),
      units: new Map(),
      products: new Map(),
      variants: new Map()
    };
  }
  
  /**
   * Import the parsed data into the database
   * @param {Object} parsedData - Data from the XML parser
   * @param {Object} transaction - Sequelize transaction
   * @returns {Object} Import statistics
   */
  async importData(parsedData, transaction) {
    try {
      this.stats.startTime = new Date();
      logger.info(`Starting GEKO data import with ${this.options.batchSize} batch size`);
      
      // Import in the correct order to maintain relationships
      await this._importCategories(parsedData.categories, transaction);
      await this._importProducers(parsedData.producers, transaction);
      await this._importUnits(parsedData.units, transaction);
      await this._importProducts(parsedData.products, transaction);
      await this._importVariants(parsedData.variants, transaction);
      await this._importStocks(parsedData.stocks, transaction);
      await this._importPrices(parsedData.prices, transaction);
      
      if (!this.options.skipImages) {
        await this._importImages(parsedData.images, transaction);
      }
      
      await this._importDocuments(parsedData.documents, transaction);
      await this._importProductProperties(parsedData.productProperties, transaction);
      
      this.stats.endTime = new Date();
      this.stats.totalTime = (this.stats.endTime - this.stats.startTime) / 1000;
      
      logger.info(`GEKO data import completed in ${this.stats.totalTime.toFixed(2)} seconds`);
      return this.stats;
    } catch (error) {
      logger.error(`Error during GEKO data import: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Import categories in batches
   * @private
   */
  async _importCategories(categories, transaction) {
    if (!categories || categories.length === 0) {
      logger.info('No categories to import');
      return;
    }
    
    logger.info(`Importing ${categories.length} categories`);
    this.stats.created.categories = 0;
    this.stats.updated.categories = 0;
    
    // Process in batches
    for (let i = 0; i < categories.length; i += this.options.batchSize) {
      const batch = categories.slice(i, i + this.options.batchSize);
      const batchPromises = batch.map(async (category) => {
        try {
          // Check if category exists
          const [categoryModel, created] = await this.models.Category.findOrCreate({
            where: { 
              id: category.id 
            },
            defaults: {
              ...category
            },
            transaction
          });
          
          // Update if exists and update option is enabled
          if (!created && this.options.updateExisting) {
            await categoryModel.update(category, { transaction });
            this.stats.updated.categories++;
          } else if (created) {
            this.stats.created.categories++;
          }
          
          // Store in lookup map
          this.lookupMaps.categories.set(category.id, categoryModel.id);
          
        } catch (error) {
          logger.error(`Error importing category ${category.id}: ${error.message}`);
          this.stats.errors.categories = (this.stats.errors.categories || 0) + 1;
        }
      });
      
      await Promise.all(batchPromises);
      logger.info(`Imported categories batch ${i + 1} to ${i + batch.length} of ${categories.length}`);
    }
    
    logger.info(`Categories import completed: ${this.stats.created.categories} created, ${this.stats.updated.categories} updated`);
  }
  
  /**
   * Import producers in batches
   * @private
   */
  async _importProducers(producers, transaction) {
    if (!producers || producers.length === 0) {
      logger.info('No producers to import');
      return;
    }
    
    logger.info(`Importing ${producers.length} producers`);
    this.stats.created.producers = 0;
    this.stats.updated.producers = 0;
    
    // Process in batches
    for (let i = 0; i < producers.length; i += this.options.batchSize) {
      const batch = producers.slice(i, i + this.options.batchSize);
      const batchPromises = batch.map(async (producer) => {
        try {
          // Find by name since it's more reliable than ID
          const [producerModel, created] = await this.models.Producer.findOrCreate({
            where: { 
              name: producer.name 
            },
            defaults: {
              ...producer
            },
            transaction
          });
          
          // Update if exists and update option is enabled
          if (!created && this.options.updateExisting) {
            await producerModel.update(producer, { transaction });
            this.stats.updated.producers++;
          } else if (created) {
            this.stats.created.producers++;
          }
          
          // Store in lookup map
          this.lookupMaps.producers.set(producer.name, producerModel.id);
          
        } catch (error) {
          logger.error(`Error importing producer ${producer.name}: ${error.message}`);
          this.stats.errors.producers = (this.stats.errors.producers || 0) + 1;
        }
      });
      
      await Promise.all(batchPromises);
      logger.info(`Imported producers batch ${i + 1} to ${i + batch.length} of ${producers.length}`);
    }
    
    logger.info(`Producers import completed: ${this.stats.created.producers} created, ${this.stats.updated.producers} updated`);
  }
  
  /**
   * Import units in batches
   * @private
   */
  async _importUnits(units, transaction) {
    if (!units || units.length === 0) {
      logger.info('No units to import');
      return;
    }
    
    logger.info(`Importing ${units.length} units`);
    this.stats.created.units = 0;
    this.stats.updated.units = 0;
    
    // Process in batches
    for (let i = 0; i < units.length; i += this.options.batchSize) {
      const batch = units.slice(i, i + this.options.batchSize);
      const batchPromises = batch.map(async (unit) => {
        try {
          // Find by ID or name
          const [unitModel, created] = await this.models.Unit.findOrCreate({
            where: { 
              [Op.or]: [
                { id: unit.id },
                { name: unit.name }
              ]
            },
            defaults: {
              ...unit
            },
            transaction
          });
          
          // Update if exists and update option is enabled
          if (!created && this.options.updateExisting) {
            await unitModel.update(unit, { transaction });
            this.stats.updated.units++;
          } else if (created) {
            this.stats.created.units++;
          }
          
          // Store in lookup map
          this.lookupMaps.units.set(unit.id, unitModel.id);
          
        } catch (error) {
          logger.error(`Error importing unit ${unit.id || unit.name}: ${error.message}`);
          this.stats.errors.units = (this.stats.errors.units || 0) + 1;
        }
      });
      
      await Promise.all(batchPromises);
      logger.info(`Imported units batch ${i + 1} to ${i + batch.length} of ${units.length}`);
    }
    
    logger.info(`Units import completed: ${this.stats.created.units} created, ${this.stats.updated.units} updated`);
  }
  
  /**
   * Import products in batches
   * @private
   */
  async _importProducts(products, transaction) {
    if (!products || products.length === 0) {
      logger.info('No products to import');
      return;
    }
    
    logger.info(`Importing ${products.length} products`);
    this.stats.created.products = 0;
    this.stats.updated.products = 0;
    
    // Process in batches
    for (let i = 0; i < products.length; i += this.options.batchSize) {
      const batch = products.slice(i, i + this.options.batchSize);
      const batchPromises = batch.map(async (product) => {
        try {
          // Resolve foreign keys
          const productData = { ...product };
          
          // Handle category relationship
          if (this.lookupMaps.categories.has(product.category_id)) {
            productData.category_id = this.lookupMaps.categories.get(product.category_id);
          }
          
          // Handle producer relationship
          if (this.lookupMaps.producers.has(product.producer_id)) {
            productData.producer_id = this.lookupMaps.producers.get(product.producer_id);
          }
          
          // Handle unit relationship
          if (this.lookupMaps.units.has(product.unit_id)) {
            productData.unit_id = this.lookupMaps.units.get(product.unit_id);
          }
          
          // Find or create the product
          const [productModel, created] = await this.models.Product.findOrCreate({
            where: { 
              code: product.code 
            },
            defaults: productData,
            transaction
          });
          
          // Update if exists and update option is enabled
          if (!created && this.options.updateExisting) {
            await productModel.update(productData, { transaction });
            this.stats.updated.products++;
          } else if (created) {
            this.stats.created.products++;
          }
          
          // Store in lookup map
          this.lookupMaps.products.set(product.code, productModel.id);
          
        } catch (error) {
          logger.error(`Error importing product ${product.code}: ${error.message}`);
          this.stats.errors.products = (this.stats.errors.products || 0) + 1;
        }
      });
      
      await Promise.all(batchPromises);
      logger.info(`Imported products batch ${i + 1} to ${i + batch.length} of ${products.length}`);
    }
    
    logger.info(`Products import completed: ${this.stats.created.products} created, ${this.stats.updated.products} updated`);
  }
  
  /**
   * Import variants in batches
   * @private
   */
  async _importVariants(variants, transaction) {
    if (!variants || variants.length === 0) {
      logger.info('No variants to import');
      return;
    }
    
    logger.info(`Importing ${variants.length} variants`);
    this.stats.created.variants = 0;
    this.stats.updated.variants = 0;
    
    // Process in batches
    for (let i = 0; i < variants.length; i += this.options.batchSize) {
      const batch = variants.slice(i, i + this.options.batchSize);
      const batchPromises = batch.map(async (variant) => {
        try {
          // Get product_id from code using lookup map
          const productCode = variant.code.split('-')[0];
          const variantData = { ...variant };
          
          if (this.lookupMaps.products.has(productCode)) {
            variantData.product_id = this.lookupMaps.products.get(productCode);
          } else {
            // Skip if product doesn't exist
            this.stats.skipped.variants = (this.stats.skipped.variants || 0) + 1;
            return;
          }
          
          // Find or create the variant
          const [variantModel, created] = await this.models.Variant.findOrCreate({
            where: { 
              code: variant.code 
            },
            defaults: variantData,
            transaction
          });
          
          // Update if exists and update option is enabled
          if (!created && this.options.updateExisting) {
            await variantModel.update(variantData, { transaction });
            this.stats.updated.variants++;
          } else if (created) {
            this.stats.created.variants++;
          }
          
          // Store in lookup map
          this.lookupMaps.variants.set(variant.code, variantModel.id);
          
        } catch (error) {
          logger.error(`Error importing variant ${variant.code}: ${error.message}`);
          this.stats.errors.variants = (this.stats.errors.variants || 0) + 1;
        }
      });
      
      await Promise.all(batchPromises);
      logger.info(`Imported variants batch ${i + 1} to ${i + batch.length} of ${variants.length}`);
    }
    
    logger.info(`Variants import completed: ${this.stats.created.variants} created, ${this.stats.updated.variants} updated, ${this.stats.skipped.variants || 0} skipped`);
  }
  
  /**
   * Import stocks in batches
   * @private
   */
  async _importStocks(stocks, transaction) {
    if (!stocks || stocks.length === 0) {
      logger.info('No stocks to import');
      return;
    }
    
    logger.info(`Importing ${stocks.length} stocks`);
    this.stats.created.stocks = 0;
    this.stats.updated.stocks = 0;
    
    // Process in batches
    for (let i = 0; i < stocks.length; i += this.options.batchSize) {
      const batch = stocks.slice(i, i + this.options.batchSize);
      const batchPromises = batch.map(async (stock) => {
        try {
          // Get variant_id from code using lookup map
          const stockData = { ...stock };
          
          if (this.lookupMaps.variants.has(stock.variant_code)) {
            stockData.variant_id = this.lookupMaps.variants.get(stock.variant_code);
          } else {
            // Skip if variant doesn't exist
            this.stats.skipped.stocks = (this.stats.skipped.stocks || 0) + 1;
            return;
          }
          
          // Find or create the stock
          const [stockModel, created] = await this.models.Stock.findOrCreate({
            where: { 
              variant_id: stockData.variant_id 
            },
            defaults: stockData,
            transaction
          });
          
          // Update if exists and update option is enabled
          if (!created && this.options.updateExisting) {
            await stockModel.update(stockData, { transaction });
            this.stats.updated.stocks++;
          } else if (created) {
            this.stats.created.stocks++;
          }
          
        } catch (error) {
          logger.error(`Error importing stock for variant ${stock.variant_code}: ${error.message}`);
          this.stats.errors.stocks = (this.stats.errors.stocks || 0) + 1;
        }
      });
      
      await Promise.all(batchPromises);
      logger.info(`Imported stocks batch ${i + 1} to ${i + batch.length} of ${stocks.length}`);
    }
    
    logger.info(`Stocks import completed: ${this.stats.created.stocks} created, ${this.stats.updated.stocks} updated, ${this.stats.skipped.stocks || 0} skipped`);
  }
  
  /**
   * Import prices in batches
   * @private
   */
  async _importPrices(prices, transaction) {
    if (!prices || prices.length === 0) {
      logger.info('No prices to import');
      return;
    }
    
    logger.info(`Importing ${prices.length} prices`);
    this.stats.created.prices = 0;
    this.stats.updated.prices = 0;
    
    // Process in batches
    for (let i = 0; i < prices.length; i += this.options.batchSize) {
      const batch = prices.slice(i, i + this.options.batchSize);
      const batchPromises = batch.map(async (price) => {
        try {
          // Get variant_id from code using lookup map
          const priceData = { ...price };
          
          if (this.lookupMaps.variants.has(price.variant_code)) {
            priceData.variant_id = this.lookupMaps.variants.get(price.variant_code);
          } else {
            // Skip if variant doesn't exist
            this.stats.skipped.prices = (this.stats.skipped.prices || 0) + 1;
            return;
          }
          
          // Find or create the price
          const [priceModel, created] = await this.models.Price.findOrCreate({
            where: { 
              variant_id: priceData.variant_id,
              price_type: priceData.price_type
            },
            defaults: priceData,
            transaction
          });
          
          // Update if exists and update option is enabled
          if (!created && this.options.updateExisting) {
            await priceModel.update(priceData, { transaction });
            this.stats.updated.prices++;
          } else if (created) {
            this.stats.created.prices++;
          }
          
        } catch (error) {
          logger.error(`Error importing price for variant ${price.variant_code}: ${error.message}`);
          this.stats.errors.prices = (this.stats.errors.prices || 0) + 1;
        }
      });
      
      await Promise.all(batchPromises);
      logger.info(`Imported prices batch ${i + 1} to ${i + batch.length} of ${prices.length}`);
    }
    
    logger.info(`Prices import completed: ${this.stats.created.prices} created, ${this.stats.updated.prices} updated, ${this.stats.skipped.prices || 0} skipped`);
  }
  
  /**
   * Import images in batches
   * @private
   */
  async _importImages(images, transaction) {
    if (!images || images.length === 0) {
      logger.info('No images to import');
      return;
    }
    
    logger.info(`Importing ${images.length} images`);
    this.stats.created.images = 0;
    this.stats.updated.images = 0;
    
    // Process in batches
    for (let i = 0; i < images.length; i += this.options.batchSize) {
      const batch = images.slice(i, i + this.options.batchSize);
      const batchPromises = batch.map(async (image) => {
        try {
          // Get product_id using lookup map
          const imageData = { ...image };
          
          if (!imageData.product_id && this.lookupMaps.products.has(image.product_code)) {
            imageData.product_id = this.lookupMaps.products.get(image.product_code);
          } else if (!imageData.product_id) {
            // Skip if product doesn't exist
            this.stats.skipped.images = (this.stats.skipped.images || 0) + 1;
            return;
          }
          
          // Find or create the image
          const [imageModel, created] = await this.models.Image.findOrCreate({
            where: { 
              product_id: imageData.product_id,
              url: imageData.url
            },
            defaults: imageData,
            transaction
          });
          
          // Update if exists and update option is enabled
          if (!created && this.options.updateExisting) {
            await imageModel.update(imageData, { transaction });
            this.stats.updated.images++;
          } else if (created) {
            this.stats.created.images++;
          }
          
        } catch (error) {
          logger.error(`Error importing image ${image.url}: ${error.message}`);
          this.stats.errors.images = (this.stats.errors.images || 0) + 1;
        }
      });
      
      await Promise.all(batchPromises);
      logger.info(`Imported images batch ${i + 1} to ${i + batch.length} of ${images.length}`);
    }
    
    logger.info(`Images import completed: ${this.stats.created.images} created, ${this.stats.updated.images} updated, ${this.stats.skipped.images || 0} skipped`);
  }
  
  /**
   * Import documents in batches
   * @private
   */
  async _importDocuments(documents, transaction) {
    if (!documents || documents.length === 0) {
      logger.info('No documents to import');
      return;
    }
    
    logger.info(`Importing ${documents.length} documents`);
    this.stats.created.documents = 0;
    this.stats.updated.documents = 0;
    
    // Process in batches
    for (let i = 0; i < documents.length; i += this.options.batchSize) {
      const batch = documents.slice(i, i + this.options.batchSize);
      const batchPromises = batch.map(async (document) => {
        try {
          // Get product_id using lookup map
          const documentData = { ...document };
          
          if (!documentData.product_id && this.lookupMaps.products.has(document.product_code)) {
            documentData.product_id = this.lookupMaps.products.get(document.product_code);
          } else if (!documentData.product_id) {
            // Skip if product doesn't exist
            this.stats.skipped.documents = (this.stats.skipped.documents || 0) + 1;
            return;
          }
          
          // Find or create the document
          const [documentModel, created] = await this.models.Document.findOrCreate({
            where: { 
              product_id: documentData.product_id,
              url: documentData.url
            },
            defaults: documentData,
            transaction
          });
          
          // Update if exists and update option is enabled
          if (!created && this.options.updateExisting) {
            await documentModel.update(documentData, { transaction });
            this.stats.updated.documents++;
          } else if (created) {
            this.stats.created.documents++;
          }
          
        } catch (error) {
          logger.error(`Error importing document ${document.url}: ${error.message}`);
          this.stats.errors.documents = (this.stats.errors.documents || 0) + 1;
        }
      });
      
      await Promise.all(batchPromises);
      logger.info(`Imported documents batch ${i + 1} to ${i + batch.length} of ${documents.length}`);
    }
    
    logger.info(`Documents import completed: ${this.stats.created.documents} created, ${this.stats.updated.documents} updated, ${this.stats.skipped.documents || 0} skipped`);
  }
  
  /**
   * Import product properties in batches
   * @private
   */
  async _importProductProperties(productProperties, transaction) {
    if (!productProperties || productProperties.length === 0) {
      logger.info('No product properties to import');
      return;
    }
    
    logger.info(`Importing ${productProperties.length} product properties`);
    this.stats.created.productProperties = 0;
    this.stats.updated.productProperties = 0;
    
    // Process in batches
    for (let i = 0; i < productProperties.length; i += this.options.batchSize) {
      const batch = productProperties.slice(i, i + this.options.batchSize);
      const batchPromises = batch.map(async (property) => {
        try {
          // Get product_id using lookup map
          const propertyData = { ...property };
          
          if (!propertyData.product_id && this.lookupMaps.products.has(property.product_code)) {
            propertyData.product_id = this.lookupMaps.products.get(property.product_code);
          } else if (!propertyData.product_id) {
            // Skip if product doesn't exist
            this.stats.skipped.productProperties = (this.stats.skipped.productProperties || 0) + 1;
            return;
          }
          
          // Find or create the property
          const [propertyModel, created] = await this.models.ProductProperty.findOrCreate({
            where: { 
              product_id: propertyData.product_id,
              name: propertyData.name
            },
            defaults: propertyData,
            transaction
          });
          
          // Update if exists and update option is enabled
          if (!created && this.options.updateExisting) {
            await propertyModel.update(propertyData, { transaction });
            this.stats.updated.productProperties++;
          } else if (created) {
            this.stats.created.productProperties++;
          }
          
        } catch (error) {
          logger.error(`Error importing product property ${property.name}: ${error.message}`);
          this.stats.errors.productProperties = (this.stats.errors.productProperties || 0) + 1;
        }
      });
      
      await Promise.all(batchPromises);
      logger.info(`Imported product properties batch ${i + 1} to ${i + batch.length} of ${productProperties.length}`);
    }
    
    logger.info(`Product properties import completed: ${this.stats.created.productProperties} created, ${this.stats.updated.productProperties} updated, ${this.stats.skipped.productProperties || 0} skipped`);
  }
  
  /**
   * Extracts documents from product XML data
   * 
   * @param {Object} product - The product XML data
   * @param {Object} transformedData - The transformed data object
   * @param {number} productId - The ID of the product these documents belong to
   * @returns {Array} - Array of document objects
   */
  _extractDocuments(product, transformedData, productId) {
    const documents = [];
    
    if (!product.documents || !Array.isArray(product.documents.document)) {
      return documents;
    }
    
    // Process document entries
    product.documents.document.forEach((doc, index) => {
      if (!doc.url) return; // Skip if no URL
      
      documents.push({
        product_id: productId,
        url: doc.url.trim(),
        type: doc.type || null,
        title: doc.title || doc.name || `Document ${index + 1}`,
        language: doc.language || 'en',
        created_at: new Date(),
        updated_at: new Date()
      });
    });
    
    return documents;
  }
  
  /**
   * Extracts product properties (specifications) from product XML data
   * 
   * @param {Object} product - The product XML data
   * @param {Object} transformedData - The transformed data object
   * @param {number} productId - The ID of the product these properties belong to
   * @returns {Array} - Array of property objects
   */
  _extractProductProperties(product, transformedData, productId) {
    const properties = [];
    
    // Check for specs/properties in various possible XML structures
    const specs = product.specifications || product.properties || product.specs || {};
    let propertyItems = [];
    
    if (specs.property && Array.isArray(specs.property)) {
      propertyItems = specs.property;
    } else if (specs.spec && Array.isArray(specs.spec)) {
      propertyItems = specs.spec;
    } else if (specs.item && Array.isArray(specs.item)) {
      propertyItems = specs.item;
    }
    
    // No properties found
    if (propertyItems.length === 0) {
      return properties;
    }
    
    // Process each property
    propertyItems.forEach((prop, index) => {
      // Skip if no name/key
      if (!prop.name && !prop.key) return;
      
      properties.push({
        product_id: productId,
        name: (prop.name || prop.key).trim(),
        value: prop.value || '',
        language: prop.language || 'en',
        group: prop.group || 'General',
        order: prop.order || index,
        is_filterable: prop.filterable === 'true' || false,
        is_public: prop.public !== 'false', // Default to true unless explicitly set to false
        created_at: new Date(),
        updated_at: new Date()
      });
    });
    
    return properties;
  }
  
  /**
   * Processes product data and creates database records
   * 
   * @param {Object} product - The product XML data
   * @param {Object} transformedData - The transformed data with maps for lookups
   * @returns {Object} - Object with product details and IDs
   */
  async _processProduct(product, transformedData) {
    try {
      // ... existing code ...
      
      // Extract documents if available
      const documents = this._extractDocuments(product, transformedData, productId);
      if (documents.length > 0) {
        transformedData.documents.push(...documents);
      }
      
      // Extract product properties if available
      const properties = this._extractProductProperties(product, transformedData, productId);
      if (properties.length > 0) {
        transformedData.productProperties.push(...properties);
      }
      
      // ... rest of existing code ...
    } catch (error) {
      this.logger.error(`Error processing product: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Initialize the transformed data structure
   * @private
   */
  _initializeTransformedData() {
    return {
      products: [],
      categories: new Map(),
      producers: new Map(),
      units: new Map(),
      variants: [],
      stocks: [],
      prices: [],
      images: [],
      documents: [],
      productProperties: []
    };
  }
  
  /**
   * Persist the transformed data using the optimized DatabasePersistenceService
   * @param {Object} transformedData - The transformed data to persist
   * @param {Object} options - Persistence options
   * @returns {Object} - Result of the persistence operation
   */
  async persistTransformedData(transformedData, options = {}) {
    logger.info('Starting optimized database persistence...');
    
    try {
      // Import the DatabasePersistenceService
      const DatabasePersistenceService = (await import('./database-persistence.service.js')).default;
      
      // Create an instance with merged options
      const persistenceOptions = {
        batchSize: options.batchSize || 500,
        updateExisting: options.updateExisting !== false,
        skipImages: options.skipImages || false,
        logLevel: options.logLevel || 'info',
        retryAttempts: options.retryAttempts || 3
      };
      
      const databaseService = new DatabasePersistenceService(persistenceOptions);
      
      // Start timing
      const startTime = new Date();
      
      // Persist the data
      const result = await databaseService.processTransformedData(transformedData, persistenceOptions);
      
      // Calculate performance metrics
      const totalTime = (new Date() - startTime) / 1000;
      const recordsPerSecond = Math.round(
        (transformedData.products?.length || 0 + 
         transformedData.variants?.length || 0 + 
         transformedData.images?.length || 0) / totalTime
      );
      
      logger.info(`Database persistence completed in ${totalTime.toFixed(2)}s (${recordsPerSecond} records/sec)`);
      
      return {
        success: true,
        totalTime,
        recordsPerSecond,
        stats: result.stats,
        entityCounts: {
          products: transformedData.products?.length || 0,
          variants: transformedData.variants?.length || 0,
          prices: transformedData.prices?.length || 0,
          images: transformedData.images?.length || 0,
          categories: transformedData.categories?.length || 0,
          producers: transformedData.producers?.length || 0,
          units: transformedData.units?.length || 0,
          stocks: transformedData.stocks?.length || 0,
          documents: transformedData.documents?.length || 0,
          productProperties: transformedData.productProperties?.length || 0
        }
      };
    } catch (error) {
      logger.error(`Database persistence failed: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }
  
  /**
   * Save the transformed data to the database using transaction
   * @private
   */
  async _saveToDatabase(transformedData, transaction) {
    // ... existing code ...
  }

  /**
   * Process an uploaded XML file
   * 
   * @param {string} filePath - Path to the uploaded XML file
   * @param {Object} options - Import options
   * @param {boolean} options.skipImages - Whether to skip image processing
   * @param {Function} options.progressCallback - Callback for progress updates
   * @returns {Promise<Object>} - Import results
   */
  async processUploadedXmlFile(filePath, options = {}) {
    const startTime = new Date();
    const stats = {
      totalProducts: 0,
      importedProducts: 0,
      skippedProducts: 0,
      errors: []
    };
    
    try {
      logger.info(`Starting import of file: ${filePath}`);
      
      // Read XML file
      const xmlData = fs.readFileSync(filePath, 'utf8');
      logger.info(`Read ${xmlData.length} bytes from file`);
      
      // Report initial progress
      if (options.progressCallback) {
        options.progressCallback(5); // 5% progress after reading file
      }
      
      // Parse XML
      const parser = new GekoXmlParser();
      const transformedData = await parser.parse(xmlData);
      
      // Report progress after parsing
      if (options.progressCallback) {
        options.progressCallback(30); // 30% progress after parsing
      }
      
      // Get product count
      stats.totalProducts = transformedData.products.length;
      logger.info(`Parsed ${stats.totalProducts} products from XML`);
      
      // Use database transaction
      const transaction = await sequelize.transaction();
      
      try {
        // Process in batches for better performance
        const BATCH_SIZE = 500;
        
        // Calculate total entities for progress tracking
        const totalEntities = 
          transformedData.categories.size + 
          transformedData.producers.size + 
          transformedData.units.size + 
          transformedData.products.length + 
          transformedData.variants.length + 
          transformedData.prices.length + 
          transformedData.stocks.length + 
          transformedData.images.length +
          transformedData.documents.length +
          transformedData.productProperties.length;
        
        let processedEntities = 0;
        const updateProgress = () => {
          if (options.progressCallback) {
            // Scale progress from 30% to 95%
            const progressPercent = 30 + Math.floor((processedEntities / totalEntities) * 65);
            options.progressCallback(Math.min(95, progressPercent));
          }
        };
        
        // Insert categories
        logger.info(`Importing ${transformedData.categories.size} categories`);
        for (const category of transformedData.categories.values()) {
          try {
            await Category.upsert(category, { transaction });
            processedEntities++;
            updateProgress();
          } catch (error) {
            logger.error(`Error importing category ${category.id}: ${error.message}`);
            stats.errors.push({
              type: 'category',
              id: category.id,
              error: error.message
            });
          }
        }
        
        // Insert producers
        logger.info(`Importing ${transformedData.producers.size} producers`);
        for (const producer of transformedData.producers.values()) {
          try {
            await Producer.upsert(producer, { transaction });
            processedEntities++;
            updateProgress();
          } catch (error) {
            logger.error(`Error importing producer ${producer.name}: ${error.message}`);
            stats.errors.push({
              type: 'producer',
              name: producer.name,
              error: error.message
            });
          }
        }
        
        // Insert units
        logger.info(`Importing ${transformedData.units.size} units`);
        for (const unit of transformedData.units.values()) {
          try {
            await Unit.upsert(unit, { transaction });
            processedEntities++;
            updateProgress();
          } catch (error) {
            logger.error(`Error importing unit ${unit.id}: ${error.message}`);
            stats.errors.push({
              type: 'unit',
              id: unit.id,
              error: error.message
            });
          }
        }
        
        // Process products in batches
        logger.info(`Importing ${transformedData.products.length} products`);
        for (let i = 0; i < transformedData.products.length; i += BATCH_SIZE) {
          const batch = transformedData.products.slice(i, i + BATCH_SIZE);
          try {
            const createdProducts = await Product.bulkCreate(batch, { 
              transaction,
              updateOnDuplicate: ['name', 'description', 'ean', 'producer_code', 'category_id', 'producer_id', 'unit_id', 'updated_at']
            });
            
            // Map product code to ID for references
            const productCodeToId = {};
            createdProducts.forEach(product => {
              productCodeToId[product.code] = product.id;
            });
            
            // Update product IDs in related entities
            this._updateProductReferences(transformedData, productCodeToId, i, BATCH_SIZE);
            
            stats.importedProducts += batch.length;
            processedEntities += batch.length;
            updateProgress();
            
            logger.info(`Imported batch ${i+1} to ${Math.min(i+BATCH_SIZE, transformedData.products.length)} of ${transformedData.products.length} products`);
          } catch (error) {
            logger.error(`Error importing product batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.products.length)}: ${error.message}`);
            stats.errors.push({
              type: 'product_batch',
              batchStart: i,
              batchEnd: Math.min(i+BATCH_SIZE, transformedData.products.length),
              error: error.message
            });
            stats.skippedProducts += batch.length;
          }
        }
        
        // Process variants
        if (transformedData.variants.length > 0) {
          logger.info(`Importing ${transformedData.variants.length} variants`);
          for (let i = 0; i < transformedData.variants.length; i += BATCH_SIZE) {
            const batch = transformedData.variants.slice(i, i + BATCH_SIZE);
            try {
              await Variant.bulkCreate(batch, { 
                transaction,
                updateOnDuplicate: ['product_id', 'weight', 'gross_weight', 'updated_at']
              });
              processedEntities += batch.length;
              updateProgress();
            } catch (error) {
              logger.error(`Error importing variant batch: ${error.message}`);
              stats.errors.push({
                type: 'variant_batch',
                batchStart: i,
                batchEnd: Math.min(i+BATCH_SIZE, transformedData.variants.length),
                error: error.message
              });
            }
          }
        }
        
        // Process stocks
        if (transformedData.stocks.length > 0) {
          logger.info(`Importing ${transformedData.stocks.length} stocks`);
          for (let i = 0; i < transformedData.stocks.length; i += BATCH_SIZE) {
            const batch = transformedData.stocks.slice(i, i + BATCH_SIZE);
            try {
              await Stock.bulkCreate(batch, { 
                transaction,
                updateOnDuplicate: ['quantity', 'available', 'min_order_quantity', 'updated_at']
              });
              processedEntities += batch.length;
              updateProgress();
            } catch (error) {
              logger.error(`Error importing stock batch: ${error.message}`);
              stats.errors.push({
                type: 'stock_batch',
                batchStart: i,
                batchEnd: Math.min(i+BATCH_SIZE, transformedData.stocks.length),
                error: error.message
              });
            }
          }
        }
        
        // Process prices
        if (transformedData.prices.length > 0) {
          logger.info(`Importing ${transformedData.prices.length} prices`);
          for (let i = 0; i < transformedData.prices.length; i += BATCH_SIZE) {
            const batch = transformedData.prices.slice(i, i + BATCH_SIZE);
            try {
              await Price.bulkCreate(batch, { 
                transaction,
                updateOnDuplicate: ['amount', 'currency', 'type', 'updated_at']
              });
              processedEntities += batch.length;
              updateProgress();
            } catch (error) {
              logger.error(`Error importing price batch: ${error.message}`);
              stats.errors.push({
                type: 'price_batch',
                batchStart: i,
                batchEnd: Math.min(i+BATCH_SIZE, transformedData.prices.length),
                error: error.message
              });
            }
          }
        }
        
        // Process images
        if (!options.skipImages && transformedData.images.length > 0) {
          logger.info(`Importing ${transformedData.images.length} images`);
          for (let i = 0; i < transformedData.images.length; i += BATCH_SIZE) {
            const batch = transformedData.images.slice(i, i + BATCH_SIZE);
            try {
              await Image.bulkCreate(batch, { 
                transaction,
                updateOnDuplicate: ['url', 'is_main', 'order', 'updated_at']
              });
              processedEntities += batch.length;
              updateProgress();
            } catch (error) {
              logger.error(`Error importing image batch: ${error.message}`);
              stats.errors.push({
                type: 'image_batch',
                batchStart: i,
                batchEnd: Math.min(i+BATCH_SIZE, transformedData.images.length),
                error: error.message
              });
            }
          }
        }
        
        // Process documents
        if (transformedData.documents.length > 0) {
          logger.info(`Importing ${transformedData.documents.length} documents`);
          for (let i = 0; i < transformedData.documents.length; i += BATCH_SIZE) {
            const batch = transformedData.documents.slice(i, i + BATCH_SIZE);
            try {
              await Document.bulkCreate(batch, { 
                transaction,
                updateOnDuplicate: ['url', 'type', 'title', 'language', 'updated_at']
              });
              processedEntities += batch.length;
              updateProgress();
            } catch (error) {
              logger.error(`Error importing document batch: ${error.message}`);
              stats.errors.push({
                type: 'document_batch',
                batchStart: i,
                batchEnd: Math.min(i+BATCH_SIZE, transformedData.documents.length),
                error: error.message
              });
            }
          }
        }
        
        // Process product properties
        if (transformedData.productProperties.length > 0) {
          logger.info(`Importing ${transformedData.productProperties.length} product properties`);
          for (let i = 0; i < transformedData.productProperties.length; i += BATCH_SIZE) {
            const batch = transformedData.productProperties.slice(i, i + BATCH_SIZE);
            try {
              await ProductProperty.bulkCreate(batch, { 
                transaction,
                updateOnDuplicate: ['name', 'value', 'group', 'language', 'order', 'is_filterable', 'is_public', 'updated_at']
              });
              processedEntities += batch.length;
              updateProgress();
            } catch (error) {
              logger.error(`Error importing product property batch: ${error.message}`);
              stats.errors.push({
                type: 'property_batch',
                batchStart: i,
                batchEnd: Math.min(i+BATCH_SIZE, transformedData.productProperties.length),
                error: error.message
              });
            }
          }
        }
        
        // Commit transaction
        await transaction.commit();
        logger.info('Transaction committed successfully');
        
        // Final progress update
        if (options.progressCallback) {
          options.progressCallback(100);
        }
        
        // Calculate import duration
        const endTime = new Date();
        const durationMs = endTime - startTime;
        
        // Return success response
        return {
          success: true,
          message: 'Import completed successfully',
          duration: durationMs / 1000, // in seconds
          stats: {
            totalProducts: stats.totalProducts,
            importedProducts: stats.importedProducts,
            skippedProducts: stats.skippedProducts,
            categoriesCount: transformedData.categories.size,
            producersCount: transformedData.producers.size,
            unitsCount: transformedData.units.size,
            variantsCount: transformedData.variants.length,
            stocksCount: transformedData.stocks.length,
            pricesCount: transformedData.prices.length,
            imagesCount: options.skipImages ? 0 : transformedData.images.length,
            documentsCount: transformedData.documents.length,
            propertiesCount: transformedData.productProperties.length,
            errorsCount: stats.errors.length
          },
          errors: stats.errors.slice(0, 100) // Limit errors to first 100
        };
      } catch (error) {
        // Rollback transaction on error
        await transaction.rollback();
        logger.error(`Transaction rolled back: ${error.message}`);
        
        return {
          success: false,
          message: `Import failed: ${error.message}`,
          error: error.message,
          stats: {
            totalProducts: stats.totalProducts,
            importedProducts: stats.importedProducts,
            skippedProducts: stats.skippedProducts,
            errorsCount: stats.errors.length + 1
          },
          errors: [
            ...stats.errors.slice(0, 99),
            {
              type: 'transaction',
              error: error.message
            }
          ]
        };
      }
    } catch (error) {
      logger.error(`File processing error: ${error.message}`);
      
      return {
        success: false,
        message: `File processing failed: ${error.message}`,
        error: error.message
      };
    }
  }
  
  /**
   * Update product references in related entities
   * 
   * @param {Object} transformedData - Transformed data
   * @param {Object} productCodeToId - Map of product code to ID
   * @param {number} batchStart - Start index of current batch
   * @param {number} batchSize - Size of current batch
   */
  _updateProductReferences(transformedData, productCodeToId, batchStart, batchSize) {
    const batchEnd = Math.min(batchStart + batchSize, transformedData.products.length);
    
    // Update variants
    transformedData.variants.forEach(variant => {
      if (variant.product_code >= batchStart && variant.product_code < batchEnd) {
        variant.product_id = productCodeToId[variant.product_code];
        delete variant.product_code;
      }
    });
    
    // Update images
    transformedData.images.forEach(image => {
      if (image.product_code >= batchStart && image.product_code < batchEnd) {
        image.product_id = productCodeToId[image.product_code];
        delete image.product_code;
      }
    });
    
    // Update documents
    transformedData.documents.forEach(document => {
      if (document.product_code >= batchStart && document.product_code < batchEnd) {
        document.product_id = productCodeToId[document.product_code];
        delete document.product_code;
      }
    });
    
    // Update product properties
    transformedData.productProperties.forEach(property => {
      if (property.product_code >= batchStart && property.product_code < batchEnd) {
        property.product_id = productCodeToId[property.product_code];
        delete property.product_code;
      }
    });
  }
}

export default GekoImportService; 