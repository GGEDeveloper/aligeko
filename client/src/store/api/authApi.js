import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { appendCSRFToken } from '../../utils/csrf';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    // Updated to match backend API prefix
  baseUrl: '/api/v1/auth',
    prepareHeaders: (headers, { getState }) => {
      // Get the token from the auth state
      const token = getState().auth.token;
      
      // If we have a token, set the Authorization header
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      // Add CSRF token header for non-GET requests
      const method = headers.get('X-Method') || 'GET';
      if (method !== 'GET') {
        const csrfHeaders = appendCSRFToken();
        for (const [key, value] of Object.entries(csrfHeaders)) {
          headers.set(key, value);
        }
      }
      
      return headers;
    },
    credentials: 'include', // Include cookies in requests
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    validate2FA: builder.mutation({
      query: (data) => ({
        url: '/validate-2fa',
        method: 'POST',
        body: data,
      }),
    }),
    
    register: builder.mutation({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        body: userData,
      }),
    }),
    
    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
    }),
    
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: '/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),
    
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    
    refreshToken: builder.mutation({
      query: () => ({
        url: '/refresh-token',
        method: 'POST',
      }),
    }),
    
    // 2FA endpoints DISABLED for MVP (AliGeko MVP: 2FA temporarily disabled)
    // get2FAStatus: builder.query({
    //   query: () => '/api/v1/auth/2fa/status', // Updated endpoint URL
    // }),
    // setup2FA: builder.mutation({
    //   query: () => ({
    //     url: '/api/v1/auth/2fa/setup', // Updated endpoint URL
    //     method: 'POST',
    //   }),
    // }),
    // verify2FA: builder.mutation({
    //   query: (code) => ({
    //     url: '/api/v1/auth/2fa/verify', // Updated endpoint URL
    //     method: 'POST',
    //     body: { code },
    //   }),
    // }),
    // disable2FA: builder.mutation({
    //   query: (code) => ({
    //     url: '/2fa/disable',
    //     method: 'POST',
    //     body: { code },
    //   }),
    // }),
  }),
});

// 2FA hooks temporarily disabled for MVP (AliGeko MVP)
export const {
  useLoginMutation,
  useValidate2FAMutation,
  useRegisterMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
  // useGet2FAStatusQuery,
  // useSetup2FAMutation,
  // useVerify2FAMutation,
  // useDisable2FAMutation,
} = authApi; 