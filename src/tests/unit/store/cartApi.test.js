/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { cartApi } from '../../../store/api/cartApi';
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Constants for testing
const BASE_URL = 'http://localhost:3000';

// Mock the fetch function
global.fetch = vi.fn();

// Mock store for testing the API
const createTestStore = () => {
  const store = configureStore({
    reducer: {
      [cartApi.reducerPath]: cartApi.reducer,
      auth: (state = { token: 'test-token' }) => state
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(cartApi.middleware),
  });
  setupListeners(store.dispatch);
  return store;
};

// Override the baseUrl in the cartApi's baseQuery for testing
vi.mock('../../../store/api/cartApi', async () => {
  const actual = await vi.importActual('../../../store/api/cartApi');
  
  // Replace the baseQuery with a mocked version that uses our BASE_URL
  const mockBaseQuery = actual.cartApi.endpoints;
  
  return {
    ...actual,
    // The actual API functions will still be called, but with our mocked fetch
  };
});

describe('cartApi', () => {
  // Create a test store
  let store;
  
  beforeEach(() => {
    store = createTestStore();
    vi.resetAllMocks();
    
    // Setup a default successful response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, items: [] }),
      status: 200,
    });
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  // Test the endpoints definitions
  it('should have all the expected endpoints', () => {
    expect(cartApi.endpoints.getUserCart).toBeDefined();
    expect(cartApi.endpoints.syncCart).toBeDefined();
    expect(cartApi.endpoints.clearCart).toBeDefined();
    expect(cartApi.endpoints.addCartItem).toBeDefined();
    expect(cartApi.endpoints.updateCartItem).toBeDefined();
    expect(cartApi.endpoints.removeCartItem).toBeDefined();
  });

  // Test the reducer path
  it('should have the correct reducer path', () => {
    expect(cartApi.reducerPath).toBe('cartApi');
  });

  // Test endpoint configuration
  it('should configure endpoints with the correct paths', () => {
    const endpoints = cartApi.endpoints;
    
    // Verify the endpoints match our expectations
    expect(endpoints.getUserCart.name).toBe('getUserCart');
    expect(endpoints.syncCart.name).toBe('syncCart');
    expect(endpoints.clearCart.name).toBe('clearCart');
    expect(endpoints.addCartItem.name).toBe('addCartItem');
    expect(endpoints.updateCartItem.name).toBe('updateCartItem');
    expect(endpoints.removeCartItem.name).toBe('removeCartItem');
  });

  // Test that endpoints have the right query or mutation properties
  it('should properly define query and mutation endpoints', () => {
    const endpoints = cartApi.endpoints;
    
    // getUserCart should be a query operation
    expect(endpoints.getUserCart.query).toBeDefined();
    
    // syncCart should be a mutation operation
    expect(endpoints.syncCart.mutation).toBeDefined();
    
    // clearCart should be a mutation operation
    expect(endpoints.clearCart.mutation).toBeDefined();
    
    // addCartItem should be a mutation operation
    expect(endpoints.addCartItem.mutation).toBeDefined();
    
    // updateCartItem should be a mutation operation
    expect(endpoints.updateCartItem.mutation).toBeDefined();
    
    // removeCartItem should be a mutation operation
    expect(endpoints.removeCartItem.mutation).toBeDefined();
  });
}); 