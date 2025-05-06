import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Application configuration object
 * Contains all application settings loaded from environment variables
 */
const config = {
  app: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || 'http://localhost:3001',
    apiPrefix: '/api'
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'alitools-b2b-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  },
  gekoApi: {
    url: process.env.GEKO_API_URL || 'https://api.geko.com/products',
    syncIntervalMinutes: parseInt(process.env.GEKO_API_SYNC_INTERVAL || '30', 10),
    username: process.env.GEKO_API_USERNAME,
    password: process.env.GEKO_API_PASSWORD,
    retryAttempts: parseInt(process.env.GEKO_API_RETRY_ATTEMPTS || '3', 10),
    retryDelayMs: parseInt(process.env.GEKO_API_RETRY_DELAY_MS || '5000', 10)
  },
  syncHealth: {
    alertsEnabled: process.env.SYNC_HEALTH_ALERTS_ENABLED === 'true' || false,
    alertThreshold: parseInt(process.env.SYNC_HEALTH_ALERT_THRESHOLD || '3', 10),
    alertEmail: {
      from: process.env.SYNC_HEALTH_EMAIL_FROM || process.env.EMAIL_FROM || 'noreply@alitools.com',
      to: process.env.SYNC_HEALTH_EMAIL_TO || process.env.ADMIN_EMAIL,
      host: process.env.SYNC_HEALTH_EMAIL_HOST || process.env.SMTP_HOST,
      port: parseInt(process.env.SYNC_HEALTH_EMAIL_PORT || process.env.SMTP_PORT || '587', 10),
      secure: process.env.SYNC_HEALTH_EMAIL_SECURE === 'true' || process.env.SMTP_SECURE === 'true',
      user: process.env.SYNC_HEALTH_EMAIL_USER || process.env.SMTP_USER,
      password: process.env.SYNC_HEALTH_EMAIL_PASSWORD || process.env.SMTP_PASS
    },
    performanceThresholds: {
      duration: parseInt(process.env.SYNC_HEALTH_THRESHOLD_DURATION || '120', 10), // seconds
      memory: parseInt(process.env.SYNC_HEALTH_THRESHOLD_MEMORY || '512', 10), // MB
      errorRate: parseFloat(process.env.SYNC_HEALTH_THRESHOLD_ERROR_RATE || '0.05', 10) // 5%
    }
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: process.env.LOG_MAX_FILES || '7d'
  },
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5', 10) * 1024 * 1024, // 5MB default
    allowedFormats: process.env.UPLOAD_ALLOWED_FORMATS 
      ? process.env.UPLOAD_ALLOWED_FORMATS.split(',') 
      : ['jpg', 'jpeg', 'png', 'gif']
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    ttl: parseInt(process.env.REDIS_TTL || '86400', 10) // 24 hours default
  },
  email: {
    from: process.env.EMAIL_FROM || 'noreply@alitools.com',
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  }
};

export default config; 