import { createSlice } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';

// Initialize state from localStorage if available
const getInitialState = () => {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const sessionExpiry = localStorage.getItem('sessionExpiry');
  
  return {
    user: user ? JSON.parse(user) : null,
    token: token || null,
    sessionExpiry: sessionExpiry ? parseInt(sessionExpiry, 10) : null,
    isLoading: false,
    error: null
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      
      // Set session expiry time (30 minutes from now by default)
      const sessionDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
      const expiry = Date.now() + sessionDuration;
      
      // Update state
      state.user = user;
      state.token = token;
      state.sessionExpiry = expiry;
      state.error = null;
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('sessionExpiry', expiry.toString());
    },
    
    refreshSession: (state) => {
      // Extend session for another 30 minutes
      const sessionDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
      const expiry = Date.now() + sessionDuration;
      
      // Update state
      state.sessionExpiry = expiry;
      
      // Update localStorage
      localStorage.setItem('sessionExpiry', expiry.toString());
    },
    
    logout: (state) => {
      // Clear state
      state.user = null;
      state.token = null;
      state.sessionExpiry = null;
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('sessionExpiry');
    },
    
    setSessionError: (state, action) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle login success through API
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          // Only set if not requiring 2FA
          if (payload.data && !payload.data.requireTwoFactor) {
            const { user, accessToken } = payload.data;
            
            // Set session expiry time (30 minutes from now by default)
            const sessionDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
            const expiry = Date.now() + sessionDuration;
            
            // Update state
            state.user = user;
            state.token = accessToken;
            state.sessionExpiry = expiry;
            state.error = null;
            
            // Store in localStorage
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', accessToken);
            localStorage.setItem('sessionExpiry', expiry.toString());
          }
        }
      )
      // Handle 2FA validation success
      .addMatcher(
        authApi.endpoints.validate2FA.matchFulfilled,
        (state, { payload }) => {
          const { user, accessToken } = payload.data;
          
          // Set session expiry time (30 minutes from now by default)
          const sessionDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
          const expiry = Date.now() + sessionDuration;
          
          // Update state
          state.user = user;
          state.token = accessToken;
          state.sessionExpiry = expiry;
          state.error = null;
          
          // Store in localStorage
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', accessToken);
          localStorage.setItem('sessionExpiry', expiry.toString());
        }
      );
  }
});

export const { setCredentials, refreshSession, logout, setSessionError } = authSlice.actions;

// Session expiry selector
export const selectSessionExpiry = (state) => state.auth.sessionExpiry;

// Is authenticated selector
export const selectIsAuthenticated = (state) => !!state.auth.token && !!state.auth.user;

// Is admin selector
export const selectIsAdmin = (state) => {
  if (!state.auth.user) return false;
  return state.auth.user.role === 'admin';
};

// Current user selector
export const selectCurrentUser = (state) => state.auth.user;

export default authSlice.reducer; 