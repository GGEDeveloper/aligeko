import { sanitize as xssSanitize } from 'xss-filters';

/**
 * Recursively sanitize object properties to prevent XSS attacks
 * @param {Object|Array|String} data - Data to sanitize
 * @returns {Object|Array|String} - Sanitized data
 */
const sanitizeData = (data) => {
  // Handle null or undefined
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle primitives
  if (typeof data !== 'object') {
    return typeof data === 'string' ? xssSanitize(data) : data;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  // Handle objects
  const sanitized = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      sanitized[key] = sanitizeData(data[key]);
    }
  }
  return sanitized;
};

/**
 * Fields that should not be sanitized (like passwords, tokens, etc.)
 */
const SANITIZE_EXCEPTIONS = [
  'password',
  'passwordConfirmation',
  'token',
  'refreshToken',
  'apiKey',
  'jwt'
];

/**
 * Middleware to sanitize request body, query and params
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const sanitizeRequest = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      const sanitizedBody = {};
      
      // Only sanitize non-exception fields
      for (const key in req.body) {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
          sanitizedBody[key] = SANITIZE_EXCEPTIONS.includes(key) 
            ? req.body[key] 
            : sanitizeData(req.body[key]);
        }
      }
      
      req.body = sanitizedBody;
    }
    
    // Sanitize URL query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeData(req.query);
    }
    
    // Sanitize URL path parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeData(req.params);
    }
    
    next();
  } catch (error) {
    console.error('Error in sanitize middleware:', error);
    next(error);
  }
};

export default {
  sanitizeRequest
}; 