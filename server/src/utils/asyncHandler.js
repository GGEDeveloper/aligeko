/**
 * Async handler utility for route controllers
 * Wraps async functions to eliminate try/catch blocks in route handlers
 * @param {Function} fn - The async route handler function to wrap
 * @returns {Function} Express middleware function that handles errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = asyncHandler; 