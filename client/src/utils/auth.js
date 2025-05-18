// Token storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

/**
 * Save authentication token to localStorage
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Get authentication token from localStorage
 * @returns {string|null} - JWT token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Save user data to localStorage
 * @param {Object} user - User data
 */
export const setUserData = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

/**
 * Get user data from localStorage
 * @returns {Object|null} - User data or null if not found
 */
export const getUserData = () => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Check if user has specific role
 * @param {string|string[]} roles - Role or array of roles to check
 * @returns {boolean} - True if user has the required role(s)
 */
export const hasRole = (roles) => {
  const user = getUserData();
  if (!user || !user.roles) return false;
  
  if (Array.isArray(roles)) {
    return roles.some(role => user.roles.includes(role));
  }
  
  return user.roles.includes(roles);
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Setup authentication with the provided token and user data
 * @param {string} token - JWT token
 * @param {Object} user - User data
 */
export const setupAuth = (token, user) => {
  setAuthToken(token);
  setUserData(user);
};

export default {
  setAuthToken,
  getAuthToken,
  setUserData,
  getUserData,
  isAuthenticated,
  hasRole,
  clearAuthData,
  setupAuth,
};
