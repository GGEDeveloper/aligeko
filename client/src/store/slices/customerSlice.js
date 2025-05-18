import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchCustomerProfile = createAsyncThunk(
  'customer/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/customers/${userId}/profile`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateCustomerProfile = createAsyncThunk(
  'customer/updateProfile',
  async ({ userId, profileData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/customers/${userId}/profile`, profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'customer/fetchOrders',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await api.get(`/api/customers/${auth.user.id}/orders`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

const initialState = {
  profile: null,
  orders: [],
  addresses: [],
  wishlist: [],
  loading: false,
  error: null,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearCustomerData: (state) => {
      state.profile = null;
      state.orders = [];
      state.addresses = [];
      state.wishlist = [];
      state.error = null;
    },
    addToWishlist: (state, action) => {
      if (!state.wishlist.some(item => item.id === action.payload.id)) {
        state.wishlist.push(action.payload);
      }
    },
    removeFromWishlist: (state, action) => {
      state.wishlist = state.wishlist.filter(item => item.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder.addCase(fetchCustomerProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCustomerProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload;
    });
    builder.addCase(fetchCustomerProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update Profile
    builder.addCase(updateCustomerProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCustomerProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = { ...state.profile, ...action.payload };
    });
    builder.addCase(updateCustomerProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Orders
    builder.addCase(fetchOrders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload;
    });
    builder.addCase(fetchOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { clearCustomerData, addToWishlist, removeFromWishlist } = customerSlice.actions;
export default customerSlice.reducer;
