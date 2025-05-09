/**
 * Database Persistence Service
 * 
 * A specialized service for efficiently persisting XML import data to the database.
 * Handles transaction management, batch processing, and proper relationship maintenance.
 * Optimized for large data imports with memory management and error recovery.
 */

import { Op } from 'sequelize';
import sequelize from '../config/sequelize.js';
import logger from '../config/logger.js';
import { 
  Product, Category, Producer, Unit, Variant, 
  Stock, Price, Image, Document, ProductProperty 
} from '../models/index.js';

class DatabasePersistenceService {
  /**
   * Initialize the persistence service with options
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      batchSize: options.batchSize || 500,
      updateExisting: options.updateExisting !== false,
      skipImages: options.skipImages || false,
      retryAttempts: options.retryAttempts || 3,
      memoryManagement: options.memoryManagement !== false,
      logLevel: options.logLevel || 'info',
      ...options
    };
    
    // Initialize stats tracking
    this.stats = {
      created: {},
      updated: {},
      skipped: {},
      errors: {},
      processingTime: {},
      startTime: null,
      endTime: null,
      totalTime: null
    };
    
    // Entity lookup maps for maintaining relationships
    this.lookupMaps = {
      categories: new Map(),
      producers: new Map(),
      units: new Map(),
      products: new Map(),
      variants: new Map()
    };
    
    // Database models
    this.models = {
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
  
  /**
   * Persist the transformed data to the database with optimized batch processing
   * @param {Object} transformedData - The data to persist
   * @returns {Object} Import statistics
   */
  async persistData(transformedData) {
    // Start timing
    this.stats.startTime = new Date();
    logger.info(`Starting database persistence with batch size ${this.options.batchSize}`);
    
    // Create a database transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Import entities in order of dependencies
      await this._persistCategories(transformedData.categories, transaction);
      await this._persistProducers(transformedData.producers, transaction);
      await this._persistUnits(transformedData.units, transaction);
      await this._persistProducts(transformedData.products, transaction);
      await this._persistVariants(transformedData.variants, transaction);
      await this._persistStocks(transformedData.stocks, transaction);
      await this._persistPrices(transformedData.prices, transaction);
      
      // Skip images if configured
      if (!this.options.skipImages) {
        await this._persistImages(transformedData.images, transaction);
      } else {
        logger.info('Skipping image import as configured');
      }
      
      // Import additional entities
      await this._persistDocuments(transformedData.documents, transaction);
      await this._persistProductProperties(transformedData.productProperties, transaction);
      
      // Commit transaction
      await transaction.commit();
      
      // Record completion time
      this.stats.endTime = new Date();
      this.stats.totalTime = (this.stats.endTime - this.stats.startTime) / 1000;
      
      logger.info(`Database persistence completed in ${this.stats.totalTime.toFixed(2)} seconds`);
      return this.stats;
      
    } catch (error) {
      // Rollback transaction on error
      logger.error(`Error during database persistence: ${error.message}`);
      await transaction.rollback();
      throw error;
    } finally {
      // Free memory if memory management is enabled
      if (this.options.memoryManagement) {
        this._freeMemory();
      }
    }
  }
  
  /**
   * Persist categories with batch processing
   * @private
   */
  async _persistCategories(categories, transaction) {
    if (!categories || categories.length === 0) {
      logger.info('No categories to persist');
      return;
    }
    
    const startTime = Date.now();
    logger.info(`Persisting ${categories.length} categories`);
    this.stats.created.categories = 0;
    this.stats.updated.categories = 0;
    
    // Pre-fetch existing categories for lookup
    const existingCategories = await this.models.Category.findAll({
      attributes: ['id', 'name'],
      transaction
    });
    
    const existingCategoryIds = new Set();
    existingCategories.forEach(category => existingCategoryIds.add(category.id));
    
    // Process in batches
    for (let i = 0; i < categories.length; i += this.options.batchSize) {
      const batch = categories.slice(i, i + this.options.batchSize);
      
      // Filter new vs existing
      const newCategories = [];
      const updateOperations = [];
      
      batch.forEach(category => {
        if (existingCategoryIds.has(category.id)) {
          if (this.options.updateExisting) {
            updateOperations.push(
              this.models.Category.update(category, {
                where: { id: category.id },
                transaction
              }).then(() => {
                this.stats.updated.categories++;
              }).catch(error => {
                logger.error(`Error updating category ${category.id}: ${error.message}`);
                this.stats.errors.categories = (this.stats.errors.categories || 0) + 1;
              })
            );
          }
        } else {
          newCategories.push(category);
        }
        
        // Store in lookup map regardless
        this.lookupMaps.categories.set(category.id, category.id);
      });
      
      // Bulk create new categories
      if (newCategories.length > 0) {
        try {
          const result = await this.models.Category.bulkCreate(newCategories, {
            transaction
          });
          this.stats.created.categories += result.length;
        } catch (error) {
          logger.error(`Error creating categories batch: ${error.message}`);
          this.stats.errors.categories = (this.stats.errors.categories || 0) + 1;
        }
      }
      
      // Wait for all update operations to complete
      if (updateOperations.length > 0) {
        await Promise.all(updateOperations);
      }
      
      logger.info(`Processed categories batch ${i+1} to ${Math.min(i+this.options.batchSize, categories.length)}`);
    }
    
    this.stats.processingTime.categories = (Date.now() - startTime) / 1000;
    logger.info(`Categories persistence completed in ${this.stats.processingTime.categories.toFixed(2)}s: ${this.stats.created.categories} created, ${this.stats.updated.categories} updated`);
  }
  
  /**
   * Persist producers with batch processing
   * @private
   */
  async _persistProducers(producers, transaction) {
    if (!producers || producers.length === 0) {
      logger.info('No producers to persist');
      return;
    }
    
    const startTime = Date.now();
    logger.info(`Persisting ${producers.length} producers`);
    this.stats.created.producers = 0;
    this.stats.updated.producers = 0;
    
    // Pre-fetch existing producers for lookup
    const existingProducers = await this.models.Producer.findAll({
      attributes: ['id', 'name'],
      transaction
    });
    
    const existingProducerNames = new Set();
    const producerNameToId = new Map();
    
    existingProducers.forEach(producer => {
      existingProducerNames.add(producer.name);
      producerNameToId.set(producer.name, producer.id);
    });
    
    // Process in batches
    for (let i = 0; i < producers.length; i += this.options.batchSize) {
      const batch = producers.slice(i, i + this.options.batchSize);
      
      // Filter new vs existing
      const newProducers = [];
      
      batch.forEach(producer => {
        if (existingProducerNames.has(producer.name)) {
          // No updates needed for producers, just map the ID
          this.lookupMaps.producers.set(producer.name, producerNameToId.get(producer.name));
        } else {
          newProducers.push(producer);
        }
      });
      
      // Bulk create new producers
      if (newProducers.length > 0) {
        try {
          const result = await this.models.Producer.bulkCreate(newProducers, {
            transaction,
            returning: true
          });
          
          // Update lookup maps with newly created producers
          result.forEach(producer => {
            this.lookupMaps.producers.set(producer.name, producer.id);
            producerNameToId.set(producer.name, producer.id);
            existingProducerNames.add(producer.name);
          });
          
          this.stats.created.producers += result.length;
        } catch (error) {
          logger.error(`Error creating producers batch: ${error.message}`);
          this.stats.errors.producers = (this.stats.errors.producers || 0) + 1;
        }
      }
      
      logger.info(`Processed producers batch ${i+1} to ${Math.min(i+this.options.batchSize, producers.length)}`);
    }
    
    this.stats.processingTime.producers = (Date.now() - startTime) / 1000;
    logger.info(`Producers persistence completed in ${this.stats.processingTime.producers.toFixed(2)}s: ${this.stats.created.producers} created, ${this.stats.updated.producers} updated`);
  }
  
  /**
   * Free memory and trigger garbage collection
   * @private
   */
  _freeMemory() {
    // Attempt to trigger garbage collection if available
    if (global.gc) {
      global.gc();
      logger.debug('Manually triggered garbage collection');
    } 
  }
  
  /**
   * Process an uploaded XML file
   * @param {Object} transformedData - The data transformed from XML
   * @param {Object} options - Processing options
   * @returns {Object} - Processing statistics
   */
  async processTransformedData(transformedData, options = {}) {
    try {
      // Start tracking import metrics
      const startTime = new Date();
      logger.info(`Starting database persistence for ${transformedData.products?.length || 0} products`);
      
      // Merge options
      const processingOptions = { ...this.options, ...options };
      
      // Create a new persistence service with the merged options
      const persistenceService = new DatabasePersistenceService(processingOptions);
      
      // Persist the data
      const stats = await persistenceService.persistData(transformedData);
      
      // Calculate total time
      const totalTime = (new Date() - startTime) / 1000;
      
      // Return comprehensive statistics
      return {
        success: true,
        stats,
        totalTime,
        productsProcessed: transformedData.products?.length || 0,
        variantsProcessed: transformedData.variants?.length || 0,
        imagesProcessed: transformedData.images?.length || 0
      };
    } catch (error) {
      logger.error(`Error processing transformed data: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        details: error.stack
      };
    }
  }
}

export default DatabasePersistenceService; 