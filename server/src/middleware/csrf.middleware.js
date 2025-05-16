import crypto from 'crypto';
import config from '../config/app-config.js';

// CSRF Token Configuration
const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');
const CSRF_COOKIE_NAME = 'xsrf-token';
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Creates a CSRF token
 * @returns {String} CSRF token
 */
export const generateToken = () => {
  const timestamp = Date.now();
  const hash = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(`${timestamp}`)
    .digest('hex');
  
  return `${timestamp}.${hash}`;
};

/**
 * Validates a CSRF token
 * @param {String} token - CSRF token to validate
 * @returns {Boolean} - Whether the token is valid
 */
export const validateToken = (token) => {
  if (!token || !token.includes('.')) {
    return false;
  }
  
  const [timestamp, hash] = token.split('.');
  
  // Check token expiry
  if (Date.now() - parseInt(timestamp, 10) > TOKEN_EXPIRY) {
    return false;
  }
  
  // Validate token signature
  const expectedHash = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(`${timestamp}`)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(expectedHash, 'hex')
  );
};

/**
 * Middleware to set CSRF cookie for the client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const setCsrfCookie = (req, res, next) => {
  const token = generateToken();
  
  // Set CSRF token in a cookie
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Allow JavaScript access (necessary for SPA to read and send in header)
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: TOKEN_EXPIRY
  });
  
  next();
};

/**
 * List of routes that should be excluded from CSRF protection
 */
const CSRF_EXCLUDED_ROUTES = [
  '/v1/auth/login',
  '/v1/auth/register',
  '/health',
  '/api/v1/auth/login',
  '/api/v1/auth/register'
];

/**
 * Middleware to verify CSRF token on mutating requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const csrfProtection = (req, res, next) => {
  // Skip CSRF check for all login and register routes
  if (req.path.includes('/auth/login') || req.path.includes('/auth/register')) {
    console.log(`Skipping CSRF check for authentication path: ${req.path}`);
    return next();
  }
  
  // Only check non-GET requests (POST, PUT, DELETE, etc.)
  if (req.method === 'GET') {
    return next();
  }
  
  // Get the path without the /api prefix if it exists
  const pathWithoutApi = req.path.startsWith('/api') ? req.path.substring(4) : req.path;
  
  // Skip CSRF check for excluded routes (with or without /api prefix)
  if (CSRF_EXCLUDED_ROUTES.some(route => 
    req.path === route || 
    pathWithoutApi === route ||
    req.path === `/api${route}`
  )) {
    console.log(`Skipping CSRF check for path: ${req.path} (matches excluded route)`);
    return next();
  }
  
  // Get token from header
  const token = req.headers[CSRF_HEADER_NAME.toLowerCase()];
  
  if (!token) {
    console.log(`CSRF token missing for path: ${req.path}`);
    return res.status(403).json({ 
      success: false, 
      error: { 
        code: 'CSRF_TOKEN_MISSING', 
        message: 'CSRF token missing' 
      } 
    });
  }
  
  if (!validateToken(token)) {
    console.log(`Invalid CSRF token for path: ${req.path}`);
    return res.status(403).json({ 
      success: false, 
      error: { 
        code: 'CSRF_TOKEN_INVALID', 
        message: 'CSRF token invalid or expired' 
      } 
    });
  }
  
  next();
};

/**
 * Default export for middleware index.js
 */
export default {
  setCsrfCookie,
  csrfProtection
}; 