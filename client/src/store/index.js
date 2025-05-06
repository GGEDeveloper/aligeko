import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './api/apiSlice';
import { authApi } from './api/authApi';
import { productApi } from './api/productApi';
import { customerApi } from './api/customerApi';
import { orderApi } from './api/orderApi';
import { cartApi } from './api/cartApi';
import { categoryApi } from './api/categoryApi';
import { producerApi } from './api/producerApi';
import { unitApi } from './api/unitApi';
import { attributeApi } from './api/attributeApi';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [producerApi.reducerPath]: producerApi.reducer,
    [unitApi.reducerPath]: unitApi.reducer,
    [attributeApi.reducerPath]: attributeApi.reducer,
    auth: authReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(authApi.middleware)
      .concat(productApi.middleware)
      .concat(customerApi.middleware)
      .concat(orderApi.middleware)
      .concat(cartApi.middleware)
      .concat(categoryApi.middleware)
      .concat(producerApi.middleware)
      .concat(unitApi.middleware)
      .concat(attributeApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch); 