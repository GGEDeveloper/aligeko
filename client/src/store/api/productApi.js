import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Use a blank baseUrl for working with absolute paths
const API_URL = '';

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from state
      const token = getState().auth.token;
      
      // Add token to headers if it exists
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    }
  }),
  tagTypes: ['Products', 'Product', 'ProductImage'],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params = {}) => {
        // Construct query params
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);
        if (params.category) queryParams.append('category', params.category);
        if (params.producer) queryParams.append('producer', params.producer);
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.order) queryParams.append('order', params.order);
        if (params.minPrice) queryParams.append('minPrice', params.minPrice);
        if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        
        return {
          url: `/api/v1/products${queryString}`,
          method: 'GET'
        };
      },
      transformResponse: (response) => {
        // Check if response is successful and contains data in the expected format
        if (response && response.success === true) {
          // Server returns data in a structure with 'data.items' and 'data.meta'
          if (response.data) {
            const { items = [], meta = {} } = response.data;
            return {
              data: {
                items: Array.isArray(items) ? items : [items].filter(Boolean),
                meta: {
                  totalItems: meta.totalItems || 0,
                  totalPages: meta.totalPages || 1,
                  currentPage: meta.currentPage || 1,
                  itemsPerPage: meta.itemsPerPage || 10
                }
              }
            };
          }
        }
        
        // If response indicates an error or unexpected format, log and return empty data
        console.error('API response format unexpected:', response);
        return { 
          data: {
            items: [], 
            meta: {
              totalItems: 0, 
              totalPages: 1, 
              currentPage: 1,
              itemsPerPage: 10
            }
          },
          error: response?.error || 'Unexpected API response format',
          details: response?.details || ''
        };
      },
      providesTags: (result) => 
        result 
          ? [
              'Products',
              ...result.data.items.map(({ id }) => ({ type: 'Products', id }))
            ]
          : ['Products']
    }),
    
    getProduct: builder.query({
      query: (id) => `/api/v1/products/${id}`,
      transformResponse: (response) => {
        if (response && response.success === true && response.product) {
          return response.product;
        }
        return null;
      },
      providesTags: (result, error, id) => [{ type: 'Product', id }]
    }),
    
    createProduct: builder.mutation({
      query: (productData) => ({
        url: '/api/v1/products',
        method: 'POST',
        body: productData
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }]
    }),
    
    updateProduct: builder.mutation({
      query: ({ id, ...productData }) => ({
        url: `/api/v1/products/${id}`,
        method: 'PUT',
        body: productData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Products', id: 'LIST' },
        { type: 'Product', id }
      ]
    }),
    
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/api/v1/products/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }]
    }),
    
    // Upload product image
    uploadProductImage: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/api/v1/products/${id}/images`,
        method: 'POST',
        body: formData,
        // Don't set Content-Type header as it will be set automatically for FormData
        formData: true
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id }
      ]
    }),
    
    getProductImages: builder.query({
      query: (productId) => ({
        url: `/api/v1/products/${productId}/images`,
        method: 'GET',
      }),
      providesTags: (result, error, productId) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'ProductImage', id })),
              { type: 'ProductImage', id: 'LIST' },
              { type: 'ProductImage', id: productId }
            ]
          : [{ type: 'ProductImage', id: 'LIST' }, { type: 'ProductImage', id: productId }],
    }),
    
    uploadProductImages: builder.mutation({
      query: ({ productId, formData, onUploadProgress }) => ({
        url: `/api/v1/products/${productId}/images`,
        method: 'POST',
        body: formData,
        formData: true,
        onUploadProgress,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'ProductImage', id: 'LIST' },
        { type: 'ProductImage', id: productId },
        { type: 'Product', id: productId }
      ],
    }),
    
    deleteProductImage: builder.mutation({
      query: ({ productId, imageId }) => ({
        url: `/api/v1/products/${productId}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { productId, imageId }) => [
        { type: 'ProductImage', id: imageId },
        { type: 'ProductImage', id: 'LIST' },
        { type: 'ProductImage', id: productId },
        { type: 'Product', id: productId }
      ],
    }),
    
    setPrimaryImage: builder.mutation({
      query: ({ productId, imageId }) => ({
        url: `/api/v1/products/${productId}/images/${imageId}/primary`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'ProductImage', id: 'LIST' },
        { type: 'ProductImage', id: productId },
        { type: 'Product', id: productId }
      ],
    }),
    
    // Bulk operations
    bulkUpdateProducts: builder.mutation({
      query: (data) => ({
        url: '/api/v1/products/bulk',
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }]
    }),
    
    bulkDeleteProducts: builder.mutation({
      query: (ids) => ({
        url: '/api/v1/products/bulk',
        method: 'DELETE',
        body: { ids }
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }]
    }),
    
    // Product variants endpoints
    getProductVariants: builder.query({
      query: (productId) => `/api/v1/products/${productId}/variants`,
      providesTags: (result, error, productId) => [
        { type: 'Product', id: productId },
        { type: 'Product', id: `${productId}-variants` }
      ]
    }),
    
    createProductVariant: builder.mutation({
      query: ({ productId, variantData }) => ({
        url: `/api/v1/products/${productId}/variants`,
        method: 'POST',
        body: variantData
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        { type: 'Product', id: `${productId}-variants` }
      ]
    }),
    
    updateProductVariant: builder.mutation({
      query: ({ productId, variantId, ...variantData }) => ({
        url: `/api/v1/products/${productId}/variants/${variantId}`,
        method: 'PUT',
        body: variantData
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        { type: 'Product', id: `${productId}-variants` }
      ]
    }),
    
    deleteProductVariant: builder.mutation({
      query: ({ productId, variantId }) => ({
        url: `/api/v1/products/${productId}/variants/${variantId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        { type: 'Product', id: `${productId}-variants` }
      ]
    }),
  })
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
  useGetProductImagesQuery,
  useUploadProductImagesMutation,
  useDeleteProductImageMutation,
  useSetPrimaryImageMutation,
  useBulkUpdateProductsMutation,
  useBulkDeleteProductsMutation,
  useGetProductVariantsQuery,
  useCreateProductVariantMutation,
  useUpdateProductVariantMutation,
  useDeleteProductVariantMutation
} = productApi; 