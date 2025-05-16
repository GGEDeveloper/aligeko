import { parseStringPromise } from 'xml2js';
import logger from '../config/logger.js';

/**
 * XML Parser for GEKO API data
 * Parses XML data from the GEKO API and transforms it into a format compatible with our database schema
 */
export class XmlParser {
  /**
   * Parse XML string into JavaScript objects
   * @param {string} xmlString - The XML string to parse
   * @returns {Promise<Object>} - The parsed XML as JavaScript objects
   */
  static async parseXml(xmlString) {
    try {
      // Parse XML to JavaScript object
      const result = await parseStringPromise(xmlString, {
        explicitArray: false,
        trim: true,
        normalizeTags: true
      });
      
      logger.info('XML parsing completed successfully');
      return result;
    } catch (error) {
      logger.error(`Error parsing XML: ${error.message}`);
      throw new Error(`Failed to parse XML: ${error.message}`);
    }
  }

  /**
   * Transform raw XML data to match our database schema
   * @param {Object} xmlData - The parsed XML data
   * @returns {Object} - Data transformed to match our database schema
   */
  static transformData(xmlData) {
    try {
      if (!xmlData || !xmlData.geko || !xmlData.geko.products || !xmlData.geko.products.product) {
        throw new Error('Invalid XML structure: missing products data');
      }

      const rawProducts = Array.isArray(xmlData.geko.products.product) 
        ? xmlData.geko.products.product 
        : [xmlData.geko.products.product];
      
      // Initialize transformed data structure
      const transformedData = {
        products: [],
        categories: new Map(),
        producers: new Map(),
        units: new Map(),
        variants: [],
        stocks: [],
        prices: [],
        images: []
      };
      
      // Process each product
      rawProducts.forEach(product => {
        try {
          this._processProduct(product, transformedData);
        } catch (productError) {
          logger.error(`Error processing product ${product.code || 'unknown'}: ${productError.message}`);
          // Continue processing other products
        }
      });
      
      // Convert Maps to arrays for database insertion
      return {
        products: transformedData.products,
        categories: Array.from(transformedData.categories.values()),
        producers: Array.from(transformedData.producers.values()),
        units: Array.from(transformedData.units.values()),
        variants: transformedData.variants,
        stocks: transformedData.stocks,
        prices: transformedData.prices,
        images: transformedData.images
      };
    } catch (error) {
      logger.error(`Error transforming XML data: ${error.message}`);
      throw new Error(`Failed to transform XML data: ${error.message}`);
    }
  }

  /**
   * Process a single product from XML data
   * @param {Object} product - The product object from XML
   * @param {Object} transformedData - The transformed data container
   * @private
   */
  static _processProduct(product, transformedData) {
    // Extract and validate required fields
    if (!product.code) {
      throw new Error('Product is missing required field: code');
    }

    // Process category
    const categoryId = this._processCategory(product, transformedData);
    
    // Process producer
    const producerId = this._processProducer(product, transformedData);
    
    // Process unit
    const unitId = this._processUnit(product, transformedData);
    
    // Create the transformed product
    const transformedProduct = {
      code: product.code,
      name: product.description?.name || '',
      description_short: product.description?.short || '',
      description_long: this._sanitizeHtml(product.description?.long || ''),
      ean: this._validateEan(product.ean),
      vat: this._parseFloat(product.vat, 23), // Default VAT rate is 23%
      category_id: categoryId,
      producer_id: producerId,
      unit_id: unitId,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    transformedData.products.push(transformedProduct);
    
    // Process variants, stocks, prices, and images
    this._processVariants(product, transformedProduct.code, transformedData);
    this._processImages(product, transformedProduct.code, transformedData);
  }

  /**
   * Process category data from a product
   * @param {Object} product - The product object
   * @param {Object} transformedData - The transformed data container
   * @returns {string} - The category ID
   * @private
   */
  static _processCategory(product, transformedData) {
    if (!product.category) {
      return null;
    }
    
    const categoryId = product.category.id || 
                      (product.category.name ? product.category.name.toLowerCase().replace(/\s+/g, '-') : null);
    
    if (!categoryId) {
      return null;
    }
    
    if (!transformedData.categories.has(categoryId)) {
      transformedData.categories.set(categoryId, {
        id: categoryId,
        name: product.category.name || categoryId,
        path: product.category.path || categoryId,
        parent_id: product.category.parent_id || null,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    return categoryId;
  }

  /**
   * Process producer data from a product
   * @param {Object} product - The product object
   * @param {Object} transformedData - The transformed data container
   * @returns {number} - The producer ID
   * @private
   */
  static _processProducer(product, transformedData) {
    if (!product.producer) {
      return null;
    }
    
    const producerName = product.producer.name || product.producer;
    if (!producerName) {
      return null;
    }
    
    // Use producer name as key until we get real IDs
    if (!transformedData.producers.has(producerName)) {
      transformedData.producers.set(producerName, {
        name: producerName,
        description: product.producer.description || '',
        website: this._validateUrl(product.producer.website),
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    // In real implementation, we'd return the producer's ID from the database
    // For now, we're returning the name as a placeholder
    return producerName;
  }

  /**
   * Process unit data from a product
   * @param {Object} product - The product object
   * @param {Object} transformedData - The transformed data container
   * @returns {string} - The unit ID
   * @private
   */
  static _processUnit(product, transformedData) {
    if (!product.unit) {
      return 'pcs'; // Default unit
    }
    
    const unitId = product.unit.id || product.unit.toLowerCase();
    if (!unitId) {
      return 'pcs';
    }
    
    if (!transformedData.units.has(unitId)) {
      transformedData.units.set(unitId, {
        id: unitId,
        name: product.unit.name || product.unit,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    return unitId;
  }

  /**
   * Process variant data from a product
   * @param {Object} product - The product object
   * @param {string} productCode - The product code
   * @param {Object} transformedData - The transformed data container
   * @private
   */
  static _processVariants(product, productCode, transformedData) {
    const variants = product.variants?.variant || [];
    const variantsArray = Array.isArray(variants) ? variants : [variants];
    
    if (variantsArray.length === 0 || !variantsArray[0]) {
      // Create a default variant if none exist
      const defaultVariant = {
        code: `${productCode}-DEFAULT`,
        product_id: productCode,
        weight: this._parseFloat(product.weight, 0),
        gross_weight: this._parseFloat(product.gross_weight, 0),
        created_at: new Date(),
        updated_at: new Date()
      };
      
      transformedData.variants.push(defaultVariant);
      
      // Process stock for default variant
      this._processStock(product.stock, defaultVariant.code, transformedData);
      
      // Process prices for default variant
      this._processPrices(product.prices, defaultVariant.code, transformedData);
      
      return;
    }
    
    variantsArray.forEach((variant, index) => {
      if (!variant) return;
      
      const variantCode = variant.code || `${productCode}-${index + 1}`;
      
      const transformedVariant = {
        code: variantCode,
        product_id: productCode,
        weight: this._parseFloat(variant.weight, 0),
        gross_weight: this._parseFloat(variant.gross_weight, 0),
        created_at: new Date(),
        updated_at: new Date()
      };
      
      transformedData.variants.push(transformedVariant);
      
      // Process stock for this variant
      this._processStock(variant.stock, variantCode, transformedData);
      
      // Process prices for this variant
      this._processPrices(variant.prices, variantCode, transformedData);
    });
  }

  /**
   * Process stock data for a variant
   * @param {Object} stockData - The stock data
   * @param {string} variantCode - The variant code
   * @param {Object} transformedData - The transformed data container
   * @private
   */
  static _processStock(stockData, variantCode, transformedData) {
    if (!stockData) return;
    
    const stock = {
      variant_id: variantCode,
      quantity: this._parseInt(stockData.quantity, 0),
      status: stockData.status || 'available',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    transformedData.stocks.push(stock);
  }

  /**
   * Process price data for a variant
   * @param {Object} pricesData - The price data
   * @param {string} variantCode - The variant code
   * @param {Object} transformedData - The transformed data container
   * @private
   */
  static _processPrices(pricesData, variantCode, transformedData) {
    if (!pricesData) return;
    
    const prices = pricesData.price || [];
    const pricesArray = Array.isArray(prices) ? prices : [prices];
    
    pricesArray.forEach(price => {
      if (!price) return;
      
      const transformedPrice = {
        variant_id: variantCode,
        price: this._parseFloat(price.value, 0),
        discount_price: this._parseFloat(price.discount_value, null),
        discount_start_date: price.discount_start ? new Date(price.discount_start) : null,
        discount_end_date: price.discount_end ? new Date(price.discount_end) : null,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      transformedData.prices.push(transformedPrice);
    });
  }

  /**
   * Process image data for a product
   * @param {Object} product - The product object
   * @param {string} productCode - The product code
   * @param {Object} transformedData - The transformed data container
   * @private
   */
  static _processImages(product, productCode, transformedData) {
    const images = product.images?.image || [];
    const imagesArray = Array.isArray(images) ? images : [images];
    
    imagesArray.forEach((image, index) => {
      if (!image) return;
      
      const imageUrl = this._validateUrl(image.url || image);
      if (!imageUrl) return;
      
      const transformedImage = {
        product_id: productCode,
        url: imageUrl,
        alt: image.alt || `${product.description?.name || 'Product'} Image ${index + 1}`,
        order: this._parseInt(image.order, index + 1),
        created_at: new Date(),
        updated_at: new Date()
      };
      
      transformedData.images.push(transformedImage);
    });
  }

  /**
   * Sanitize HTML to prevent code injection
   * @param {string} html - The HTML to sanitize
   * @returns {string} - The sanitized HTML
   * @private
   */
  static _sanitizeHtml(html) {
    if (!html) return '';
    
    // Simple sanitization by removing script tags
    // In a real implementation, use a proper HTML sanitizer library
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  /**
   * Validate an EAN code
   * @param {string} ean - The EAN code to validate
   * @returns {string|null} - The validated EAN or null if invalid
   * @private
   */
  static _validateEan(ean) {
    if (!ean) return null;
    
    // Simple validation for 13-digit EAN
    const eanStr = String(ean).trim();
    return /^\d{13}$/.test(eanStr) ? eanStr : null;
  }

  /**
   * Validate a URL
   * @param {string} url - The URL to validate
   * @returns {string|null} - The validated URL or null if invalid
   * @private
   */
  static _validateUrl(url) {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch (error) {
      // Try adding https:// if it's missing
      if (!url.match(/^https?:\/\//)) {
        try {
          const urlWithProtocol = `https://${url}`;
          const urlObj = new URL(urlWithProtocol);
          return urlObj.toString();
        } catch (error) {
          return null;
        }
      }
      return null;
    }
  }

  /**
   * Parse a string to an integer
   * @param {string|number} value - The value to parse
   * @param {number} defaultValue - The default value to use if parsing fails
   * @returns {number} - The parsed integer or default value
   * @private
   */
  static _parseInt(value, defaultValue = 0) {
    if (value === undefined || value === null) return defaultValue;
    
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Parse a string to a float
   * @param {string|number} value - The value to parse
   * @param {number} defaultValue - The default value to use if parsing fails
   * @returns {number} - The parsed float or default value
   * @private
   */
  static _parseFloat(value, defaultValue = 0) {
    if (value === undefined || value === null) return defaultValue;
    
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
} 