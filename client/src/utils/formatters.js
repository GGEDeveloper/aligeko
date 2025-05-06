/**
 * Format a number as currency
 * @param {number} value - The value to format
 * @param {string} locale - The locale to use for formatting (default: 'en-US')
 * @param {string} currency - The currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, locale = 'en-US', currency = 'USD') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a date string
 * @param {string|Date} date - The date to format
 * @param {string} locale - The locale to use for formatting (default: 'en-US')
 * @param {Object} options - Intl.DateTimeFormat options (default: date and time)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = 'en-US', options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Format a number with thousands separator
 * @param {number} value - The value to format
 * @param {string} locale - The locale to use for formatting (default: 'en-US')
 * @returns {string} Formatted number
 */
export const formatNumber = (value, locale = 'en-US') => {
  return new Intl.NumberFormat(locale).format(value);
};

/**
 * Truncate text to a specified length with ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length (default: 100)
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}; 