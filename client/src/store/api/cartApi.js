import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/cart',
    prepareHeaders: (headers, { getState }) => {
      // Get the token from the auth state
      const token = getState().auth.token;
      
      // Add authorization header if token exists
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Cart'],
  endpoints: (builder) => ({
    getUserCart: builder.query({
      query: () => `/`,
      providesTags: ['Cart']
    }),
    
    syncCart: builder.mutation({
      query: (cartData) => ({
        url: '/',
        method: 'POST',
        body: cartData
      }),
      invalidatesTags: ['Cart']
    }),
    
    clearCart: builder.mutation({
      query: () => ({
        url: '/',
        method: 'DELETE'
      }),
      invalidatesTags: ['Cart']
    }),
    
    addCartItem: builder.mutation({
      query: (itemData) => ({
        url: '/items',
        method: 'POST',
        body: itemData
      }),
      invalidatesTags: ['Cart']
    }),
    
    updateCartItem: builder.mutation({
      query: ({ itemId, ...itemData }) => ({
        url: `/items/${itemId}`,
        method: 'PUT',
        body: itemData
      }),
      invalidatesTags: ['Cart']
    }),
    
    removeCartItem: builder.mutation({
      query: (itemId) => ({
        url: `/items/${itemId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Cart']
    })
  })
});

export const {
  useGetUserCartQuery,
  useSyncCartMutation,
  useClearCartMutation,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation
} = cartApi; 