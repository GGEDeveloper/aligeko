import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = '/api/v1';

export const attributeApi = createApi({
  reducerPath: 'attributeApi',
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
  tagTypes: ['Attributes', 'AttributeGroups'],
  endpoints: (builder) => ({
    // Attribute Groups
    getAttributeGroups: builder.query({
      query: () => '/product-attributes/groups',
      providesTags: ['AttributeGroups']
    }),
    
    getAttributeGroupById: builder.query({
      query: (id) => `/product-attributes/groups/${id}`,
      providesTags: (result, error, id) => [{ type: 'AttributeGroups', id }]
    }),
    
    createAttributeGroup: builder.mutation({
      query: (group) => ({
        url: '/product-attributes/groups',
        method: 'POST',
        body: group
      }),
      invalidatesTags: ['AttributeGroups']
    }),
    
    updateAttributeGroup: builder.mutation({
      query: ({ id, ...group }) => ({
        url: `/product-attributes/groups/${id}`,
        method: 'PUT',
        body: group
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'AttributeGroups', id },
        'AttributeGroups'
      ]
    }),
    
    deleteAttributeGroup: builder.mutation({
      query: (id) => ({
        url: `/product-attributes/groups/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['AttributeGroups']
    }),
    
    // Attributes
    getAttributes: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        
        if (params.groupId) queryParams.append('groupId', params.groupId);
        if (params.search) queryParams.append('search', params.search);
        
        return {
          url: `/product-attributes?${queryParams.toString()}`,
          method: 'GET'
        };
      },
      providesTags: ['Attributes']
    }),
    
    getAttributeById: builder.query({
      query: (id) => `/product-attributes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Attributes', id }]
    }),
    
    createAttribute: builder.mutation({
      query: (attribute) => ({
        url: '/product-attributes',
        method: 'POST',
        body: attribute
      }),
      invalidatesTags: ['Attributes']
    }),
    
    updateAttribute: builder.mutation({
      query: ({ id, ...attribute }) => ({
        url: `/product-attributes/${id}`,
        method: 'PUT',
        body: attribute
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Attributes', id },
        'Attributes'
      ]
    }),
    
    deleteAttribute: builder.mutation({
      query: (id) => ({
        url: `/product-attributes/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Attributes']
    }),
    
    // Attribute Values
    getAttributeValues: builder.query({
      query: (attributeId) => `/product-attributes/${attributeId}/values`,
      providesTags: (result, error, attributeId) => [
        { type: 'Attributes', id: `${attributeId}-values` }
      ]
    }),
    
    addAttributeValue: builder.mutation({
      query: ({ attributeId, ...value }) => ({
        url: `/product-attributes/${attributeId}/values`,
        method: 'POST',
        body: value
      }),
      invalidatesTags: (result, error, { attributeId }) => [
        { type: 'Attributes', id: `${attributeId}-values` },
        { type: 'Attributes', id: attributeId },
        'Attributes'
      ]
    }),
    
    updateAttributeValue: builder.mutation({
      query: ({ attributeId, valueId, ...value }) => ({
        url: `/product-attributes/${attributeId}/values/${valueId}`,
        method: 'PUT',
        body: value
      }),
      invalidatesTags: (result, error, { attributeId }) => [
        { type: 'Attributes', id: `${attributeId}-values` },
        { type: 'Attributes', id: attributeId },
        'Attributes'
      ]
    }),
    
    deleteAttributeValue: builder.mutation({
      query: ({ attributeId, valueId }) => ({
        url: `/product-attributes/${attributeId}/values/${valueId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { attributeId }) => [
        { type: 'Attributes', id: `${attributeId}-values` },
        { type: 'Attributes', id: attributeId },
        'Attributes'
      ]
    })
  })
});

export const {
  useGetAttributeGroupsQuery,
  useGetAttributeGroupByIdQuery,
  useCreateAttributeGroupMutation,
  useUpdateAttributeGroupMutation,
  useDeleteAttributeGroupMutation,
  useGetAttributesQuery,
  useGetAttributeByIdQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
  useGetAttributeValuesQuery,
  useAddAttributeValueMutation,
  useUpdateAttributeValueMutation,
  useDeleteAttributeValueMutation
} = attributeApi; 