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

import xml2js from 'xml2js';
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
   * Parse XML data and transform into structured data for database
   * @param {string} xmlData - The XML data string to parse
   * @returns {Object} Transformed data
   */
  async parse(xmlData) {
    try {
      console.log('Starting XML parsing process...');
      console.time('XML to JSON conversion');
      
      // Parse XML to JSON using promises
      const parser = new xml2js.Parser(this.parserOptions);
      
      // Initialize transformed data structure with Maps for better performance
      const transformedData = {
        products: [],
        categories: new Map(),
        producers: new Map(),
        units: new Map(),
        variants: [],
        stocks: [],          // Renamed from 'inventories' if already exists
        prices: [],
        images: [],
        documents: [],       // New table
        productProperties: [] // New table
      };
      
      // Use try-catch to handle parsing errors
      let jsonData;
      try {
        jsonData = await parser.parseStringPromise(xmlData);
        
        // Free memory as soon as possible
        xmlData = null;
        global.gc && global.gc(); // Trigger garbage collection if available
        
        console.timeEnd('XML to JSON conversion');
        console.log('XML successfully parsed to JSON');
      } catch (err) {
        console.error('XML parsing error:', err);
        throw new Error(`Failed to parse XML: ${err.message}`);
      }
      
      // Check if we have valid data
      if (!jsonData) {
        throw new Error('No data found in XML');
      }
      
      // Check for expected structure - handle both <geko> and <offer> root elements
      const productsContainer = 
        (jsonData.geko && jsonData.geko.products) ? jsonData.geko.products :
        (jsonData.offer && jsonData.offer.products) ? jsonData.offer.products :
        (jsonData.offer && jsonData.offer.item) ? { product: jsonData.offer.item } :
        (jsonData.offer) ? { product: jsonData.offer } : 
        null;
      
      if (!productsContainer) {
        console.warn('Unexpected XML structure:', Object.keys(jsonData));
        throw new Error('Unexpected XML structure: products container not found');
      }
      
      // Extract products array, handling both array and single item cases
      const productsArray = 
        (productsContainer.product) ? 
          (Array.isArray(productsContainer.product) ? productsContainer.product : [productsContainer.product]) :
        [];
      
      console.log(`Found ${productsArray.length} products in XML`);
      
      // Performance optimization: Process products in chunks
      const CHUNK_SIZE = 1000;
      console.time('Product processing');
      
      for (let i = 0; i < productsArray.length; i += CHUNK_SIZE) {
        console.time(`Processing products ${i+1}-${Math.min(i+CHUNK_SIZE, productsArray.length)}`);
        const chunk = productsArray.slice(i, i + CHUNK_SIZE);
        
        // Process each product in the chunk
        for (let j = 0; j < chunk.length; j++) {
          const product = chunk[j];
          const index = i + j;
          
          // Process product only if it has required data
          if (product && (product.code || product.id)) {
            try {
              this._processProduct(product, transformedData, index);
            } catch (error) {
              console.error(`Error processing product at index ${index}:`, error);
            }
          }
        }
        
        console.timeEnd(`Processing products ${i+1}-${Math.min(i+CHUNK_SIZE, productsArray.length)}`);
        
        // Free memory after processing each chunk
        chunk.length = 0;
        global.gc && global.gc(); // Trigger garbage collection if available
      }
      
      console.timeEnd('Product processing');
      
      // Free memory - we don't need the raw JSON data anymore
      jsonData = null;
      productsArray.length = 0;
      global.gc && global.gc(); // Trigger garbage collection if available
      
      // Convert Maps to arrays for database operations
      console.time('Map to array conversion');
      transformedData.categories = Array.from(transformedData.categories.values());
      transformedData.producers = Array.from(transformedData.producers.values());
      transformedData.units = Array.from(transformedData.units.values());
      console.timeEnd('Map to array conversion');
      
      // Log statistics
      console.log('Transformation complete with the following counts:');
      console.log(`- Products: ${transformedData.products.length}`);
      console.log(`- Categories: ${transformedData.categories.length}`);
      console.log(`- Producers: ${transformedData.producers.length}`);
      console.log(`- Units: ${transformedData.units.length}`);
      console.log(`- Variants: ${transformedData.variants.length}`);
      console.log(`- Stocks: ${transformedData.stocks.length}`);
      console.log(`- Prices: ${transformedData.prices.length}`);
      console.log(`- Images: ${transformedData.images.length}`);
      console.log(`- Documents: ${transformedData.documents.length}`);
      console.log(`- Product Properties: ${transformedData.productProperties.length}`);
      
      // Return the transformed data
      return transformedData;
    } catch (error) {
      console.error('Error in XML parser:', error);
      throw error;
    }
  }

  /**
   * Process a single product from XML into transformed data structure
   * Optimized for performance and memory usage
   * @param {Object} product - The product XML object
   * @param {Object} transformedData - The data collection being built
   * @param {number} index - The index of the product in the array
   */
  _processProduct(product, transformedData, index) {
    try {
      // Extract base product data
      const productCode = DataValidator.normalizeString(product.code || product.id || `product-${index}`);
      if (!productCode) {
        return; // Skip products without code
      }
      
      // Handle different XML structures
      let productData = {
        code: productCode,
        code_on_card: DataValidator.normalizeString(product.code_on_card),
        ean: DataValidator.normalizeString(product.ean || product.EAN),
        producer_code: DataValidator.normalizeString(product.code_producer),
        vat: parseFloat(product.vat || 0) || 0,
        url: null,
        delivery_date: null,
        status: 'active',
        discontinued: false
      };
      
      // Processar URL do produto
      if (product.card && product.card.url) {
        productData.url = DataValidator.normalizeString(product.card.url);
      }
      
      // Processar data de entrega
      if (product.delivery) {
        try {
          const deliveryText = DataValidator.normalizeString(product.delivery);
          if (deliveryText && deliveryText.match(/\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/)) {
            productData.delivery_date = new Date(deliveryText);
          }
        } catch (e) {
          console.log(`Error parsing delivery date for product ${productCode}: ${e.message}`);
        }
      }
      
      // Extract name and description - handle both formats
      if (product.description) {
        if (typeof product.description === 'object') {
          // GEKO format with nested description object
          productData.name = DataValidator.normalizeString(product.description.n || product.description.name);
          productData.description_short = DataValidator.normalizeString(product.description.short_desc || product.description.short);
          productData.description_long = DataValidator.normalizeString(product.description.long_desc || product.description.long);
          productData.description_html = DataValidator.normalizeString(product.description.description);
        } else {
          // String format
          productData.name = DataValidator.normalizeString(product.name || product.title || product.description);
          productData.description_short = '';
          productData.description_long = DataValidator.normalizeString(product.description);
          productData.description_html = '';
        }
      } else {
        // Other formats where fields might be directly on product
        productData.name = DataValidator.normalizeString(product.name || product.title || '');
        productData.description_short = DataValidator.normalizeString(product.short_description || product.summary || '');
        productData.description_long = DataValidator.normalizeString(product.long_description || product.full_description || '');
        productData.description_html = DataValidator.normalizeString(product.html_description || '');
      }
      
      // Skip products without name
      if (!productData.name) {
        return;
      }
      
      // Process relationships and get IDs
      const categoryId = this._processCategory(product, transformedData);
      const producerId = this._processProducer(product, transformedData);
      const unitId = this._processUnit(product, transformedData);
      
      // Add relationship IDs to product data
      productData.category_id = categoryId;
      productData.producer_id = producerId;
      productData.unit_id = unitId;
      
      // Add timestamps
      productData.created_at = new Date();
      productData.updated_at = new Date();
      
      // Add the product to the collection
      transformedData.products.push(productData);
      
      // Process related entities
      this._processVariants(product, productCode, transformedData);
      this._processImages(product, productCode, transformedData);
      this._processDocuments(product, productCode, transformedData);
      this._processProperties(product, productCode, transformedData);
      
    } catch (error) {
      console.error(`Error processing product ${product.code || index}:`, error);
    }
  }
  
  /**
   * Process variants from a product
   * @param {Object} product - The product XML object
   * @param {string} productCode - The product code for reference
   * @param {Object} transformedData - The data collection being built
   */
  _processVariants(product, productCode, transformedData) {
    // Handle different variant structures (sizes/variants)
    const variants = [];
    
    // First check for variants array
    if (product.variants && product.variants.variant) {
      const variantItems = Array.isArray(product.variants.variant) ? 
        product.variants.variant : [product.variants.variant];
      
      variantItems.forEach(variant => {
        if (!variant) return;
        
        const variantData = {
          product_id: null, // Will be set after product is inserted
          code: DataValidator.normalizeString(variant.code || `${productCode}-${variant.id || Math.random().toString(36).substring(2, 10)}`),
          weight: parseFloat(variant.weight) || 0,
          gross_weight: parseFloat(variant.gross_weight || variant.grossWeight) || 0,
          name: DataValidator.normalizeString(variant.name || variant.n),
          size: DataValidator.normalizeString(variant.size),
          color: DataValidator.normalizeString(variant.color),
          status: DataValidator.normalizeString(variant.status || 'active'),
          created_at: new Date(),
          updated_at: new Date()
        };
        
        variants.push(variantData);
        
        // Process related data for this variant
        if (variant.stock) {
          this._processStock(variant.stock, variantData.code, transformedData);
        }
        
        if (variant.prices && variant.prices.price) {
          this._processPrices(variant.prices.price, variantData.code, transformedData);
        } else if (variant.price) {
          this._processPrices(variant.price, variantData.code, transformedData);
        }
      });
    }
    
    // Then check for sizes (alternative structure)
    if (product.sizes && product.sizes.size) {
      const sizeItems = Array.isArray(product.sizes.size) ? 
        product.sizes.size : [product.sizes.size];
      
      sizeItems.forEach(size => {
        if (!size) return;
        
        const variantData = {
          product_id: null, // Will be set after product is inserted
          code: DataValidator.normalizeString(size.code || `${productCode}-${size.id || transformedData.variants.length}`),
          weight: parseFloat(size.weight) || 0,
          gross_weight: parseFloat(size.grossWeight) || 0,
          name: DataValidator.normalizeString(size.name || size.n),
          size: DataValidator.normalizeString(size.size_value),
          color: DataValidator.normalizeString(size.color),
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        };
        
        variants.push(variantData);
        
        // Process related data
        if (size.stock) {
          this._processStock(size.stock, variantData.code, transformedData);
        }
        
        if (size.price) {
          this._processPrices(size.price, variantData.code, transformedData);
        }
        
        if (size.srp) {
          this._processSuggestedPrices(size.srp, variantData.code, transformedData);
        }
      });
    }
    
    // If no variants/sizes were found, create a default variant
    if (variants.length === 0) {
      const defaultVariant = {
        product_id: null, // Will be set after product is inserted
        code: `${productCode}-default`,
        weight: 0,
        gross_weight: 0,
        name: 'Default',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      variants.push(defaultVariant);
      
      // Process product-level prices if any
      if (product.price) {
        this._processPrices(product.price, defaultVariant.code, transformedData);
      }
      
      if (product.srp) {
        this._processSuggestedPrices(product.srp, defaultVariant.code, transformedData);
      }
    }
    
    // Add all variants
    transformedData.variants.push(...variants);
  }
  
  /**
   * Process stock data from a variant
   * @param {Object} stockData - The stock XML object
   * @param {string} variantCode - Variant code for reference
   * @param {Object} transformedData - The data collection being built
   */
  _processStock(stockData, variantCode, transformedData) {
    // Handle different formats
    const stocks = Array.isArray(stockData) ? stockData : [stockData];
    
    stocks.forEach(stock => {
      if (!stock) return;
      
      transformedData.stocks.push({
        variant_id: null, // Will be set after variant is inserted
        variant_code: variantCode, // Keep code for reference
        quantity: parseInt(stock.quantity) || 0,
        available: stock.available === 'true' || stock.available === true || parseInt(stock.quantity) > 0,
        min_order_quantity: parseInt(stock.min_order_quantity || stock.moq) || 1,
        created_at: new Date(),
        updated_at: new Date()
      });
    });
  }
  
  /**
   * Process price data from a variant
   * @param {Object} priceData - The price XML object
   * @param {string} variantCode - Variant code for reference
   * @param {Object} transformedData - The data collection being built
   */
  _processPrices(priceData, variantCode, transformedData) {
    // Handle different formats
    const prices = Array.isArray(priceData) ? priceData : [priceData];
    
    prices.forEach(price => {
      if (!price) return;
      
      transformedData.prices.push({
        variant_id: null, // Will be set after variant is inserted
        variant_code: variantCode, // Keep code for reference
        gross_price: parseFloat(price.gross) || 0,
        net_price: parseFloat(price.net) || 0,
        currency: DataValidator.normalizeString(price.currency || 'EUR'),
        price_type: DataValidator.normalizeString(price.type || 'retail'),
        min_quantity: parseInt(price.min_quantity) || 1,
        created_at: new Date(),
        updated_at: new Date()
      });
    });
  }
  
  /**
   * Process suggested retail price data from a variant
   * @param {Object} srpData - The SRP XML object
   * @param {string} variantCode - Variant code for reference
   * @param {Object} transformedData - The data collection being built
   */
  _processSuggestedPrices(srpData, variantCode, transformedData) {
    // Special method for suggested retail prices
    if (!srpData) return;
    
    transformedData.prices.push({
      variant_id: null, // Will be set after variant is inserted
      variant_code: variantCode, // Keep code for reference
      gross_price: parseFloat(srpData.gross) || 0,
      net_price: parseFloat(srpData.net) || 0,
      currency: DataValidator.normalizeString(srpData.currency || 'EUR'),
      price_type: 'suggested',
      min_quantity: 1,
      created_at: new Date(),
      updated_at: new Date()
    });
  }
  
  /**
   * Process images for a product
   * @param {Object} product - The product XML object
   * @param {string} productCode - Product code for reference
   * @param {Object} transformedData - The data collection being built
   */
  _processImages(product, productCode, transformedData) {
    // Skip if no images section
    if (!product.images) return;
    
    // Handle different image structures
    const imageItems = product.images.image ?
      (Array.isArray(product.images.image) ? product.images.image : [product.images.image]) :
      (Array.isArray(product.images) ? product.images : []);
    
    imageItems.forEach((image, index) => {
      // Skip if no URL
      const url = DataValidator.normalizeString(image.url || image.src || image.path);
      if (!url) return;
      
      transformedData.images.push({
        product_id: null, // Will be set after product is inserted
        url: url,
        is_main: image.is_main === 'true' || image.is_main === true || image.main === 'true' || image.main === true || index === 0,
        order: parseInt(image.order) || index + 1,
        created_at: new Date(),
        updated_at: new Date()
      });
    });
  }

  /**
   * Process product documents if available
   * @param {Object} product - The product XML object
   * @param {string} productCode - Product code for reference
   * @param {Object} transformedData - The transformed data collection
   */
  _processDocuments(product, productCode, transformedData) {
    // Skip if no documents section
    if (!product.documents) return;
    
    // Handle different document structures
    const documentItems = product.documents.document ?
      (Array.isArray(product.documents.document) ? product.documents.document : [product.documents.document]) :
      (Array.isArray(product.documents) ? product.documents : []);
    
    documentItems.forEach((doc, index) => {
      // Skip if no URL
      const url = DataValidator.normalizeString(doc.url || doc.href || doc.link);
      if (!url) return;
      
      transformedData.documents.push({
        product_id: null, // Will be set after product is inserted
        name: DataValidator.normalizeString(doc.name || doc.title || `Document ${index + 1}`),
        url: url,
        type: DataValidator.normalizeString(doc.type || doc.mime_type || this._inferDocumentType(url)),
        created_at: new Date(),
        updated_at: new Date()
      });
    });
  }

  /**
   * Infer document type from URL
   * @param {string} url - Document URL
   * @returns {string} Document type
   */
  _inferDocumentType(url) {
    if (!url) return '';
    
    const extension = url.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf': return 'PDF';
      case 'doc':
      case 'docx': return 'Word Document';
      case 'xls':
      case 'xlsx': return 'Excel Document';
      case 'txt': return 'Text Document';
      case 'zip':
      case 'rar': return 'Archive';
      default: return extension.toUpperCase();
    }
  }

  /**
   * Process product properties/attributes if available
   * @param {Object} product - The product XML object
   * @param {string} productCode - Product code for reference
   * @param {Object} transformedData - The transformed data collection
   */
  _processProperties(product, productCode, transformedData) {
    // Skip if no properties section
    if (!product.properties && !product.attributes) return;
    
    // First try properties format
    const propertiesSection = product.properties || product.attributes || {};
    
    // Check for explicitly named properties/attributes
    if (propertiesSection.property || propertiesSection.attribute) {
      const propertyItems = propertiesSection.property || propertiesSection.attribute;
      const items = Array.isArray(propertyItems) ? propertyItems : [propertyItems];
      
      items.forEach(prop => {
        const name = DataValidator.normalizeString(prop.name || prop.n);
        const value = DataValidator.normalizeString(prop.value || prop.v || prop._);
        
        if (name) {
          transformedData.productProperties.push({
            product_id: null, // Will be set after product is inserted
            name: name,
            value: value || '',
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      });
    } else {
      // Try direct properties/attributes as object keys
      Object.keys(propertiesSection).forEach(key => {
        if (key !== '_' && key !== '$') { // Skip special XML keys
          transformedData.productProperties.push({
            product_id: null, // Will be set after product is inserted
            name: DataValidator.normalizeString(key),
            value: DataValidator.normalizeString(propertiesSection[key]),
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      });
    }
    
    // Also check for specific product fields that should be treated as properties
    // These are fields that don't directly map to our database columns
    const additionalFields = [
      'brand', 'manufacturer', 'condition', 'warranty', 'material', 'keywords',
      'seo_title', 'seo_keywords', 'seo_description'
    ];
    
    additionalFields.forEach(field => {
      if (product[field] && typeof product[field] !== 'object') {
        transformedData.productProperties.push({
          product_id: null, // Will be set after product is inserted
          name: field,
          value: DataValidator.normalizeString(product[field]),
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });
  }

  /**
   * Process category data from a product
   * @param {Object} product - The product XML object
   * @param {Object} transformedData - The data collection being built
   * @returns {string} Category ID for reference
   */
  _processCategory(product, transformedData) {
    // Handle different XML structures
    let categoryData = null;
    let categoryId = 'uncategorized';
    
    if (product.category) {
      // Extract category data, handling both formats
      if (typeof product.category === 'object') {
        categoryData = {
          id: DataValidator.normalizeString(product.category.id),
          name: DataValidator.normalizeString(product.category.name || product.category.n),
          path: DataValidator.normalizeString(product.category.path)
        };
        
        // Extract parent ID from path if possible
        if (categoryData.path) {
          const pathParts = categoryData.path.split('/');
          if (pathParts.length > 1) {
            categoryData.parent_id = pathParts[pathParts.length - 2].trim();
          }
        }
      } else {
        // Simple string format
        categoryData = {
          id: 'category-' + this._slugify(product.category),
          name: DataValidator.normalizeString(product.category),
          path: DataValidator.normalizeString(product.category)
        };
      }
      
      categoryId = categoryData.id || categoryData.name;
    }
    
    // Handle category_idosell if present (alternative path)
    if (product.category_idosell && product.category_idosell.path) {
      if (!categoryData) {
        categoryData = {
          id: 'idosell-' + this._slugify(product.category_idosell.path),
          name: DataValidator.normalizeString(product.category_idosell.path.split('/').pop()),
          path: DataValidator.normalizeString(product.category_idosell.path)
        };
        categoryId = categoryData.id;
      } else {
        categoryData.idosell_path = DataValidator.normalizeString(product.category_idosell.path);
      }
    }
    
    // Only add if we have a category
    if (categoryData && !transformedData.categories.has(categoryId)) {
      // Add timestamps
      categoryData.created_at = new Date();
      categoryData.updated_at = new Date();
      
      transformedData.categories.set(categoryId, categoryData);
    }
    
    return categoryId;
  }
  
  /**
   * Process producer data from a product
   * @param {Object} product - The product XML object
   * @param {Object} transformedData - The data collection being built
   * @returns {string} Producer ID or name for reference
   */
  _processProducer(product, transformedData) {
    let producerName = 'unknown';
    let producerId = null;
    
    // Extract producer data, handling different formats
    if (product.producer) {
      if (typeof product.producer === 'object') {
        // Use name as key since it's more reliable
        producerName = DataValidator.normalizeString(product.producer.name);
        if (producerName) {
          const producerData = {
            name: producerName,
            description: DataValidator.normalizeString(product.producer.description),
            website: DataValidator.normalizeString(product.producer.website)
          };
          
          // Use provided ID or auto-increment
          if (product.producer.id && !isNaN(parseInt(product.producer.id))) {
            producerData.id = parseInt(product.producer.id);
            producerId = producerData.id;
          }
          
          // Add timestamps
          producerData.created_at = new Date();
          producerData.updated_at = new Date();
          
          // Use name as key since IDs might be missing
          if (!transformedData.producers.has(producerName)) {
            transformedData.producers.set(producerName, producerData);
          }
        }
      } else {
        // Simple string format
        producerName = DataValidator.normalizeString(product.producer);
        if (producerName && !transformedData.producers.has(producerName)) {
          transformedData.producers.set(producerName, {
            name: producerName,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }
    }
    
    return producerId || producerName; // This will be handled later by database auto-increment
  }

  /**
   * Process unit data from a product
   * @param {Object} product - The product XML object
   * @param {Object} transformedData - The data collection being built
   * @returns {string} Unit ID for reference
   */
  _processUnit(product, transformedData) {
    // Check if unit data exists in the product
    if (!product.unit) {
      return null;
    }
    
    let unitId = null;
    let unitName = null;
    
    // Handle different formats of unit data
    if (typeof product.unit === 'object') {
      unitId = DataValidator.normalizeString(product.unit.id);
      unitName = DataValidator.normalizeString(product.unit.name);
      if (!unitId && unitName) {
        unitId = 'unit-' + this._slugify(unitName);
      }
    } else {
      // Simple string format
      unitName = DataValidator.normalizeString(product.unit);
      unitId = 'unit-' + this._slugify(unitName);
    }
    
    // Only add if we have valid unit data
    if (unitId && !transformedData.units.has(unitId)) {
      const unitData = {
        id: unitId,
        name: unitName || unitId,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Add moq if available
      if (product.unit && product.unit.moq) {
        unitData.moq = parseInt(product.unit.moq) || 1;
      }
      
      transformedData.units.set(unitId, unitData);
    }
    
    return unitId;
  }

  /**
   * Convert a string to a slug form (for generating IDs)
   * @param {string} text - The text to convert
   * @returns {string} Slugified text
   */
  _slugify(text) {
    if (!text) return '';
    return text.toString()
      .toLowerCase()
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-')   // Replace multiple - with single -
      .replace(/^-+/, '')       // Trim - from start of text
      .replace(/-+$/, '');      // Trim - from end of text
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