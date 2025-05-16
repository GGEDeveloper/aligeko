/**
 * Custom API Error class for structured error handling
 * Used for HTTP error responses with status codes and messages
 */
class ApiError extends Error {
  /**
   * Create an API error instance
   * @param {number} statusCode - HTTP status code for the error
   * @param {string} message - Error message
   * @param {boolean} isOperational - Whether the error is operational (expected) or not
   * @param {string} stack - Optional error stack trace
   */
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

export default ApiError;