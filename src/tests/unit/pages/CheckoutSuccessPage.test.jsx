/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CheckoutSuccessPage from '../../../pages/user/CheckoutSuccessPage';

// Mocks needed for tests
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn().mockReturnValue({
      state: { orderId: 'order-123', orderNumber: 'ALI-12345678' },
      pathname: '/checkout/success'
    }),
    useNavigate: vi.fn().mockReturnValue(vi.fn())
  };
});

// Mock the API
vi.mock('../../../store/api/orderApi', () => ({
  useGetOrderByIdQuery: vi.fn().mockReturnValue({
    data: {
      id: 'order-123',
      order_number: 'ALI-12345678',
      status: 'pending',
      placed_at: new Date().toISOString(),
      total_amount: 299.99
    },
    isLoading: false,
    error: null
  })
}));

// Mock any other dependencies
vi.mock('react-to-print', () => ({
  useReactToPrint: vi.fn(() => vi.fn()),
}));

// Mock dispatch
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => vi.fn(),
  };
});

// Simple mock for cartSlice
vi.mock('../../../store/slices/cartSlice', () => ({
  clearCart: vi.fn().mockReturnValue({ type: 'cart/clearCart' }),
}));

describe('CheckoutSuccessPage - Basic Tests', () => {
  it('should render without crashing', () => {
    // Set up a simple Redux store
    const store = configureStore({
      reducer: {
        cart: (state = { items: [] }) => state
      }
    });
    
    // Render the component - but don't interact with it yet
    // Skipping because of JSDOM issues in vitest environment
    expect(() => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <CheckoutSuccessPage />
          </BrowserRouter>
        </Provider>
      );
    }).not.toThrow();
  });
}); 