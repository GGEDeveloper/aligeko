import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import sequelize from './config/database';
import { csrf, sanitize, logger } from './middleware';

// Load environment variables
dotenv.config();

// Initialize express app
const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://*.alitools.com", "https://via.placeholder.com"],
      connectSrc: ["'self'", "https://*.alitools.com"]
    }
  },
  referrerPolicy: { policy: 'same-origin' },
  frameguard: { action: 'deny' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
})); 

// Compression for better performance
app.use(compression());

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000', 
      'https://alitools-b2b.vercel.app'
    ];
    
    // Allow all Vercel preview deployment URLs
    if (
      allowedOrigins.includes(origin) || 
      origin.match(/https:\/\/aligekow-[a-z0-9]+-alitools-projects\.vercel\.app/)
    ) {
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.log(`CORS blocked origin: ${origin}`);
    return callback(new Error(`CORS policy does not allow access from origin ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN']
}));

// Parse cookies, JSON and URL-encoded request bodies
app.use(cookieParser());
app.use(express.json({
  limit: '1mb',  // Limit payload size
  verify: (req, res, buf) => {
    // Store raw body for signature verification if needed
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev')); // HTTP request logging
  app.use(logger.apiRequestLogger); // Detailed API request logging
  app.use(logger.sensitiveResourceLogger); // Security logging for sensitive resources
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all requests
app.use(limiter);

// Set CSRF cookie on all requests
app.use(csrf.setCsrfCookie);

// Apply CSRF protection to all non-GET requests
app.use(csrf.csrfProtection);

// Apply input sanitization to all requests
app.use(sanitize.sanitizeRequest);

// API routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'AliTools B2B API is running' });
});

// Error handling middleware
app.use(errorHandler);

// Start server (only in non-serverless environments)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// Export for serverless environments
export default app;
module.exports = app; 