import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/v1';

export const customerApi = createApi({
  reducerPath: 'customerApi',
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
  tagTypes: ['Customers', 'Customer'],
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: (params = {}) => {
        // Construct query params
        const queryParams = new URLSearchParams();
        
        // Add pagination params if they exist
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        
        // Add filter params if they exist
        if (params.search) queryParams.append('search', params.search);
        if (params.status) queryParams.append('status', params.status);
        if (params.minOrders) queryParams.append('minOrders', params.minOrders);
        if (params.maxOrders) queryParams.append('maxOrders', params.maxOrders);
        
        // Add sorting params if they exist
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        
        return {
          url: `/customers?${queryParams.toString()}`,
          method: 'GET'
        };
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.customers.map(({ id }) => ({ type: 'Customers', id })),
              { type: 'Customers', id: 'LIST' }
            ]
          : [{ type: 'Customers', id: 'LIST' }]
    }),
    
    getCustomerById: builder.query({
      query: (id) => `/customers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Customer', id }]
    }),
    
    getCustomerAddresses: builder.query({
      query: (customerId) => `/customers/${customerId}/addresses`,
      providesTags: (result, error, customerId) => [
        { type: 'Customer', id: `${customerId}-addresses` }
      ]
    }),
    
    getCustomerOrders: builder.query({
      query: (customerId) => `/customers/${customerId}/orders`,
      providesTags: (result, error, customerId) => [
        { type: 'Customer', id: `${customerId}-orders` }
      ]
    }),
    
    createCustomer: builder.mutation({
      query: (customerData) => ({
        url: '/customers',
        method: 'POST',
        body: customerData
      }),
      invalidatesTags: [{ type: 'Customers', id: 'LIST' }]
    }),
    
    updateCustomer: builder.mutation({
      query: ({ id, ...customerData }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        body: customerData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Customers', id: 'LIST' },
        { type: 'Customer', id }
      ]
    }),
    
    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'Customers', id: 'LIST' }]
    }),
    
    createCustomerAddress: builder.mutation({
      query: ({ customerId, ...addressData }) => ({
        url: `/customers/${customerId}/addresses`,
        method: 'POST',
        body: addressData
      }),
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'Customer', id: customerId },
        { type: 'Customer', id: `${customerId}-addresses` }
      ]
    }),
    
    updateCustomerAddress: builder.mutation({
      query: ({ customerId, addressId, ...addressData }) => ({
        url: `/customers/${customerId}/addresses/${addressId}`,
        method: 'PUT',
        body: addressData
      }),
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'Customer', id: customerId },
        { type: 'Customer', id: `${customerId}-addresses` }
      ]
    }),
    
    deleteCustomerAddress: builder.mutation({
      query: ({ customerId, addressId }) => ({
        url: `/customers/${customerId}/addresses/${addressId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'Customer', id: customerId },
        { type: 'Customer', id: `${customerId}-addresses` }
      ]
    })
  })
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useGetCustomerAddressesQuery,
  useGetCustomerOrdersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useCreateCustomerAddressMutation,
  useUpdateCustomerAddressMutation,
  useDeleteCustomerAddressMutation
} = customerApi; 