/**
 * Error tracking utility
 * Used to log errors to console and potentially to an error tracking service
 */

/**
 * Track an error
 * @param {Error} error - The error object
 * @param {Object} context - Additional context about where/when the error occurred
 * @param {string} source - Source identifier for the error (e.g., component name)
 */
export const trackError = (error, context = {}, source = 'unknown') => {
  // Log to console in development
  console.error(`[${source}] Error:`, error);
  
  if (context && Object.keys(context).length > 0) {
    console.error(`[${source}] Error context:`, context);
  }
  
  // In the future, this could send errors to a service like Sentry
  // if (process.env.NODE_ENV === 'production') {
  //   // Send to error tracking service
  // }
};

/**
 * Wrap a function with error tracking
 * @param {Function} fn - The function to wrap
 * @param {string} source - Source identifier
 * @returns {Function} - Wrapped function with error tracking
 */
export const withErrorTracking = (fn, source = 'unknown') => {
  return (...args) => {
    try {
      return fn(...args);
    } catch (error) {
      trackError(error, { args }, source);
      throw error; // Re-throw to maintain original behavior
    }
  };
}; 