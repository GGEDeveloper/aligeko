import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = '/api/v1';

export const reportApi = createApi({
  reducerPath: 'reportApi',
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
  tagTypes: ['Reports'],
  endpoints: (builder) => ({
    // Sales summary data for dashboard
    getSalesSummary: builder.query({
      query: ({ startDate, endDate }) => `/reports/sales-summary?startDate=${startDate}&endDate=${endDate}`,
      providesTags: ['Reports']
    }),
    
    // Sales by period (daily, weekly, monthly)
    getSalesByPeriod: builder.query({
      query: ({ startDate, endDate, groupBy = 'day' }) => 
        `/reports/sales?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`,
      providesTags: ['Reports']
    }),
    
    // Product performance report
    getProductPerformance: builder.query({
      query: ({ startDate, endDate, limit = 10, sortBy = 'sales', sortOrder = 'desc' }) => 
        `/reports/products?startDate=${startDate}&endDate=${endDate}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      providesTags: ['Reports']
    }),
    
    // Customer analytics
    getCustomerAnalytics: builder.query({
      query: ({ startDate, endDate, segment }) => {
        let url = `/reports/customers?startDate=${startDate}&endDate=${endDate}`;
        if (segment) {
          url += `&segment=${segment}`;
        }
        return url;
      },
      providesTags: ['Reports']
    }),
    
    // Inventory report
    getInventoryReport: builder.query({
      query: ({ lowStockThreshold = 10, outOfStock = true, categoryId }) => {
        let url = `/reports/inventory?lowStockThreshold=${lowStockThreshold}&outOfStock=${outOfStock}`;
        if (categoryId) {
          url += `&categoryId=${categoryId}`;
        }
        return url;
      },
      providesTags: ['Reports']
    }),
    
    // Order status report
    getOrderStatusReport: builder.query({
      query: ({ startDate, endDate }) => 
        `/reports/orders/status?startDate=${startDate}&endDate=${endDate}`,
      providesTags: ['Reports']
    }),
    
    // Export report data
    exportReportData: builder.mutation({
      query: ({ reportType, format, filters }) => ({
        url: `/reports/export/${reportType}`,
        method: 'POST',
        body: { format, ...filters },
        responseHandler: (response) => response.blob(),
      })
    }),
    
    // Scheduled reports
    getScheduledReports: builder.query({
      query: () => `/reports/scheduled`,
      providesTags: ['Reports']
    }),
    
    createScheduledReport: builder.mutation({
      query: (reportData) => ({
        url: `/reports/scheduled`,
        method: 'POST',
        body: reportData
      }),
      invalidatesTags: ['Reports']
    }),
    
    updateScheduledReport: builder.mutation({
      query: ({ id, ...reportData }) => ({
        url: `/reports/scheduled/${id}`,
        method: 'PUT',
        body: reportData
      }),
      invalidatesTags: ['Reports']
    }),
    
    deleteScheduledReport: builder.mutation({
      query: (id) => ({
        url: `/reports/scheduled/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Reports']
    }),
    
    // Custom report builder
    saveCustomReport: builder.mutation({
      query: (reportConfig) => ({
        url: `/reports/custom`,
        method: 'POST',
        body: reportConfig
      }),
      invalidatesTags: ['Reports']
    }),
    
    getCustomReports: builder.query({
      query: () => `/reports/custom`,
      providesTags: ['Reports']
    }),
    
    getCustomReportById: builder.query({
      query: (id) => `/reports/custom/${id}`,
      providesTags: (result, error, id) => [{ type: 'Reports', id }]
    }),
    
    updateCustomReport: builder.mutation({
      query: ({ id, ...reportConfig }) => ({
        url: `/reports/custom/${id}`,
        method: 'PUT',
        body: reportConfig
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Reports', id }]
    }),
    
    deleteCustomReport: builder.mutation({
      query: (id) => ({
        url: `/reports/custom/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Reports']
    }),
    
    runCustomReport: builder.query({
      query: ({ id, parameters }) => {
        const queryParams = new URLSearchParams();
        
        // Add parameters to query string
        if (parameters) {
          Object.entries(parameters).forEach(([key, value]) => {
            queryParams.append(key, value);
          });
        }
        
        return `/reports/custom/${id}/run?${queryParams.toString()}`;
      },
      providesTags: (result, error, { id }) => [{ type: 'Reports', id }]
    })
  })
});

export const {
  useGetSalesSummaryQuery,
  useGetSalesByPeriodQuery,
  useGetProductPerformanceQuery,
  useGetCustomerAnalyticsQuery,
  useGetInventoryReportQuery,
  useGetOrderStatusReportQuery,
  useExportReportDataMutation,
  useGetScheduledReportsQuery,
  useCreateScheduledReportMutation,
  useUpdateScheduledReportMutation,
  useDeleteScheduledReportMutation,
  useSaveCustomReportMutation,
  useGetCustomReportsQuery,
  useGetCustomReportByIdQuery,
  useUpdateCustomReportMutation,
  useDeleteCustomReportMutation,
  useRunCustomReportQuery
} = reportApi; 