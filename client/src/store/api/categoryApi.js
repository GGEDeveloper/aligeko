import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/v1';

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
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
  tagTypes: ['Categories', 'Category'],
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: (params = {}) => {
        // Construct query params
        const queryParams = new URLSearchParams();
        
        // Add filter params if they exist
        if (params.parentId) queryParams.append('parentId', params.parentId);
        if (params.active !== undefined) queryParams.append('active', params.active.toString());
        
        // Return URL with query params if they exist
        return {
          url: `/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET'
        };
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'Category', id })),
              { type: 'Categories', id: 'LIST' }
            ]
          : [{ type: 'Categories', id: 'LIST' }]
    }),
    
    getCategoryById: builder.query({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }]
    }),
    
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: '/categories',
        method: 'POST',
        body: categoryData
      }),
      invalidatesTags: [{ type: 'Categories', id: 'LIST' }]
    }),
    
    updateCategory: builder.mutation({
      query: ({ id, ...categoryData }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: categoryData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Categories', id: 'LIST' },
        { type: 'Category', id }
      ]
    }),
    
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'Categories', id: 'LIST' }]
    })
  })
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} = categoryApi; 