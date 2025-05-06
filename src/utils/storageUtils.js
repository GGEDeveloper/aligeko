/**
 * Utility for safely interacting with localStorage and sessionStorage in both browser and test environments
 */

// Safe localStorage wrapper
export const safeLocalStorage = {
  getItem: (key) => {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  },
  
  setItem: (key, value) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  },
  
  removeItem: (key) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

// Safe sessionStorage wrapper
export const safeSessionStorage = {
  getItem: (key) => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        return sessionStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error('Error accessing sessionStorage:', error);
      return null;
    }
  },
  
  setItem: (key, value) => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error setting sessionStorage:', error);
    }
  },
  
  removeItem: (key) => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
    }
  }
};

// Helper to parse JSON safely
export const safeJsonParse = (json, fallback = null) => {
  try {
    return json ? JSON.parse(json) : fallback;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
}; 