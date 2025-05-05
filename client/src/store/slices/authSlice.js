import { createSlice } from '@reduxjs/toolkit';

// Get user from local storage
const user = localStorage.getItem('user') 
  ? JSON.parse(localStorage.getItem('user')) 
  : null;
  
const token = localStorage.getItem('token') || null;

const initialState = {
  user,
  token,
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    logOut: (state) => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, updateUser, logOut } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated; 