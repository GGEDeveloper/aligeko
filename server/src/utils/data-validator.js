/**
 * Data Validator
 * 
 * Utility for validating and normalizing data from XML imports
 * according to the requirements in docs/database/data-scraper.md
 */

import { escape as escapeHtml } from 'html-escaper';
import logger from '../config/logger.js';

class DataValidator {
  /**
   * Validates an EAN code
   * @param {string} ean - The EAN code to validate
   * @returns {boolean} Whether the EAN is valid
   */
  static validateEan(ean) {
    if (!ean) return false;
    // EAN-13 format: 13 digits
    const eanRegex = /^\d{13}$/;
    return eanRegex.test(ean);
  }

  /**
   * Validates a URL
   * @param {string} url - The URL to validate
   * @returns {boolean} Whether the URL is valid
   */
  static validateUrl(url) {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Escapes HTML content in a string to prevent code injection
   * @param {string} content - The content to escape
   * @returns {string} The escaped content
   */
  static escapeHtml(content) {
    if (!content) return '';
    return escapeHtml(content);
  }

  /**
   * Normalizes a string by trimming whitespace
   * @param {string} str - The string to normalize
   * @returns {string} The normalized string
   */
  static normalizeString(str) {
    if (str === undefined || str === null) return '';
    
    // Handle numbers
    if (typeof str === 'number') return String(str);
    
    // Handle booleans
    if (typeof str === 'boolean') return String(str);
    
    // Handle strings
    if (typeof str === 'string') return str.trim();
    
    // Handle objects with toString method
    if (typeof str === 'object' && str.toString && typeof str.toString === 'function') {
      // Avoid [object Object]
      if (str.toString() !== '[object Object]') {
        return str.toString().trim();
      }
    }
    
    return '';
  }

  /**
   * Converts a string to a number
   * @param {string} str - The string to convert
   * @param {number} defaultValue - Default value if conversion fails
   * @returns {number} The converted number or default value
   */
  static toNumber(str, defaultValue = 0) {
    if (!str) return defaultValue;
    const num = parseFloat(str);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * Converts a string to a boolean
   * @param {string|boolean} value - The value to convert
   * @returns {boolean} The converted boolean
   */
  static toBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (!value) return false;
    return value.toString().toLowerCase() === 'true';
  }

  /**
   * Validates and normalizes product data
   * @param {Object} product - Product data from XML
   * @returns {Object} Validated and normalized product data
   */
  static validateProduct(product) {
    if (!product) {
      logger.warn('Empty product data received for validation');
      return null;
    }

    try {
      // Extract basic product data
      const ean = product.ean || product['@_EAN'] || '';
      const isEanValid = this.validateEan(ean);
      
      if (!isEanValid && ean) {
        logger.warn(`Invalid EAN format: ${ean}`);
      }

      const description = product.description || {};
      const longDesc = description.long_desc || '';
      const shortDesc = description.short_desc || '';

      // Validate and normalize product
      return {
        ...product,
        ean: isEanValid ? ean : null,
        name: this.normalizeString(description.name || ''),
        description: this.escapeHtml(longDesc),
        short_description: this.escapeHtml(shortDesc)
      };
    } catch (error) {
      logger.error(`Error validating product: ${error.message}`);
      return product; // Return original in case of error
    }
  }

  /**
   * Validates and normalizes image data
   * @param {Object} image - Image data from XML
   * @returns {Object} Validated and normalized image data
   */
  static validateImage(image) {
    if (!image) return null;
    
    try {
      const url = image.url || image['@_url'] || '';
      const isUrlValid = this.validateUrl(url);
      
      if (!isUrlValid) {
        logger.warn(`Invalid image URL: ${url}`);
        return null;
      }
      
      return {
        ...image,
        url
      };
    } catch (error) {
      logger.error(`Error validating image: ${error.message}`);
      return null;
    }
  }

  /**
   * Convert a string to a slug form (for generating IDs)
   * @param {string} text - The text to convert
   * @returns {string} Slugified text
   */
  static slugify(text) {
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

export default DataValidator; 