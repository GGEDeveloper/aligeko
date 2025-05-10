/**
 * Utility for managing CSRF tokens
 */

// Get CSRF token from cookies
export const getCSRFToken = () => {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('xsrf-token='));
  
  if (tokenCookie) {
    return tokenCookie.split('=')[1].trim();
  }
  
  return null;
};

// Add CSRF token to API request headers
export const appendCSRFToken = (headers = {}) => {
  const token = getCSRFToken();
  
  if (token) {
    return {
      ...headers,
      'X-XSRF-TOKEN': token
    };
  }
  
  return headers;
};

export default {
  getCSRFToken,
  appendCSRFToken
}; 