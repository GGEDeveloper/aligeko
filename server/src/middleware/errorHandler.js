/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Default values
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  
  // Determine if this is an operational error (expected) or a programming error
  const isOperational = err.isOperational !== undefined ? err.isOperational : false;
  
  // Log errors
  console.error(`[ERROR] ${req.method} ${req.path}:`, {
    message: err.message,
    statusCode,
    isOperational,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      isOperational
    })
  });
};

/**
 * Handle uncaught exceptions and unhandled rejections
 */
export const setupErrorHandlers = () => {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION:', error);
    process.exit(1);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (error) => {
    console.error('UNHANDLED REJECTION:', error);
    process.exit(1);
  });
}; 