import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../services/axiosBaseQuery';

export const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/v1/cart' }),
  tagTypes: ['Cart'],
  endpoints: builder => ({
    getUserCart: builder.query({
      query: () => '/',
      providesTags: ['Cart'],
    }),
    syncCart: builder.mutation({
      query: cartData => ({
        url: '/',
        method: 'POST',
        body: cartData,
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: '/',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    addCartItem: builder.mutation({
      query: itemData => ({
        url: '/items',
        method: 'POST',
        body: itemData,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation({
      query: ({ itemId, ...updates }) => ({
        url: `/items/${itemId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: builder.mutation({
      query: itemId => ({
        url: `/items/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetUserCartQuery,
  useSyncCartMutation,
  useClearCartMutation,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
} = cartApi;

