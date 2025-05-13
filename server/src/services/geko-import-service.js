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
import sequelize from '../config/database.js';
import models from '../models/index.js';
import GekoXmlParser from '../utils/geko-xml-parser.js';
import { checkAndManageStorage } from '../scripts/storage-management.js';

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
      useFindOrCreate: options.useFindOrCreate || false,
      modelStatus: options.modelStatus || {},
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
      if (parsedData.categories && parsedData.categories.length > 0) {
        await this._importCategories(parsedData.categories, transaction);
      }
      
      if (parsedData.producers && parsedData.producers.length > 0) {
        await this._importProducers(parsedData.producers, transaction);
      }
      
      if (parsedData.units && parsedData.units.length > 0) {
        await this._importUnits(parsedData.units, transaction);
      }
      
      if (parsedData.products && parsedData.products.length > 0) {
        await this._importProducts(parsedData.products, transaction);
      }
      
      if (parsedData.variants && parsedData.variants.length > 0) {
        await this._importVariants(parsedData.variants, transaction);
      }
      
      if (parsedData.stocks && parsedData.stocks.length > 0) {
        await this._importStocks(parsedData.stocks, transaction);
      }
      
      if (parsedData.prices && parsedData.prices.length > 0) {
        await this._importPrices(parsedData.prices, transaction);
      }
      
      if (!this.options.skipImages && parsedData.images && parsedData.images.length > 0) {
        await this._importImages(parsedData.images, transaction);
      }
      
      // Only process these if they exist in the data and in the models
      const canImportDocuments = 
        this.models.Document && 
        (!this.options.modelStatus.Document === false) && 
        parsedData.documents && 
        parsedData.documents.length > 0;
      
      if (canImportDocuments) {
        await this._importDocuments(parsedData.documents, transaction);
      } else if (parsedData.documents && parsedData.documents.length > 0) {
        logger.warn(`Skipping ${parsedData.documents.length} documents because Document model is not available`);
        this.stats.skipped.documents = parsedData.documents.length;
      }
      
      const canImportProductProperties = 
        this.models.ProductProperty && 
        (!this.options.modelStatus.ProductProperty === false) && 
        parsedData.productProperties && 
        parsedData.productProperties.length > 0;
      
      if (canImportProductProperties) {
        await this._importProductProperties(parsedData.productProperties, transaction);
      } else if (parsedData.productProperties && parsedData.productProperties.length > 0) {
        logger.warn(`Skipping ${parsedData.productProperties.length} product properties because ProductProperty model is not available`);
        this.stats.skipped.productProperties = parsedData.productProperties.length;
      }
      
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
   * Método utilitário para importar em lotes com findOrCreate ou bulkCreate
   * @param {Array} items - Itens a importar
   * @param {Object} model - Modelo Sequelize
   * @param {Object} whereField - Campo para usar na cláusula where
   * @param {Array} updateFields - Campos para atualizar se registro existir
   * @param {Object} transaction - Transação do Sequelize
   * @param {String} entityName - Nome da entidade para estatísticas
   * @private
   */
  async _batchImport(items, model, whereField, updateFields, transaction, entityName) {
    if (!items || items.length === 0) return;
    
    const useFindOrCreate = true; // Always use findOrCreate for better error handling
    this.stats.created[entityName] = this.stats.created[entityName] || 0;
    this.stats.updated[entityName] = this.stats.updated[entityName] || 0;
    this.stats.errors[entityName] = this.stats.errors[entityName] || 0;
    
    // Log the import start
    logger.info(`Importing ${items.length} ${entityName} in ${Math.ceil(items.length / this.options.batchSize)} batches`);
    
    // Processar em lotes
    for (let i = 0; i < items.length; i += this.options.batchSize) {
      const batch = items.slice(i, i + this.options.batchSize);
      logger.info(`Imported ${entityName} batch ${i + 1} to ${Math.min(i + batch.length, items.length)} of ${items.length}`);
      
      if (useFindOrCreate) {
        const batchPromises = [];
        
        // Create promises for each item but don't await them yet
        for (const item of batch) {
          if (!item[whereField]) {
            logger.warn(`Skipping ${entityName} without ${whereField}`);
            continue;
          }
          
          // Create promise but don't await
          const importPromise = (async () => {
            try {
              const whereClause = {};
              whereClause[whereField] = item[whereField];
              
              const [entity, created] = await model.findOrCreate({
                where: whereClause,
                defaults: item,
                transaction
              });
              
              if (created) {
                this.stats.created[entityName]++;
              } else if (this.options.updateExisting) {
                // Criar objeto de atualização apenas com os campos permitidos
                const updateData = {};
                updateFields.forEach(field => {
                  if (item[field] !== undefined) {
                    updateData[field] = item[field];
                  }
                });
                
                // Atualizar timestamp
                updateData.updated_at = new Date();
                
                await entity.update(updateData, { transaction });
                this.stats.updated[entityName]++;
              }
              
              // Para categorias, produtores, etc., manter o mapa de consulta
              if (entityName === 'categories' && item.id) {
                this.lookupMaps.categories.set(item.id, entity.id);
              } else if (entityName === 'producers' && item.name) {
                this.lookupMaps.producers.set(item.name, entity.id);
              } else if (entityName === 'units' && item.id) {
                this.lookupMaps.units.set(item.id, entity.id);
              } else if (entityName === 'products' && item.code) {
                this.lookupMaps.products.set(item.code, entity.id);
              } else if (entityName === 'variants' && item.code) {
                this.lookupMaps.variants.set(item.code, entity.id);
              }
              
              return { success: true, entity };
            } catch (error) {
              logger.error(`Error importing ${entityName} with ${whereField}=${item[whereField]}: ${error.message}`);
              this.stats.errors[entityName]++;
              return { success: false, error };
            }
          })();
          
          batchPromises.push(importPromise);
        }
        
        // Now resolve all promises in the batch
        await Promise.allSettled(batchPromises);
      } else {
        // This code path is no longer used but kept for reference
        try {
          const result = await model.bulkCreate(batch, {
            updateOnDuplicate: updateFields,
            transaction
          });
          
          result.forEach(entity => {
            if (entity._isNewRecord) {
              this.stats.created[entityName]++;
            } else {
              this.stats.updated[entityName]++;
            }
            
            if (entityName === 'categories' && entity.id) {
              this.lookupMaps.categories.set(entity.id, entity.id);
            } else if (entityName === 'producers' && entity.name) {
              this.lookupMaps.producers.set(entity.name, entity.id);
            } else if (entityName === 'units' && entity.id) {
              this.lookupMaps.units.set(entity.id, entity.id);
            } else if (entityName === 'products' && entity.code) {
              this.lookupMaps.products.set(entity.code, entity.id);
            } else if (entityName === 'variants' && entity.code) {
              this.lookupMaps.variants.set(entity.code, entity.id);
            }
          });
        } catch (error) {
          logger.error(`Error batch importing ${entityName}: ${error.message}`);
          this.stats.errors[entityName] = (this.stats.errors[entityName] || 0) + batch.length;
        }
      }
    }
    
    // Log import completion
    logger.info(`${entityName} import completed: ${this.stats.created[entityName] || 0} created, ${this.stats.updated[entityName] || 0} updated, ${this.stats.errors[entityName] || 0} errors`);
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
    
    // Check if Category model exists
    if (!this.models.Category) {
      logger.warn('Category model not found in models object, skipping categories import');
      return;
    }
    
    logger.info(`Importing ${categories.length} categories`);
    await this._batchImport(
      categories,
      this.models.Category,
      'id',
      ['name', 'path', 'parent_id', 'idosell_path', 'updated_at'],
      transaction,
      'categories'
    );
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
    
    // Check if Producer model exists
    if (!this.models.Producer) {
      logger.warn('Producer model not found in models object, skipping producers import');
      return;
    }
    
    logger.info(`Importing ${producers.length} producers`);
    await this._batchImport(
      producers,
      this.models.Producer,
      'name',
      ['description', 'website', 'updated_at'],
      transaction,
      'producers'
    );
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
    
    // Check if Unit model exists
    if (!this.models.Unit) {
      logger.warn('Unit model not found in models object, skipping units import');
      return;
    }
    
    logger.info(`Importing ${units.length} units`);
    await this._batchImport(
      units,
      this.models.Unit,
      'id',
      ['name', 'moq', 'updated_at'],
      transaction,
      'units'
    );
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
    
    // Check if Product model exists
    if (!this.models.Product) {
      logger.warn('Product model not found in models object, skipping products import');
      return;
    }
    
    logger.info(`Importing ${products.length} products`);
    
    // Preparar produtos com IDs de relacionamento corretos
    const preparedProducts = products.map(product => {
      // Clonar produto para não modificar o original
      const preparedProduct = { ...product };
      
      // Verificar e atualizar o ID da categoria
      if (product.category_id && this.lookupMaps.categories.has(product.category_id)) {
        preparedProduct.category_id = this.lookupMaps.categories.get(product.category_id);
      }
      
      // Verificar e atualizar o ID do produtor
      if (product.producer_id && this.lookupMaps.producers.has(product.producer_id)) {
        preparedProduct.producer_id = this.lookupMaps.producers.get(product.producer_id);
      } else if (product.producer_name && this.lookupMaps.producers.has(product.producer_name)) {
        preparedProduct.producer_id = this.lookupMaps.producers.get(product.producer_name);
      }
      
      // Verificar e atualizar o ID da unidade
      if (product.unit_id && this.lookupMaps.units.has(product.unit_id)) {
        preparedProduct.unit_id = this.lookupMaps.units.get(product.unit_id);
      }
      
      return preparedProduct;
    });
    
    await this._batchImport(
      preparedProducts,
      this.models.Product,
      'code',
      [
        'name', 'code_on_card', 'ean', 'producer_code', 'description_short', 
        'description_long', 'description_html', 'vat', 'url', 'delivery_date',
        'category_id', 'producer_id', 'unit_id', 'status', 'discontinued', 'updated_at'
      ],
      transaction,
      'products'
    );
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
    
    // Check if Variant model exists
    if (!this.models.Variant) {
      logger.warn('Variant model not found in models object, skipping variants import');
      return;
    }
    
    logger.info(`Importing ${variants.length} variants`);
    
    // Preparar variantes com product_id correto
    const preparedVariants = variants.map(variant => {
      // Clonar variante para não modificar o original
      const preparedVariant = { ...variant };
      
      // Identificar o product_id correto
      if (variant.product_code && this.lookupMaps.products.has(variant.product_code)) {
        preparedVariant.product_id = this.lookupMaps.products.get(variant.product_code);
      }
      
      return preparedVariant;
    });
    
    // Filtrar só variantes com product_id válido
    const validVariants = preparedVariants.filter(v => v.product_id);
    
    if (validVariants.length < variants.length) {
      logger.warn(`Skipping ${variants.length - validVariants.length} variants without valid product reference`);
      this.stats.skipped.variants = (this.stats.skipped.variants || 0) + (variants.length - validVariants.length);
    }
    
    await this._batchImport(
      validVariants,
      this.models.Variant,
      'code',
      ['product_id', 'name', 'weight', 'gross_weight', 'size', 'color', 'status', 'updated_at'],
      transaction,
      'variants'
    );
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
    
    // Check if Stock model exists
    if (!this.models.Stock) {
      logger.warn('Stock model not found in models object, skipping stocks import');
      return;
    }
    
    logger.info(`Importing ${stocks.length} stocks`);
    
    // Preparar estoques com variant_id correto
    const preparedStocks = stocks.map(stock => {
      // Clonar estoque para não modificar o original
      const preparedStock = { ...stock };
      
      // Identificar o variant_id correto
      if (stock.variant_code && this.lookupMaps.variants.has(stock.variant_code)) {
        preparedStock.variant_id = this.lookupMaps.variants.get(stock.variant_code);
      }
      
      return preparedStock;
    });
    
    // Filtrar só estoques com variant_id válido
    const validStocks = preparedStocks.filter(s => s.variant_id);
    
    if (validStocks.length < stocks.length) {
      logger.warn(`Skipping ${stocks.length - validStocks.length} stocks without valid variant reference`);
      this.stats.skipped.stocks = (this.stats.skipped.stocks || 0) + (stocks.length - validStocks.length);
    }
    
    await this._batchImport(
      validStocks,
      this.models.Stock,
      'variant_id',
      ['quantity', 'available', 'min_order_quantity', 'updated_at'],
      transaction,
      'stocks'
    );
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
    
    // Check if Price model exists
    if (!this.models.Price) {
      logger.warn('Price model not found in models object, skipping prices import');
      return;
    }
    
    logger.info(`Importing ${prices.length} prices`);
    
    // Preparar preços com variant_id correto
    const preparedPrices = prices.map(price => {
      // Clonar preço para não modificar o original
      const preparedPrice = { ...price };
      
      // Identificar o variant_id correto
      if (price.variant_code && this.lookupMaps.variants.has(price.variant_code)) {
        preparedPrice.variant_id = this.lookupMaps.variants.get(price.variant_code);
      }
      
      return preparedPrice;
    });
    
    // Filtrar só preços com variant_id válido
    const validPrices = preparedPrices.filter(p => p.variant_id);
    
    if (validPrices.length < prices.length) {
      logger.warn(`Skipping ${prices.length - validPrices.length} prices without valid variant reference`);
      this.stats.skipped.prices = (this.stats.skipped.prices || 0) + (prices.length - validPrices.length);
    }
    
    // Agrupar preços por variant_id, tipo e moeda (unique constraint)
    const pricesByKey = new Map();
    
    validPrices.forEach(price => {
      const key = `${price.variant_id}-${price.price_type || 'retail'}-${price.currency || 'EUR'}`;
      pricesByKey.set(key, price);
    });
    
    const uniquePrices = Array.from(pricesByKey.values());
    
    logger.info(`Condensed ${validPrices.length} prices to ${uniquePrices.length} unique price entries`);
    
    await this._batchImport(
      uniquePrices,
      this.models.Price,
      'variant_id',
      ['gross_price', 'net_price', 'price_type', 'currency', 'min_quantity', 'is_active', 'updated_at'],
      transaction,
      'prices'
    );
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
    
    // Check if Image model exists
    if (!this.models.Image) {
      logger.warn('Image model not found in models object, skipping images import');
      return;
    }
    
    logger.info(`Importing ${images.length} images`);
    
    // Preparar imagens com product_id correto
    const preparedImages = images.map(image => {
      // Clonar imagem para não modificar o original
      const preparedImage = { ...image };
      
      // Identificar o product_id correto
      if (image.product_code && this.lookupMaps.products.has(image.product_code)) {
        preparedImage.product_id = this.lookupMaps.products.get(image.product_code);
      }
      
      return preparedImage;
    });
    
    // Filtrar só imagens com product_id válido
    const validImages = preparedImages.filter(i => i.product_id);
    
    if (validImages.length < images.length) {
      logger.warn(`Skipping ${images.length - validImages.length} images without valid product reference`);
      this.stats.skipped.images = (this.stats.skipped.images || 0) + (images.length - validImages.length);
    }
    
    // Para imagens, buscamos pela combinação product_id e url
    await this._batchImport(
      validImages,
      this.models.Image,
      'url',
      ['product_id', 'is_main', 'order', 'updated_at'],
      transaction,
      'images'
    );
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
    
    // Check if Document model exists
    if (!this.models.Document) {
      logger.warn('Document model not found in models object, skipping documents import');
      this.stats.skipped.documents = documents.length;
      return;
    }
    
    logger.info(`Importing ${documents.length} documents`);
    
    // Preparar documentos com product_id correto
    const preparedDocuments = documents.map(document => {
      // Clonar documento para não modificar o original
      const preparedDocument = { ...document };
      
      // Identificar o product_id correto
      if (document.product_code && this.lookupMaps.products.has(document.product_code)) {
        preparedDocument.product_id = this.lookupMaps.products.get(document.product_code);
      }
      
      return preparedDocument;
    });
    
    // Filtrar só documentos com product_id válido
    const validDocuments = preparedDocuments.filter(d => d.product_id);
    
    if (validDocuments.length < documents.length) {
      logger.warn(`Skipping ${documents.length - validDocuments.length} documents without valid product reference`);
      this.stats.skipped.documents = (this.stats.skipped.documents || 0) + (documents.length - validDocuments.length);
    }
    
    await this._batchImport(
      validDocuments,
      this.models.Document,
      'url',
      ['product_id', 'name', 'type', 'title', 'language', 'updated_at'],
      transaction,
      'documents'
    );
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
    
    // Check if ProductProperty model exists
    if (!this.models.ProductProperty) {
      logger.warn('ProductProperty model not found in models object, skipping product properties import');
      this.stats.skipped.productProperties = productProperties.length;
      return;
    }
    
    logger.info(`Importing ${productProperties.length} product properties`);
    
    // Preparar propriedades com product_id correto
    const preparedProperties = productProperties.map(property => {
      // Clonar propriedade para não modificar o original
      const preparedProperty = { ...property };
      
      // Identificar o product_id correto
      if (property.product_code && this.lookupMaps.products.has(property.product_code)) {
        preparedProperty.product_id = this.lookupMaps.products.get(property.product_code);
      }
      
      return preparedProperty;
    });
    
    // Filtrar só propriedades com product_id válido
    const validProperties = preparedProperties.filter(p => p.product_id);
    
    if (validProperties.length < productProperties.length) {
      logger.warn(`Skipping ${productProperties.length - validProperties.length} product properties without valid product reference`);
      this.stats.skipped.productProperties = (this.stats.skipped.productProperties || 0) + (productProperties.length - validProperties.length);
    }
    
    // Para propriedades, use a combinação product_id e name como chave única
    await this._batchImport(
      validProperties,
      this.models.ProductProperty,
      'name',
      ['product_id', 'value', 'group', 'language', 'order', 'is_filterable', 'is_public', 'updated_at'],
      transaction,
      'productProperties'
    );
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
            await models.Category.upsert(category, { transaction });
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
            await models.Producer.upsert(producer, { transaction });
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
            await models.Unit.upsert(unit, { transaction });
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
            const createdProducts = await models.Product.bulkCreate(batch, { 
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
              await models.Variant.bulkCreate(batch, { 
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
              await models.Stock.bulkCreate(batch, { 
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
              await models.Price.bulkCreate(batch, { 
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
              await models.Image.bulkCreate(batch, { 
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
              await models.Document.bulkCreate(batch, { 
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
              await models.ProductProperty.bulkCreate(batch, { 
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