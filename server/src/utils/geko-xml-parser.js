/**
 * GEKO XML Parser
 * 
 * Este módulo é responsável por analisar e transformar o XML de produtos da GEKO
 * em objetos JavaScript que correspondem aos modelos do banco de dados.
 * 
 * O parser segue o mapeamento definido em docs/database/geko-xml-mapping.md
 * 
 * Performance optimized version with improved memory management and processing efficiency.
 * Enhanced to extract all available fields from GEKO XML.
 */

import { parseStringPromise } from 'xml2js';
import logger from '../config/logger.js';
import DataValidator from './data-validator.js';

class GekoXmlParser {
  /**
   * Inicializa o parser com as opções adequadas para o formato XML da GEKO
   */
  constructor() {
    // Configure XML parser options
    this.parserOptions = {
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: true,
      normalizeTags: true,
      trim: true,
      async: true // Use async mode for better performance
    };
  }

  /**
   * Parse XML data into transformed data ready for database import
   * @param {string} xmlData - Raw XML data as string
   * @returns {Object} Transformed data structured for database import
   */
  async parse(xmlData) {
    try {
      // Parse XML to JS object
      const result = await parseStringPromise(xmlData, {
        trim: true,
        explicitArray: false,
        mergeAttrs: true,
        normalizeTags: true
      });
      
      // Check if XML uses 'offer' structure (new format) or 'geko' structure (old format)
      let productsNode;
      
      if (result.offer && result.offer.products && result.offer.products.product) {
        logger.info('Detected "offer" XML structure');
        productsNode = result.offer.products;
      } else if (result.geko && result.geko.products && result.geko.products.product) {
        logger.info('Detected "geko" XML structure');
        productsNode = result.geko.products;
      } else {
        throw new Error('Invalid XML structure: missing product data. Expected either offer.products.product or geko.products.product structure');
      }
      
      // Convert to array if single product
      const products = Array.isArray(productsNode.product) 
        ? productsNode.product 
        : [productsNode.product];
      
      logger.info(`Parsed ${products.length} products from XML`);
      
      // Transform products
      const transformedData = this._transformProducts(products);
      
      return transformedData;
    } catch (error) {
      logger.error(`Error parsing XML: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Transform products array from XML into structured data for database
   * @param {Array} products - Array of product objects from XML
   * @returns {Object} Structured data for database import
   * @private
   */
  _transformProducts(products) {
    try {
      // Initialize result object
      const result = {
        categories: [],
        producers: [],
        units: [],
        products: [],
        variants: [],
        stocks: [],
        prices: [],
        images: [],
        documents: [],
        productProperties: []
      };
      
      // Used to track unique values
      const uniqueCategories = new Map();
      const uniqueProducers = new Map();
      const uniqueUnits = new Map();
      
      // Process each product
      products.forEach(product => {
        try {
          // Extract base product data
          const productData = this._extractProductData(product);
          
          // Process category
          if (product.category) {
            const categoryData = this._extractCategoryData(product.category);
            if (categoryData && !uniqueCategories.has(categoryData.id)) {
              uniqueCategories.set(categoryData.id, categoryData);
              result.categories.push(categoryData);
            }
            productData.category_id = categoryData?.id;
          }
          
          // Process producer
          if (product.producer) {
            const producerData = this._extractProducerData(product.producer);
            if (producerData && !uniqueProducers.has(producerData.name)) {
              uniqueProducers.set(producerData.name, producerData);
              result.producers.push(producerData);
            }
            productData.producer_name = producerData?.name;
            productData.producer_id = producerData?.name;
          }
          
          // Process unit
          if (product.unit) {
            const unitData = this._extractUnitData(product.unit);
            if (unitData && !uniqueUnits.has(unitData.id)) {
              uniqueUnits.set(unitData.id, unitData);
              result.units.push(unitData);
            }
            productData.unit_id = unitData?.id;
          }
          
          // Add product to result
          result.products.push(productData);
          
          // Process variants
          if (product.variants && product.variants.variant) {
            const variantsArray = Array.isArray(product.variants.variant) 
              ? product.variants.variant 
              : [product.variants.variant];
            
            variantsArray.forEach(variant => {
              // Extract variant data
              const variantData = this._extractVariantData(variant, product.code);
              
              // Add variant to result
              result.variants.push(variantData);
              
              // Process stock
              if (variant.stock) {
                const stockData = this._extractStockData(variant.stock, variant.code);
                result.stocks.push(stockData);
              }
              
              // Process prices
              if (variant.prices && variant.prices.price) {
                const pricesArray = Array.isArray(variant.prices.price) 
                  ? variant.prices.price 
                  : [variant.prices.price];
                
                pricesArray.forEach(price => {
                  const priceData = this._extractPriceData(price, variant.code);
                  result.prices.push(priceData);
                });
              }
            });
          }
          
          // Process images
          if (product.images && product.images.image) {
            const imagesArray = Array.isArray(product.images.image) 
              ? product.images.image 
              : [product.images.image];
            
            imagesArray.forEach(image => {
              const imageData = this._extractImageData(image, product.code);
              result.images.push(imageData);
            });
          }
          
          // Process documents
          if (product.documents && product.documents.document) {
            const documentsArray = Array.isArray(product.documents.document) 
              ? product.documents.document 
              : [product.documents.document];
            
            documentsArray.forEach(document => {
              const documentData = this._extractDocumentData(document, product.code);
              result.documents.push(documentData);
            });
          }
          
          // Process product properties
          if (product.properties && product.properties.property) {
            const propertiesArray = Array.isArray(product.properties.property) 
              ? product.properties.property 
              : [product.properties.property];
            
            propertiesArray.forEach(property => {
              const propertyData = this._extractPropertyData(property, product.code);
              result.productProperties.push(propertyData);
            });
          }
        } catch (productError) {
          logger.error(`Error processing product ${product.code || 'unknown'}: ${productError.message}`);
        }
      });
      
      // Convert Maps to Arrays for easier processing
      const finalResult = {
        categories: result.categories,
        producers: result.producers,
        units: result.units,
        products: result.products,
        variants: result.variants,
        stocks: result.stocks,
        prices: result.prices,
        images: result.images,
        documents: result.documents,
        productProperties: result.productProperties
      };
      
      logger.info(`Transformed ${finalResult.products.length} products, ${finalResult.variants.length} variants, ${finalResult.images.length} images`);
      
      return finalResult;
    } catch (error) {
      logger.error(`Error transforming products: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Extract product data from XML product object
   * @param {Object} product - Product object from XML
   * @returns {Object} Structured product data for database
   * @private
   */
  _extractProductData(product) {
    const descData = product.description || {};
    const now = new Date();
    
    return {
      code: product.code || '',
      code_on_card: product.code_on_card || product.code || '',
      name: (descData.name || '').trim(),
      ean: product.ean || '',
      producer_code: product.producer_code || '',
      short_description: descData.short ? this._truncateHtml(descData.short) : '',
      long_description: descData.long ? this._truncateHtml(descData.long) : '',
      technical_description: descData.html ? this._truncateHtml(descData.html) : '',
      vat: this._parseNumberOrDefault(product.vat, 23),
      status: 'active',
      url: product.url || '',
      delivery_date: product.delivery_date ? new Date(product.delivery_date) : null,
      created_at: now,
      updated_at: now
    };
  }
  
  /**
   * Extract category data from XML category object
   * @param {Object} category - Category object from XML
   * @returns {Object} Structured category data for database
   * @private
   */
  _extractCategoryData(category) {
    if (!category || !category.id) {
      return null;
    }
    
    const now = new Date();
    
    return {
      id: category.id,
      name: category.name || '',
      path: category.path || category.id,
      parent_id: category.parent_id || null,
      created_at: now,
      updated_at: now
    };
  }
  
  /**
   * Extract producer data from XML producer object
   * @param {Object} producer - Producer object from XML
   * @returns {Object} Structured producer data for database
   * @private
   */
  _extractProducerData(producer) {
    if (!producer || !producer.name) {
      return null;
    }
    
    const now = new Date();
    
    return {
      name: producer.name,
      description: producer.description || '',
      website: producer.website || '',
      created_at: now,
      updated_at: now
    };
  }
  
  /**
   * Extract unit data from XML unit object
   * @param {Object|string} unit - Unit object or string from XML
   * @returns {Object} Structured unit data for database
   * @private
   */
  _extractUnitData(unit) {
    // Handle either string or object
    const unitId = typeof unit === 'object' ? unit.id || unit.code : unit;
    const unitName = typeof unit === 'object' ? unit.name : unit;
    
    if (!unitId) {
      return null;
    }
    
    const now = new Date();
    
    return {
      id: unitId,
      name: unitName || unitId,
      moq: 1,
      created_at: now,
      updated_at: now
    };
  }
  
  /**
   * Extract variant data from XML variant object
   * @param {Object} variant - Variant object from XML
   * @param {string} productCode - Parent product code
   * @returns {Object} Structured variant data for database
   * @private
   */
  _extractVariantData(variant, productCode) {
    const now = new Date();
    
    return {
      code: variant.code || `${productCode}-default`,
      product_code: productCode,
      name: variant.name || '',
      weight: this._parseNumberOrDefault(variant.weight, 0),
      gross_weight: this._parseNumberOrDefault(variant.gross_weight, 0),
      size: variant.size || '',
      color: variant.color || '',
      status: 'active',
      created_at: now,
      updated_at: now
    };
  }
  
  /**
   * Extract stock data from XML stock object
   * @param {Object} stock - Stock object from XML
   * @param {string} variantCode - Parent variant code
   * @returns {Object} Structured stock data for database
   * @private
   */
  _extractStockData(stock, variantCode) {
    const now = new Date();
    
    return {
      variant_code: variantCode,
      quantity: this._parseNumberOrDefault(stock.quantity, 0),
      available: stock.available === 'true' || stock.available === true,
      min_order_quantity: this._parseNumberOrDefault(stock.min_order_quantity, 1),
      created_at: now,
      updated_at: now
    };
  }
  
  /**
   * Extract price data from XML price object
   * @param {Object} price - Price object from XML
   * @param {string} variantCode - Parent variant code
   * @returns {Object} Structured price data for database
   * @private
   */
  _extractPriceData(price, variantCode) {
    const now = new Date();
    
    return {
      variant_code: variantCode,
      gross_price: this._parseNumberOrDefault(price.amount, 0),
      net_price: this._calculateNetPrice(price.amount, price.vat || 23),
      price_type: price.type || 'retail',
      currency: price.currency || 'EUR',
      min_quantity: this._parseNumberOrDefault(price.min_quantity, 1),
      is_active: true,
      created_at: now,
      updated_at: now
    };
  }
  
  /**
   * Extract image data from XML image object
   * @param {Object} image - Image object from XML
   * @param {string} productCode - Parent product code
   * @returns {Object} Structured image data for database
   * @private
   */
  _extractImageData(image, productCode) {
    if (!image || !image.url) {
      return null;
    }
    
    const now = new Date();
    
    return {
      product_code: productCode,
      url: image.url,
      is_main: image.is_main === 'true' || image.is_main === true,
      order: this._parseNumberOrDefault(image.order, 0),
      created_at: now,
      updated_at: now
    };
  }
  
  /**
   * Extract document data from XML document object
   * @param {Object} document - Document object from XML
   * @param {string} productCode - Parent product code
   * @returns {Object} Structured document data for database
   * @private
   */
  _extractDocumentData(document, productCode) {
    if (!document || !document.url) {
      return null;
    }
    
    const now = new Date();
    
    return {
      product_id: null, // Will be populated after product is inserted
      product_code: productCode, // Keep as a reference to link with product
      url: document.url,
      name: document.name || '',
      type: document.type || 'pdf',
      title: document.title || document.name || '',
      language: document.language || 'en',
      created_at: now,
      updated_at: now
    };
  }
  
  /**
   * Extract property data from XML property object
   * @param {Object} property - Property object from XML
   * @param {string} productCode - Parent product code
   * @returns {Object} Structured property data for database
   * @private
   */
  _extractPropertyData(property, productCode) {
    if (!property || !property.name) {
      return null;
    }
    
    const now = new Date();
    
    return {
      product_id: null, // Will be populated after product is inserted
      product_code: productCode, // Keep as a reference to link with product
      name: property.name,
      value: property.value || '',
      group: property.group || '',
      language: property.language || 'en',
      order: this._parseNumberOrDefault(property.order, 0),
      is_filterable: property.is_filterable === 'true' || property.is_filterable === true,
      is_public: property.is_public === 'true' || property.is_public === true,
      created_at: now,
      updated_at: now
    };
  }
  
  /**
   * Truncate HTML content to a reasonable length
   * @param {string} html - HTML content to truncate
   * @param {number} maxLength - Maximum length (default: 10000)
   * @returns {string} Truncated HTML
   * @private
   */
  _truncateHtml(html, maxLength = 10000) {
    if (!html) return '';
    
    if (html.length <= maxLength) {
      return html;
    }
    
    // Try to find a reasonable cut-off point
    const cutoff = html.lastIndexOf('</p>', maxLength);
    if (cutoff !== -1) {
      return html.substring(0, cutoff + 4) + '<!-- truncated -->';
    }
    
    return html.substring(0, maxLength) + '<!-- truncated -->';
  }
  
  /**
   * Parse a number or return a default value
   * @param {string|number} value - Value to parse
   * @param {number} defaultValue - Default value if parsing fails
   * @returns {number} Parsed number or default
   * @private
   */
  _parseNumberOrDefault(value, defaultValue) {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }
    
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  
  /**
   * Calculate net price from gross price and VAT
   * @param {number|string} grossPrice - Gross price
   * @param {number|string} vatRate - VAT rate (percentage)
   * @returns {number} Calculated net price
   * @private
   */
  _calculateNetPrice(grossPrice, vatRate) {
    const gross = this._parseNumberOrDefault(grossPrice, 0);
    const vat = this._parseNumberOrDefault(vatRate, 23);
    
    return gross > 0 ? Number((gross / (1 + vat / 100)).toFixed(2)) : 0;
  }
}

// Create and export an instance of the parser
const gekoXmlParser = new GekoXmlParser();

// Export the parse method directly
export const parse = (xmlData) => {
  return gekoXmlParser.parse(xmlData);
};

// Also export the class for more advanced usage
export default GekoXmlParser; 