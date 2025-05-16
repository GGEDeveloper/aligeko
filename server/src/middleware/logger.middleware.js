import logger from '../utils/logger.js';

/**
 * Middleware to log API requests with response time
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const apiRequestLogger = (req, res, next) => {
  // Record start time
  const startTime = Date.now();
  
  // Add response listener to log when the response is complete
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.logApiRequest(req, res, responseTime);
    
    // Log security events for authentication and authorization
    if (req.path.includes('/auth/') && req.method === 'POST') {
      // Log authentication attempts
      const eventType = req.path.includes('/login') ? 'AUTH_ATTEMPT' : 
                         req.path.includes('/register') ? 'REGISTER_ATTEMPT' : 
                         req.path.includes('/2fa') ? 'TWO_FACTOR_ATTEMPT' : 'AUTH_ACTION';
      
      logger.logSecurityEvent(req, eventType, {
        success: res.statusCode < 400,
        statusCode: res.statusCode
      });
    }
    
    // Log security events for failed requests
    if (res.statusCode >= 400) {
      const eventType = res.statusCode === 401 ? 'UNAUTHORIZED_ACCESS' :
                        res.statusCode === 403 ? 'FORBIDDEN_ACCESS' :
                        res.statusCode === 429 ? 'RATE_LIMIT_EXCEEDED' :
                        'FAILED_REQUEST';
      
      logger.logSecurityEvent(req, eventType, {
        statusCode: res.statusCode
      });
    }
  });
  
  next();
};

/**
 * Middleware to log security events related to accessing sensitive resources
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const sensitiveResourceLogger = (req, res, next) => {
  // Define patterns for sensitive resources
  const sensitivePatterns = [
    '/api/v1/admin',
    '/api/v1/users',
    '/api/v1/settings',
    '/api/v1/orders',
    '/api/v1/customers'
  ];
  
  // Check if the request URL matches any sensitive pattern
  const isSensitiveResource = sensitivePatterns.some(pattern => 
    req.path.startsWith(pattern));
  
  if (isSensitiveResource) {
    logger.logSecurityEvent(req, 'SENSITIVE_RESOURCE_ACCESS', {
      resource: req.path,
      method: req.method
    });
  }
  
  next();
};

export default {
  apiRequestLogger,
  sensitiveResourceLogger
}; 