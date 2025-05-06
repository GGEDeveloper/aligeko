import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import CheckoutFlow from '../../components/checkout/CheckoutFlow';
import cartReducer from '../../store/slices/cartSlice';
import authReducer from '../../store/slices/authSlice';
import { cartApi } from '../../store/api/cartApi';
import { orderApi } from '../../store/api/orderApi';

// Setup mock DOM environment
if (typeof window === 'undefined') {
  global.window = {
    location: {
      pathname: '/checkout',
      replace: vi.fn()
    },
    scrollTo: vi.fn()
  };
}

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();
window.localStorage = localStorageMock;

// Mock stripe.js
vi.mock('@stripe/react-stripe-js', () => ({
  useStripe: () => ({
    createPaymentMethod: vi.fn().mockResolvedValue({
      paymentMethod: { id: 'pm_test_123' },
      error: null
    }),
    confirmCardPayment: vi.fn().mockResolvedValue({ paymentIntent: { status: 'succeeded' } })
  }),
  useElements: () => ({
    getElement: vi.fn().mockReturnValue({})
  }),
  CardElement: () => <div data-testid="card-element">Card Element</div>
}));

// Mock navigator.geolocation
global.navigator.geolocation = {
  getCurrentPosition: vi.fn().mockImplementation(success => success({
    coords: {
      latitude: 40.7128,
      longitude: -74.0060
    }
  }))
};

// Mock API responses
vi.mock('../../store/api/cartApi', () => ({
  cartApi: {
    reducerPath: 'cartApi',
    reducer: (state = {}) => state,
    middleware: () => next => action => next(action),
    endpoints: {
      getUserCart: {
        initiate: vi.fn()
      },
      syncCart: {
        initiate: vi.fn().mockResolvedValue({ data: { success: true }})
      }
    }
  }
}));

vi.mock('../../store/api/orderApi', () => ({
  orderApi: {
    reducerPath: 'orderApi',
    reducer: (state = {}) => state,
    middleware: () => next => action => next(action),
    endpoints: {
      createOrder: {
        initiate: vi.fn().mockResolvedValue({ 
          data: { 
            id: 123, 
            order_number: 'TEST-12345' 
          } 
        })
      }
    }
  }
}));

// Helper to mock address autocomplete
vi.mock('../../hooks/useAddressAutocomplete', () => ({
  default: () => ({
    addresses: [
      {
        formatted_address: '123 Main St, New York, NY 10001, USA',
        place_id: 'ChIJrTLr-3u8woARo4-2FWSjcQU'
      }
    ],
    loading: false,
    error: null,
    searchAddresses: vi.fn(),
    getAddressDetails: vi.fn().mockResolvedValue({
      street: '123 Main St',
      street2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'USA'
    })
  })
}));

describe('Checkout Flow Integration', () => {
  let store;
  
  beforeEach(() => {
    // Initialize Redux store with test state
    store = configureStore({
      reducer: {
        cart: cartReducer,
        auth: authReducer,
        [cartApi.reducerPath]: cartApi.reducer,
        [orderApi.reducerPath]: orderApi.reducer
      },
      middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat([
          cartApi.middleware,
          orderApi.middleware
        ]),
      preloadedState: {
        cart: {
          items: [
            { id: 1, product_id: 101, name: 'Test Product', quantity: 2, price: 49.99, image: 'test.jpg' },
            { id: 2, product_id: 102, name: 'Another Item', quantity: 1, price: 29.99, image: 'test2.jpg' }
          ],
          totalItems: 3,
          totalAmount: 129.97
        },
        auth: {
          user: {
            id: 1,
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User'
          },
          token: 'test-token'
        }
      }
    });
    
    vi.clearAllMocks();
  });
  
  const renderCheckoutFlow = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <CheckoutFlow />
        </BrowserRouter>
      </Provider>
    );
  };
  
  it('should render the checkout steps', () => {
    renderCheckoutFlow();
    
    // Check that initial shipping step is active
    expect(screen.getByText(/shipping address/i)).toBeInTheDocument();
  });
  
  it('should populate shipping form with user data', () => {
    renderCheckoutFlow();
    
    // Should pre-fill user info
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    
    expect(firstNameInput.value).toBe('Test');
    expect(lastNameInput.value).toBe('User');
    expect(emailInput.value).toBe('test@example.com');
  });
  
  it('should show error for required fields in shipping form', async () => {
    renderCheckoutFlow();
    
    // Clear a required field
    const addressInput = screen.getByLabelText(/address/i);
    fireEvent.change(addressInput, { target: { value: '' } });
    
    // Try to proceed
    const nextButton = screen.getByText(/next step/i);
    fireEvent.click(nextButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/address is required/i)).toBeInTheDocument();
    });
  });
  
  it('should proceed to payment step after shipping form completion', async () => {
    renderCheckoutFlow();
    
    // Fill shipping form
    const addressInput = screen.getByLabelText(/address/i);
    const cityInput = screen.getByLabelText(/city/i);
    const stateInput = screen.getByLabelText(/state/i);
    const zipInput = screen.getByLabelText(/postal code/i);
    
    fireEvent.change(addressInput, { target: { value: '123 Main St' } });
    fireEvent.change(cityInput, { target: { value: 'New York' } });
    fireEvent.change(stateInput, { target: { value: 'NY' } });
    fireEvent.change(zipInput, { target: { value: '10001' } });
    
    // Proceed to next step
    const nextButton = screen.getByText(/next step/i);
    fireEvent.click(nextButton);
    
    // Should now be on payment step
    await waitFor(() => {
      expect(screen.getByText(/payment details/i)).toBeInTheDocument();
    });
  });
  
  it('should display order summary throughout checkout', () => {
    renderCheckoutFlow();
    
    // Should show products and totals
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Another Item')).toBeInTheDocument();
    expect(screen.getByText('$129.97')).toBeInTheDocument(); // Total
  });
  
  // Note: Full payment submission would require more complex mocks
  // This test is kept simple to focus on navigation between steps
}); 