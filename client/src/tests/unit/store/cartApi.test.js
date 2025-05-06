import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cartApi } from '../../../store/api/cartApi';
import { configureStore } from '@reduxjs/toolkit';

// Create a redux store with the cartApi reducer
const getStore = (preloadedState = {}) => configureStore({
  reducer: {
    [cartApi.reducerPath]: cartApi.reducer,
    auth: (state = { token: null }) => state // Mock auth reducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(cartApi.middleware),
  preloadedState
});

// Mock fetch with absolute URLs
global.fetch = vi.fn();

// Set up a base URL for tests
const BASE_URL = 'http://localhost:3000';

// Helper to mock response
const mockFetchResponse = (data) => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  });
};

describe('cartApi', () => {
  let store;
  
  beforeEach(() => {
    // Setup fresh store for each test
    store = getStore();
    // Reset mocks
    global.fetch.mockReset();
  });
  
  describe('getUserCart', () => {
    it('should fetch user cart with correct endpoint', async () => {
      const mockCartData = {
        items: [
          { id: 1, product_id: 1, quantity: 2, price: 100 }
        ],
        totalQuantity: 2,
        totalAmount: 200
      };
      
      mockFetchResponse(mockCartData);
      
      // Execute the query
      await store.dispatch(cartApi.endpoints.getUserCart.initiate());
      
      // Check that fetch was called correctly
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/cart/`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object)
        })
      );
    });
    
    it('should include auth token in request headers when available', async () => {
      const mockCartData = { items: [] };
      const authToken = 'test-jwt-token';
      
      // Create store with auth token
      store = getStore({
        auth: { token: authToken }
      });
      
      mockFetchResponse(mockCartData);
      
      // Execute the query
      await store.dispatch(cartApi.endpoints.getUserCart.initiate());
      
      // Check auth header
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: 'Bearer test-jwt-token'
          })
        })
      );
    });
  });
  
  describe('syncCart', () => {
    it('should send cart data to server with correct endpoint and method', async () => {
      const cartData = {
        items: [
          { id: 1, product_id: 1, quantity: 2, price: 100 }
        ]
      };
      
      mockFetchResponse({ success: true });
      
      // Execute the mutation
      await store.dispatch(cartApi.endpoints.syncCart.initiate(cartData));
      
      // Check that fetch was called correctly
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/cart/`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(cartData),
          headers: expect.objectContaining({
            'content-type': 'application/json'
          })
        })
      );
    });
  });
  
  describe('clearCart', () => {
    it('should send request to clear cart with correct endpoint and method', async () => {
      mockFetchResponse({ success: true });
      
      // Execute the mutation
      await store.dispatch(cartApi.endpoints.clearCart.initiate());
      
      // Check that fetch was called correctly
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/cart/`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.any(Object)
        })
      );
    });
  });
  
  describe('addCartItem', () => {
    it('should send item data with correct endpoint and method', async () => {
      const itemData = { product_id: 1, quantity: 2 };
      
      mockFetchResponse({ success: true });
      
      // Execute the mutation
      await store.dispatch(cartApi.endpoints.addCartItem.initiate(itemData));
      
      // Check that fetch was called correctly
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/cart/items`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(itemData),
          headers: expect.objectContaining({
            'content-type': 'application/json'
          })
        })
      );
    });
  });
  
  describe('updateCartItem', () => {
    it('should update cart item with correct endpoint, method and data', async () => {
      const itemId = 5;
      const itemData = { quantity: 3 };
      
      mockFetchResponse({ success: true });
      
      // Execute the mutation
      await store.dispatch(cartApi.endpoints.updateCartItem.initiate({ 
        itemId, 
        ...itemData 
      }));
      
      // Check that fetch was called correctly
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/cart/items/${itemId}`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(itemData),
          headers: expect.objectContaining({
            'content-type': 'application/json'
          })
        })
      );
    });
  });
  
  describe('removeCartItem', () => {
    it('should send request to remove cart item with correct endpoint and method', async () => {
      const itemId = 5;
      
      mockFetchResponse({ success: true });
      
      // Execute the mutation
      await store.dispatch(cartApi.endpoints.removeCartItem.initiate(itemId));
      
      // Check that fetch was called correctly
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/cart/items/${itemId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.any(Object)
        })
      );
    });
  });
}); 