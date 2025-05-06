import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/v1';

export const orderApi = createApi({
  reducerPath: 'orderApi',
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
  tagTypes: ['Orders', 'Order', 'Invoices', 'Returns'],
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: (params = {}) => {
        // Construct query params
        const queryParams = new URLSearchParams();
        
        // Add pagination params if they exist
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        
        // Add filter params if they exist
        if (params.status) queryParams.append('status', params.status);
        if (params.customerId) queryParams.append('customerId', params.customerId);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.minTotal) queryParams.append('minTotal', params.minTotal);
        if (params.maxTotal) queryParams.append('maxTotal', params.maxTotal);
        
        // Add sorting params if they exist
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        
        return {
          url: `/orders?${queryParams.toString()}`,
          method: 'GET'
        };
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.orders.map(({ id }) => ({ type: 'Orders', id })),
              { type: 'Orders', id: 'LIST' }
            ]
          : [{ type: 'Orders', id: 'LIST' }]
    }),
    
    getOrderById: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }]
    }),
    
    getOrderItems: builder.query({
      query: (orderId) => `/orders/${orderId}/items`,
      providesTags: (result, error, orderId) => [
        { type: 'Order', id: `${orderId}-items` }
      ]
    }),
    
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData
      }),
      invalidatesTags: [{ type: 'Orders', id: 'LIST' }]
    }),
    
    updateOrder: builder.mutation({
      query: ({ id, ...orderData }) => ({
        url: `/orders/${id}`,
        method: 'PUT',
        body: orderData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Orders', id: 'LIST' },
        { type: 'Order', id }
      ]
    }),
    
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status }
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Orders', id: 'LIST' },
        { type: 'Order', id }
      ]
    }),
    
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'Orders', id: 'LIST' }]
    }),
    
    addOrderItem: builder.mutation({
      query: ({ orderId, ...itemData }) => ({
        url: `/orders/${orderId}/items`,
        method: 'POST',
        body: itemData
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        { type: 'Order', id: `${orderId}-items` }
      ]
    }),
    
    updateOrderItem: builder.mutation({
      query: ({ orderId, itemId, ...itemData }) => ({
        url: `/orders/${orderId}/items/${itemId}`,
        method: 'PUT',
        body: itemData
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        { type: 'Order', id: `${orderId}-items` }
      ]
    }),
    
    removeOrderItem: builder.mutation({
      query: ({ orderId, itemId }) => ({
        url: `/orders/${orderId}/items/${itemId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        { type: 'Order', id: `${orderId}-items` }
      ]
    }),
    
    createShipment: builder.mutation({
      query: ({ orderId, ...shipmentData }) => ({
        url: `/orders/${orderId}/shipments`,
        method: 'POST',
        body: shipmentData
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId }
      ]
    }),
    
    updateShipment: builder.mutation({
      query: ({ orderId, shipmentId, ...shipmentData }) => ({
        url: `/orders/${orderId}/shipments/${shipmentId}`,
        method: 'PUT',
        body: shipmentData
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId }
      ]
    }),
    
    getOrderShipments: builder.query({
      query: (orderId) => `/orders/${orderId}/shipments`,
      providesTags: (result, error, orderId) => [
        { type: 'Order', id: `${orderId}-shipments` }
      ]
    }),
    
    placeOrder: builder.mutation({
      query: (orderData) => ({
        url: '/',
        method: 'POST',
        body: orderData
      }),
      invalidatesTags: ['Order']
    }),

    cancelOrder: builder.mutation({
      query: (id) => ({
        url: `/${id}/cancel`,
        method: 'POST'
      }),
      invalidatesTags: ['Order']
    }),

    // Invoice endpoints
    getOrderInvoices: builder.query({
      query: (orderId) => `/orders/${orderId}/invoices`,
      providesTags: (result, error, orderId) => [
        { type: 'Invoices', id: `${orderId}-invoices` }
      ]
    }),
    
    generateInvoice: builder.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}/invoices`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, orderId) => [
        { type: 'Invoices', id: `${orderId}-invoices` },
        { type: 'Order', id: orderId }
      ]
    }),
    
    getInvoiceById: builder.query({
      query: ({ orderId, invoiceId }) => `/orders/${orderId}/invoices/${invoiceId}`,
      providesTags: (result, error, { orderId, invoiceId }) => [
        { type: 'Invoices', id: `${orderId}-invoice-${invoiceId}` }
      ]
    }),
    
    deleteInvoice: builder.mutation({
      query: ({ orderId, invoiceId }) => ({
        url: `/orders/${orderId}/invoices/${invoiceId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Invoices', id: `${orderId}-invoices` },
        { type: 'Order', id: orderId }
      ]
    }),
    
    getProducts: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        
        if (params.search) queryParams.append('search', params.search);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.page) queryParams.append('page', params.page);
        
        return {
          url: `/products?${queryParams.toString()}`,
          method: 'GET'
        };
      },
      providesTags: ['Products']
    }),

    // Returns & Refunds endpoints
    getOrderReturns: builder.query({
      query: (orderId) => `/orders/${orderId}/returns`,
      providesTags: (result, error, orderId) => [
        { type: 'Returns', id: `${orderId}-returns` },
        { type: 'Order', id: orderId }
      ]
    }),
    
    getReturnById: builder.query({
      query: ({ orderId, returnId }) => `/orders/${orderId}/returns/${returnId}`,
      providesTags: (result, error, { orderId, returnId }) => [
        { type: 'Returns', id: `${orderId}-return-${returnId}` }
      ]
    }),
    
    createReturnRequest: builder.mutation({
      query: ({ orderId, ...returnData }) => ({
        url: `/orders/${orderId}/returns`,
        method: 'POST',
        body: returnData
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Returns', id: `${orderId}-returns` },
        { type: 'Order', id: orderId }
      ]
    }),
    
    updateReturnStatus: builder.mutation({
      query: ({ orderId, returnId, status }) => ({
        url: `/orders/${orderId}/returns/${returnId}/status`,
        method: 'PATCH',
        body: { status }
      }),
      invalidatesTags: (result, error, { orderId, returnId }) => [
        { type: 'Returns', id: `${orderId}-returns` },
        { type: 'Returns', id: `${orderId}-return-${returnId}` },
        { type: 'Order', id: orderId }
      ]
    }),
    
    issueRefund: builder.mutation({
      query: ({ orderId, ...refundData }) => ({
        url: `/orders/${orderId}/refunds`,
        method: 'POST',
        body: refundData
      }),
      invalidatesTags: (result, error, { orderId, returnId }) => [
        ...(returnId ? [{ type: 'Returns', id: `${orderId}-return-${returnId}` }] : []),
        { type: 'Returns', id: `${orderId}-returns` },
        { type: 'Order', id: orderId },
        { type: 'Orders', id: 'LIST' }
      ]
    }),
    
    getOrderRefunds: builder.query({
      query: (orderId) => `/orders/${orderId}/refunds`,
      providesTags: (result, error, orderId) => [
        { type: 'Order', id: `${orderId}-refunds` }
      ]
    })
  })
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrderItemsQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
  useAddOrderItemMutation,
  useUpdateOrderItemMutation,
  useRemoveOrderItemMutation,
  useCreateShipmentMutation,
  useUpdateShipmentMutation,
  useGetOrderShipmentsQuery,
  usePlaceOrderMutation,
  useCancelOrderMutation,
  useGetOrderInvoicesQuery,
  useGenerateInvoiceMutation,
  useGetInvoiceByIdQuery,
  useDeleteInvoiceMutation,
  useGetProductsQuery,
  useGetOrderReturnsQuery,
  useGetReturnByIdQuery,
  useCreateReturnRequestMutation,
  useUpdateReturnStatusMutation,
  useIssueRefundMutation,
  useGetOrderRefundsQuery
} = orderApi; 