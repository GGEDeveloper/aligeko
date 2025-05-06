import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const unitApi = createApi({
  reducerPath: 'unitApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      // Get the token from auth state
      const token = getState().auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Units'],
  endpoints: (builder) => ({
    getAllUnits: builder.query({
      query: () => '/units',
      transformResponse: (response) => response.data,
      providesTags: ['Units']
    }),
    getUnitById: builder.query({
      query: (id) => `/units/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'Units', id }]
    }),
    createUnit: builder.mutation({
      query: (unit) => ({
        url: '/units',
        method: 'POST',
        body: unit,
      }),
      invalidatesTags: ['Units']
    }),
    updateUnit: builder.mutation({
      query: ({ id, ...unit }) => ({
        url: `/units/${id}`,
        method: 'PUT',
        body: unit,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Units', id }, 'Units']
    }),
    deleteUnit: builder.mutation({
      query: (id) => ({
        url: `/units/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Units']
    }),
  }),
});

export const {
  useGetAllUnitsQuery,
  useGetUnitByIdQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
} = unitApi; 