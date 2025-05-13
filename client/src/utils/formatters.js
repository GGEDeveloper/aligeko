/**
 * Format a number as currency (EUR)
 * @param {number} amount - Amount to format
 * @param {string} locale - Locale for formatting (default: 'pt-PT')
 * @param {string} currency - Currency code (default: 'EUR')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, locale = 'pt-PT', currency = 'EUR') => {
  // Handle undefined or null amount
  if (amount === undefined || amount === null) {
    return '€0,00';
  }

  // Use Number.parseFloat to handle string inputs
  const numericAmount = Number.parseFloat(amount);
  
  // Check if the parsed amount is a valid number
  if (Number.isNaN(numericAmount)) {
    return '€0,00';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
};

/**
 * Format a date string
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'pt-PT')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = 'pt-PT') => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj);
};

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add to truncated text (default: ...)
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
};

/**
 * Format a number with specific precision
 * @param {number} num - Number to format
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {string} Formatted number string
 */
export const formatNumber = (num, precision = 2) => {
  if (num === undefined || num === null || Number.isNaN(Number(num))) {
    return '0';
  }
  
  return Number(num).toFixed(precision);
};

/**
 * Format a file size in bytes to a human-readable string
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}; 