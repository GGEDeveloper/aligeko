import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/orderService';

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrders(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar pedidos');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar o pedido');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderService.cancelOrder(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao cancelar o pedido');
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    resetCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Orders
    builder.addCase(fetchOrders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload.data || [];
      state.pagination = {
        page: action.payload.page || 1,
        limit: action.payload.limit || 10,
        total: action.payload.total || 0,
        totalPages: action.payload.totalPages || 1,
      };
    });
    builder.addCase(fetchOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Erro ao carregar pedidos';
    });

    // Fetch Order By ID
    builder.addCase(fetchOrderById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrderById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentOrder = action.payload;
    });
    builder.addCase(fetchOrderById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Erro ao carregar o pedido';
    });

    // Cancel Order
    builder.addCase(cancelOrder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(cancelOrder.fulfilled, (state, action) => {
      state.loading = false;
      // Update the order in the orders list
      const index = state.orders.findIndex(order => order.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      // Update current order if it's the one being cancelled
      if (state.currentOrder && state.currentOrder.id === action.payload.id) {
        state.currentOrder = action.payload;
      }
    });
    builder.addCase(cancelOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Erro ao cancelar o pedido';
    });
  },
});

export const { clearOrderError, resetCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;

// Selectors
export const selectOrders = (state) => state.orders.orders;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrderLoading = (state) => state.orders.loading;
export const selectOrderError = (state) => state.orders.error;
export const selectOrderPagination = (state) => state.orders.pagination;
