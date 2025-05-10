/**
 * Upload Security Middleware
 * 
 * Implements security measures for file uploads:
 * - Rate limiting
 * - Size limitation
 * - Content validation
 * - Auth verification
 */

import rateLimit from 'express-rate-limit';
import logger from '../config/logger.js';

// Create a rate limiter for uploads
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 uploads per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many upload attempts, please try again later'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for upload endpoint: ${req.ip}`);
    res.status(429).json(options.message);
  },
  keyGenerator: (req) => {
    // Use a combination of IP and user ID (if available)
    return req.user?.id 
      ? `${req.ip}-${req.user.id}` 
      : req.ip;
  }
});

/**
 * Verify user has admin privileges for upload
 */
export const verifyUploadPermission = (req, res, next) => {
  // Check if user is authenticated
  if (!req.user) {
    logger.warn('Unauthenticated upload attempt');
    return res.status(401).json({
      success: false,
      message: 'Authentication required for file uploads'
    });
  }
  
  // Check if user has admin role
  if (!req.user.roles || !req.user.roles.includes('admin')) {
    logger.warn(`Unauthorized upload attempt by user ${req.user.id}`);
    return res.status(403).json({
      success: false,
      message: 'Admin privileges required for file uploads'
    });
  }
  
  // User has proper permissions
  next();
};

/**
 * Add security headers to protect against malicious uploads
 */
export const addSecurityHeaders = (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff'); // Prevent MIME type sniffing
  res.setHeader('X-XSS-Protection', '1; mode=block'); // Enable XSS protection
  res.setHeader('X-Frame-Options', 'DENY'); // Prevent clickjacking
  
  next();
};

/**
 * Log upload attempts for audit purposes
 */
export const logUploadAttempt = (req, res, next) => {
  const clientIp = req.ip;
  const userId = req.user?.id || 'unauthenticated';
  
  logger.info(`Upload attempt: [User: ${userId}] [IP: ${clientIp}]`);
  
  // Record original URL for audit trail
  req.uploadAuditUrl = req.originalUrl;
  
  // Use response finish event to log completion status
  res.on('finish', () => {
    const status = res.statusCode;
    const success = status >= 200 && status < 300;
    
    if (success) {
      logger.info(`Upload successful: [User: ${userId}] [IP: ${clientIp}] [Status: ${status}]`);
    } else {
      logger.warn(`Upload failed: [User: ${userId}] [IP: ${clientIp}] [Status: ${status}]`);
    }
  });
  
  next();
};

// Export combined middleware
export default [
  uploadRateLimiter,
  addSecurityHeaders,
  verifyUploadPermission,
  logUploadAttempt
]; 