import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const producerApi = createApi({
  reducerPath: 'producerApi',
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
  tagTypes: ['Producers'],
  endpoints: (builder) => ({
    getAllProducers: builder.query({
      query: () => '/producers',
      transformResponse: (response) => response.data,
      providesTags: ['Producers']
    }),
    getProducerById: builder.query({
      query: (id) => `/producers/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'Producers', id }]
    }),
    createProducer: builder.mutation({
      query: (producer) => ({
        url: '/producers',
        method: 'POST',
        body: producer,
      }),
      invalidatesTags: ['Producers']
    }),
    updateProducer: builder.mutation({
      query: ({ id, ...producer }) => ({
        url: `/producers/${id}`,
        method: 'PUT',
        body: producer,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Producers', id }, 'Producers']
    }),
    deleteProducer: builder.mutation({
      query: (id) => ({
        url: `/producers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Producers']
    }),
  }),
});

export const {
  useGetAllProducersQuery,
  useGetProducerByIdQuery,
  useCreateProducerMutation,
  useUpdateProducerMutation,
  useDeleteProducerMutation,
} = producerApi; 