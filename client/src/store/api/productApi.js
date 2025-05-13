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
        // Add debug logging to see the raw API response
        console.log('API Response Meta:', response?.data?.meta || 'No meta data');
        console.log('Total Products:', response?.data?.meta?.totalItems || 'Unknown');
        console.log('Current Products:', Array.isArray(response?.data?.items) ? response.data.items.length : 'Not an array');
        
        // Log a sample of the first product to understand structure
        if (response?.data?.items && response.data.items.length > 0) {
          console.log('First Product Structure:', response.data.items[0]);
          console.log('Images property:', response.data.items[0].Images || response.data.items[0].images || []);
        }
        
        // Check if response is successful and contains data in the expected format
        if (response && response.success === true) {
          // Server returns data in a structure with 'data.items' and 'data.meta'
          if (response.data) {
            const { items = [], meta = {} } = response.data;
            
            // Processar cada item para garantir que a estrutura de dados seja consistente
            const processedItems = Array.isArray(items) 
              ? items.map(item => {
                  // Garantir que Images está disponível e formatado corretamente
                  if (!item.Images && item.images) {
                    item.Images = item.images; // Padronizar com I maiúsculo
                  } else if (!item.Images) {
                    item.Images = []; // Garantir que pelo menos existe um array vazio
                  }
                  
                  // Se Images está vazio, mas temos uma URL direta, criar um objeto de imagem
                  if (item.Images.length === 0) {
                    // Check different possible image URL sources
                    if (item.image_url) {
                      item.Images.push({
                        id: `default-${item.id}-1`,
                        url: item.image_url,
                        is_main: true
                      });
                    }
                    
                    if (item.url && typeof item.url === 'string' && item.url.match(/\.(jpeg|jpg|gif|png)$/i)) {
                      item.Images.push({
                        id: `default-${item.id}-2`,
                        url: item.url,
                        is_main: !item.Images.length // Only set as main if no other image exists
                      });
                    }
                    
                    if (item.imageUrl) {
                      item.Images.push({
                        id: `default-${item.id}-3`,
                        url: item.imageUrl,
                        is_main: !item.Images.length // Only set as main if no other image exists
                      });
                    }
                  }
                  
                  // Padronizar preço e outras propriedades importantes
                  if (!item.price && item.variants && item.variants.length > 0 && 
                      item.variants[0].prices && item.variants[0].prices.length > 0) {
                    item.price = item.variants[0].prices[0].gross_price;
                  }
                  
                  return item;
                })
              : [items].filter(Boolean).map(item => {
                  // Mesmo processamento para o caso de item único
                  if (!item.Images && item.images) {
                    item.Images = item.images;
                  } else if (!item.Images) {
                    item.Images = [];
                  }
                  
                  // Se Images está vazio, mas temos uma URL direta, criar um objeto de imagem
                  if (item.Images.length === 0) {
                    // Check different possible image URL sources
                    if (item.image_url) {
                      item.Images.push({
                        id: `default-${item.id}-1`,
                        url: item.image_url,
                        is_main: true
                      });
                    }
                    
                    if (item.url && typeof item.url === 'string' && item.url.match(/\.(jpeg|jpg|gif|png)$/i)) {
                      item.Images.push({
                        id: `default-${item.id}-2`,
                        url: item.url,
                        is_main: !item.Images.length // Only set as main if no other image exists
                      });
                    }
                    
                    if (item.imageUrl) {
                      item.Images.push({
                        id: `default-${item.id}-3`,
                        url: item.imageUrl,
                        is_main: !item.Images.length // Only set as main if no other image exists
                      });
                    }
                  }
                  
                  return item;
                });
                
            return {
              data: {
                items: processedItems,
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
        // Add debug logging for individual product
        console.log('API Product Response:', response?.success, response?.product ? 'Product found' : 'No product');
        
        if (response && response.success === true && response.product) {
          // Processar produto para garantir estrutura consistente
          const product = response.product;
          console.log('Raw product data:', product);
          
          // Garantir que Images está disponível e formatado corretamente
          if (!product.Images && product.images) {
            product.Images = product.images; // Padronizar com I maiúsculo
          } else if (!product.Images) {
            product.Images = []; // Garantir que pelo menos existe um array vazio
          }
          
          // Se Images está vazio, mas temos uma URL direta, criar um objeto de imagem
          if (product.Images.length === 0) {
            // Check different possible image URL sources
            if (product.image_url) {
              product.Images.push({
                id: `default-${product.id}-1`,
                url: product.image_url,
                is_main: true
              });
            }
            
            if (product.url && typeof product.url === 'string' && product.url.match(/\.(jpeg|jpg|gif|png)$/i)) {
              product.Images.push({
                id: `default-${product.id}-2`,
                url: product.url,
                is_main: !product.Images.length // Only set as main if no other image exists
              });
            }
            
            if (product.imageUrl) {
              product.Images.push({
                id: `default-${product.id}-3`,
                url: product.imageUrl,
                is_main: !product.Images.length // Only set as main if no other image exists
              });
            }
            
            // If we still don't have images, check other fields that might have image information
            if (product.Images.length === 0 && product.category_id) {
              // Add a placeholder based on category
              const categoryId = product.category_id.toLowerCase();
              let placeholderUrl = '/assets/placeholder-product.png';
              
              if (categoryId.includes('hydraulic')) {
                placeholderUrl = '/assets/icons/category-hydraulic.png';
              } else if (categoryId.includes('electric')) {
                placeholderUrl = '/assets/icons/category-electric.png';
              } else if (categoryId.includes('tools')) {
                placeholderUrl = '/assets/icons/category-tools.png';
              }
              
              product.Images.push({
                id: `placeholder-${product.id}`,
                url: placeholderUrl,
                is_main: true
              });
            }
          }
          
          // Padronizar preço e outras propriedades importantes
          if (!product.price && product.variants && product.variants.length > 0 && 
              product.variants[0].prices && product.variants[0].prices.length > 0) {
            product.price = product.variants[0].prices[0].gross_price;
          }
          
          console.log('Processed product data:', product);
          return product;
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