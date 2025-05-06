import { createSlice } from '@reduxjs/toolkit';
import { safeLocalStorage, safeJsonParse } from '../../utils/storageUtils';

// Get user from local storage
const user = safeJsonParse(safeLocalStorage.getItem('user'), null);
const token = safeLocalStorage.getItem('token') || null;

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
      safeLocalStorage.setItem('user', JSON.stringify(user));
      safeLocalStorage.setItem('token', token);
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      safeLocalStorage.setItem('user', JSON.stringify(state.user));
    },
    logOut: (state) => {
      safeLocalStorage.removeItem('user');
      safeLocalStorage.removeItem('token');
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