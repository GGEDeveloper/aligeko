import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/v1';

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
        
        // Add pagination params if they exist
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        
        // Add filter params if they exist
        if (params.category) queryParams.append('category', params.category);
        if (params.producer) queryParams.append('producer', params.producer);
        if (params.search) queryParams.append('search', params.search);
        if (params.minPrice) queryParams.append('minPrice', params.minPrice);
        if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
        
        // Add sorting params if they exist
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        
        return {
          url: `/products?${queryParams.toString()}`,
          method: 'GET'
        };
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.products.map(({ id }) => ({ type: 'Products', id })),
              { type: 'Products', id: 'LIST' }
            ]
          : [{ type: 'Products', id: 'LIST' }]
    }),
    
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }]
    }),
    
    createProduct: builder.mutation({
      query: (productData) => ({
        url: '/products',
        method: 'POST',
        body: productData
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }]
    }),
    
    updateProduct: builder.mutation({
      query: ({ id, ...productData }) => ({
        url: `/products/${id}`,
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
        url: `/products/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }]
    }),
    
    // Upload product image
    uploadProductImage: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/products/${id}/images`,
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
        url: `/products/${productId}/images`,
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
        url: `/products/${productId}/images`,
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
        url: `/products/${productId}/images/${imageId}`,
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
        url: `/products/${productId}/images/${imageId}/primary`,
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
        url: '/products/bulk',
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }]
    }),
    
    bulkDeleteProducts: builder.mutation({
      query: (ids) => ({
        url: '/products/bulk',
        method: 'DELETE',
        body: { ids }
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }]
    }),
    
    // Product variants endpoints
    getProductVariants: builder.query({
      query: (productId) => `/products/${productId}/variants`,
      providesTags: (result, error, productId) => [
        { type: 'Product', id: productId },
        { type: 'Product', id: `${productId}-variants` }
      ]
    }),
    
    createProductVariant: builder.mutation({
      query: ({ productId, variantData }) => ({
        url: `/products/${productId}/variants`,
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
        url: `/products/${productId}/variants/${variantId}`,
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
        url: `/products/${productId}/variants/${variantId}`,
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
  useGetProductByIdQuery,
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