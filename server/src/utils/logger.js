import winston from 'winston';
import fs from 'fs';
import path from 'path';
import config from '../config/app-config.js';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

// Create loggers
const appLogger = winston.createLogger({
  level: config.logging.level || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'app.log')
    }),
  ],
});

const accessLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'access.log')
    }),
  ],
});

const securityLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'security.log')
    }),
  ],
});

// Strip sensitive data from logs
const sanitizeRequest = (req) => {
  const sanitized = {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id || 'anonymous',
    query: { ...req.query },
    body: { ...req.body }
  };

  // Remove sensitive data
  if (sanitized.body.password) sanitized.body.password = '[REDACTED]';
  if (sanitized.body.newPassword) sanitized.body.newPassword = '[REDACTED]';
  if (sanitized.body.currentPassword) sanitized.body.currentPassword = '[REDACTED]';
  if (sanitized.body.token) sanitized.body.token = '[REDACTED]';
  if (sanitized.body.refreshToken) sanitized.body.refreshToken = '[REDACTED]';
  if (sanitized.body.creditCard) sanitized.body.creditCard = '[REDACTED]';
  
  return sanitized;
};

// Log API request
export const logApiRequest = (req, res, responseTime) => {
  const sanitized = sanitizeRequest(req);
  
  accessLogger.info('API Request', {
    ...sanitized,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
  });
};

// Log security event
export const logSecurityEvent = (req, eventType, details = {}) => {
  const sanitized = sanitizeRequest(req);
  
  securityLogger.info('Security Event', {
    ...sanitized,
    eventType,
    ...details,
  });
};

// Log error
export const logError = (error, req = null) => {
  const logData = {
    message: error.message,
    stack: error.stack,
  };
  
  if (req) {
    logData.request = sanitizeRequest(req);
  }
  
  appLogger.error('Application Error', logData);
};

export default {
  app: appLogger,
  access: accessLogger,
  security: securityLogger,
  logApiRequest,
  logSecurityEvent,
  logError
}; 