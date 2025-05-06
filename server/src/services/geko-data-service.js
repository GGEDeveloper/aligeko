import axios from 'axios';
import { XmlParser } from '../utils/xml-parser';
import { logger } from '../config/logger';
import { 
  Product, 
  Category, 
  Producer, 
  Unit, 
  Variant, 
  Stock, 
  Price, 
  Image 
} from '../models';
import sequelize from '../config/database';
import { SyncHealthService } from './sync-health-service';

/**
 * GekoDataService
 * Service for integrating with the GEKO API
 * Handles fetching XML data, parsing, transformation, and database insertion
 */
export class GekoDataService {
  /**
   * Fetch XML data from GEKO API
   * @param {string} apiUrl - The GEKO API URL
   * @param {Object} tracking - Health tracking object
   * @returns {Promise<string>} - The XML data as a string
   */
  static async fetchXmlData(apiUrl, tracking = null) {
    try {
      logger.info(`Fetching XML data from GEKO API: ${apiUrl}`);
      const response = await axios.get(apiUrl, {
        timeout: 30000, // 30 seconds timeout
        responseType: 'text',
        headers: {
          'Accept': 'application/xml'
        }
      });
      
      logger.info('Successfully fetched XML data from GEKO API');
      return {
        data: response.data,
        size: response.data.length,
      };
    } catch (error) {
      if (tracking) {
        SyncHealthService.recordError(
          tracking, 
          'API_FETCH', 
          `Failed to fetch XML data: ${error.message}`,
          { url: apiUrl }
        );
      }
      logger.error(`Error fetching XML data: ${error.message}`);
      throw new Error(`Failed to fetch XML data: ${error.message}`);
    }
  }

  /**
   * Process XML data and persist to database
   * @param {string} xmlData - The XML data as a string
   * @param {Object} tracking - Health tracking object
   * @returns {Promise<Object>} - Processing statistics
   */
  static async processXmlData(xmlData, tracking = null) {
    let transaction;
    
    try {
      logger.info('Starting XML data processing');
      
      // Parse XML data
      const parsedData = await XmlParser.parseXml(xmlData);
      
      // Transform data to match database schema
      const transformedData = XmlParser.transformData(parsedData);
      
      // Start database transaction
      transaction = await sequelize.transaction();
      
      // Insert data into database
      const stats = await this._insertDataToDatabase(transformedData, transaction, tracking);
      
      // Commit transaction
      await transaction.commit();
      
      logger.info(`XML data processing completed. Stats: ${JSON.stringify(stats)}`);
      return stats;
    } catch (error) {
      // Rollback transaction if it exists
      if (transaction) await transaction.rollback();
      
      if (tracking) {
        SyncHealthService.recordError(
          tracking, 
          'XML_PROCESSING', 
          `Failed to process XML data: ${error.message}`
        );
      }
      
      logger.error(`Error processing XML data: ${error.message}`);
      throw new Error(`Failed to process XML data: ${error.message}`);
    }
  }

  /**
   * Insert transformed data into the database
   * @param {Object} data - Transformed data
   * @param {Transaction} transaction - Sequelize transaction
   * @param {Object} tracking - Health tracking object
   * @returns {Promise<Object>} - Database insertion statistics
   * @private
   */
  static async _insertDataToDatabase(data, transaction, tracking = null) {
    const stats = {
      categories: 0,
      producers: 0,
      units: 0,
      products: 0,
      variants: 0,
      stocks: 0,
      prices: 0,
      images: 0
    };
    
    // Insert categories
    if (data.categories && data.categories.length > 0) {
      logger.info(`Inserting ${data.categories.length} categories`);
      for (const category of data.categories) {
        try {
          await Category.upsert(category, { transaction });
          stats.categories++;
        } catch (error) {
          if (tracking) {
            SyncHealthService.recordError(
              tracking, 
              'DB_INSERT_CATEGORY', 
              `Error inserting category ${category.id}: ${error.message}`,
              { category }
            );
          }
          logger.error(`Error inserting category ${category.id}: ${error.message}`);
        }
      }
      if (tracking) {
        SyncHealthService.updateItemsProcessed(tracking, 'categories', stats.categories);
      }
    }
    
    // Insert producers
    if (data.producers && data.producers.length > 0) {
      logger.info(`Inserting ${data.producers.length} producers`);
      for (const producer of data.producers) {
        try {
          await Producer.upsert(producer, { transaction });
          stats.producers++;
        } catch (error) {
          if (tracking) {
            SyncHealthService.recordError(
              tracking, 
              'DB_INSERT_PRODUCER', 
              `Error inserting producer ${producer.name}: ${error.message}`,
              { producer }
            );
          }
          logger.error(`Error inserting producer ${producer.name}: ${error.message}`);
        }
      }
      if (tracking) {
        SyncHealthService.updateItemsProcessed(tracking, 'producers', stats.producers);
      }
    }
    
    // Insert units
    if (data.units && data.units.length > 0) {
      logger.info(`Inserting ${data.units.length} units`);
      for (const unit of data.units) {
        try {
          await Unit.upsert(unit, { transaction });
          stats.units++;
        } catch (error) {
          if (tracking) {
            SyncHealthService.recordError(
              tracking, 
              'DB_INSERT_UNIT', 
              `Error inserting unit ${unit.id}: ${error.message}`,
              { unit }
            );
          }
          logger.error(`Error inserting unit ${unit.id}: ${error.message}`);
        }
      }
      if (tracking) {
        SyncHealthService.updateItemsProcessed(tracking, 'units', stats.units);
      }
    }
    
    // Insert products
    if (data.products && data.products.length > 0) {
      logger.info(`Inserting ${data.products.length} products`);
      for (const product of data.products) {
        try {
          await Product.upsert(product, { transaction });
          stats.products++;
        } catch (error) {
          if (tracking) {
            SyncHealthService.recordError(
              tracking, 
              'DB_INSERT_PRODUCT', 
              `Error inserting product ${product.code}: ${error.message}`,
              { product }
            );
          }
          logger.error(`Error inserting product ${product.code}: ${error.message}`);
        }
      }
      if (tracking) {
        SyncHealthService.updateItemsProcessed(tracking, 'products', stats.products);
      }
    }
    
    // Insert variants
    if (data.variants && data.variants.length > 0) {
      logger.info(`Inserting ${data.variants.length} variants`);
      for (const variant of data.variants) {
        try {
          await Variant.upsert(variant, { transaction });
          stats.variants++;
        } catch (error) {
          if (tracking) {
            SyncHealthService.recordError(
              tracking, 
              'DB_INSERT_VARIANT', 
              `Error inserting variant ${variant.code}: ${error.message}`,
              { variant }
            );
          }
          logger.error(`Error inserting variant ${variant.code}: ${error.message}`);
        }
      }
      if (tracking) {
        SyncHealthService.updateItemsProcessed(tracking, 'variants', stats.variants);
      }
    }
    
    // Insert stocks
    if (data.stocks && data.stocks.length > 0) {
      logger.info(`Inserting ${data.stocks.length} stocks`);
      for (const stock of data.stocks) {
        try {
          await Stock.upsert(stock, { transaction });
          stats.stocks++;
        } catch (error) {
          if (tracking) {
            SyncHealthService.recordError(
              tracking, 
              'DB_INSERT_STOCK', 
              `Error inserting stock for variant ${stock.variant_id}: ${error.message}`,
              { stock }
            );
          }
          logger.error(`Error inserting stock for variant ${stock.variant_id}: ${error.message}`);
        }
      }
      if (tracking) {
        SyncHealthService.updateItemsProcessed(tracking, 'stocks', stats.stocks);
      }
    }
    
    // Insert prices
    if (data.prices && data.prices.length > 0) {
      logger.info(`Inserting ${data.prices.length} prices`);
      for (const price of data.prices) {
        try {
          await Price.upsert(price, { transaction });
          stats.prices++;
        } catch (error) {
          if (tracking) {
            SyncHealthService.recordError(
              tracking, 
              'DB_INSERT_PRICE', 
              `Error inserting price for variant ${price.variant_id}: ${error.message}`,
              { price }
            );
          }
          logger.error(`Error inserting price for variant ${price.variant_id}: ${error.message}`);
        }
      }
      if (tracking) {
        SyncHealthService.updateItemsProcessed(tracking, 'prices', stats.prices);
      }
    }
    
    // Insert images
    if (data.images && data.images.length > 0) {
      logger.info(`Inserting ${data.images.length} images`);
      for (const image of data.images) {
        try {
          await Image.upsert(image, { transaction });
          stats.images++;
        } catch (error) {
          if (tracking) {
            SyncHealthService.recordError(
              tracking, 
              'DB_INSERT_IMAGE', 
              `Error inserting image for product ${image.product_id}: ${error.message}`,
              { image }
            );
          }
          logger.error(`Error inserting image for product ${image.product_id}: ${error.message}`);
        }
      }
      if (tracking) {
        SyncHealthService.updateItemsProcessed(tracking, 'images', stats.images);
      }
    }
    
    return stats;
  }

  /**
   * Schedule synchronization with GEKO API
   * @param {string} apiUrl - The GEKO API URL
   * @param {number} intervalMinutes - Synchronization interval in minutes
   * @returns {Object} - The scheduled job information
   */
  static scheduleSync(apiUrl, intervalMinutes = 30) {
    try {
      const cron = require('node-cron');
      
      // Create a cron expression for the specified interval (default: every 30 minutes)
      const cronExpression = `*/${intervalMinutes} * * * *`;
      
      logger.info(`Scheduling GEKO API sync every ${intervalMinutes} minutes`);
      
      // Schedule the task
      const scheduledTask = cron.schedule(cronExpression, async () => {
        try {
          logger.info('Starting scheduled GEKO API sync');
          
          // Start health tracking
          const tracking = SyncHealthService.startSyncTracking('scheduled', apiUrl);
          
          // Fetch and process XML data
          const { data: xmlData, size: requestSize } = await this.fetchXmlData(apiUrl, tracking);
          const stats = await this.processXmlData(xmlData, tracking);
          
          // Determine status based on errors
          const status = tracking.errors.length === 0 ? 'success' : 
                        (stats && Object.values(stats).some(val => val > 0) ? 'partial_success' : 'failed');
          
          // Finish health tracking
          await SyncHealthService.finishSyncTracking(tracking, status, requestSize);
          
          logger.info(`Scheduled GEKO API sync completed. Stats: ${JSON.stringify(stats)}`);
        } catch (error) {
          logger.error(`Scheduled GEKO API sync failed: ${error.message}`);
        }
      });
      
      return {
        task: scheduledTask,
        expression: cronExpression,
        intervalMinutes
      };
    } catch (error) {
      logger.error(`Error scheduling GEKO API sync: ${error.message}`);
      throw new Error(`Failed to schedule GEKO API sync: ${error.message}`);
    }
  }

  /**
   * Run a manual synchronization with GEKO API
   * @param {string} apiUrl - The GEKO API URL
   * @returns {Promise<Object>} - Processing information
   */
  static async runManualSync(apiUrl) {
    try {
      logger.info(`Running manual GEKO API sync with URL: ${apiUrl}`);
      
      // Start health tracking
      const tracking = SyncHealthService.startSyncTracking('manual', apiUrl);
      const startTime = new Date();
      
      // Fetch and process XML data
      const { data: xmlData, size: requestSize } = await this.fetchXmlData(apiUrl, tracking);
      const stats = await this.processXmlData(xmlData, tracking);
      
      const endTime = new Date();
      const duration = (endTime - startTime) / 1000; // in seconds
      
      // Determine status based on errors
      const status = tracking.errors.length === 0 ? 'success' : 
                    (stats && Object.values(stats).some(val => val > 0) ? 'partial_success' : 'failed');
      
      // Finish health tracking
      await SyncHealthService.finishSyncTracking(tracking, status, requestSize);
      
      logger.info(`Manual GEKO API sync completed in ${duration} seconds. Stats: ${JSON.stringify(stats)}`);
      
      return {
        success: true,
        duration,
        stats
      };
    } catch (error) {
      logger.error(`Error running manual GEKO API sync: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
} 