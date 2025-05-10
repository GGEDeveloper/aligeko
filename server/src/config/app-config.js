/**
 * Application Configuration
 * 
 * This module centralizes application configuration with proper environment variable fallbacks
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration object
const config = {
  // Application settings
  app: {
    name: process.env.APP_NAME || 'AliTools B2B',
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || 'http://localhost:5000',
  },
  
  // Database settings handled in database.js
  
  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || 'development-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // CORS settings
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
    maxSize: parseInt(process.env.LOG_MAX_SIZE || '10485760', 10), // 10MB
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),
  },
  
  // GEKO API configuration
  gekoApi: {
    url: process.env.GEKO_API_URL || 'https://api.geko.com/products',
    username: process.env.GEKO_API_USERNAME,
    password: process.env.GEKO_API_PASSWORD,
    syncInterval: parseInt(process.env.GEKO_API_SYNC_INTERVAL || '30', 10), // minutes
    retryAttempts: parseInt(process.env.GEKO_API_RETRY_ATTEMPTS || '3', 10),
    retryDelayMs: parseInt(process.env.GEKO_API_RETRY_DELAY_MS || '5000', 10),
  },
  
  // Sync health monitoring
  syncHealth: {
    alertsEnabled: process.env.SYNC_HEALTH_ALERTS_ENABLED === 'true' || false,
    alertThreshold: parseInt(process.env.SYNC_HEALTH_ALERT_THRESHOLD || '3', 10),
    alertEmail: {
      to: process.env.SYNC_HEALTH_EMAIL_TO,
      from: process.env.SYNC_HEALTH_EMAIL_FROM || 'noreply@alitools.com',
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  },
};

export default config; 