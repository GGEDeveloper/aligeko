import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
    return headers;
  },
});

// Define our API service
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Product', 'Order', 'Customer'],
  endpoints: () => ({}),
}); 