/**
 * Simple Logging Utility
 * 
 * This module provides consistent logging with timestamp and log levels.
 */

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    
    // Log levels (in order of severity)
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }
  
  /**
   * Get current timestamp
   * @returns {string} Formatted timestamp
   */
  _getTimestamp() {
    const now = new Date();
    return now.toISOString();
  }
  
  /**
   * Check if a log level should be displayed
   * @param {string} level - The level to check
   * @returns {boolean} True if the level should be displayed
   */
  _shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }
  
  /**
   * Log an error message
   * @param {string} message - The message to log
   */
  error(message) {
    if (this._shouldLog('error')) {
      console.error(`[ERROR] ${this._getTimestamp()} - ${message}`);
    }
  }
  
  /**
   * Log a warning message
   * @param {string} message - The message to log
   */
  warn(message) {
    if (this._shouldLog('warn')) {
      console.warn(`[WARN] ${this._getTimestamp()} - ${message}`);
    }
  }
  
  /**
   * Log an info message
   * @param {string} message - The message to log
   */
  info(message) {
    if (this._shouldLog('info')) {
      console.info(`[INFO] ${this._getTimestamp()} - ${message}`);
    }
  }
  
  /**
   * Log a debug message
   * @param {string} message - The message to log
   */
  debug(message) {
    if (this._shouldLog('debug')) {
      console.debug(`[DEBUG] ${this._getTimestamp()} - ${message}`);
    }
  }
  
  /**
   * Set the log level
   * @param {string} level - The log level to set
   */
  setLogLevel(level) {
    if (this.levels[level] !== undefined) {
      this.logLevel = level;
    }
  }
}

// Create and export a singleton instance
const logger = new Logger();
export default logger; 