import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { appendCSRFToken } from '../../utils/csrf';

// Define base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: '/api/v1',
  prepareHeaders: (headers, { getState }) => {
    // Get the token from the auth slice
    const token = getState().auth.token;

    // Add authorization header if token exists
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    // Add CSRF token header for non-GET requests
    const method = headers.get('X-Method') || 'GET';
    if (method !== 'GET') {
      const csrfHeaders = appendCSRFToken();
      for (const [key, value] of Object.entries(csrfHeaders)) {
        headers.set(key, value);
      }
    }
    
    return headers;
  },
  credentials: 'include', // Include cookies in requests
});

// Define our API service
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Product', 'Order', 'Customer'],
  endpoints: () => ({}),
}); 