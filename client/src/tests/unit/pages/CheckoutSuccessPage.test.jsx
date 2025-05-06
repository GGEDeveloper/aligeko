import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CheckoutSuccessPage from '../../../pages/user/CheckoutSuccessPage';

// Setup mock DOM environment
if (typeof window === 'undefined') {
  global.window = {};
}

// Mock necessary hooks and modules
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

vi.mock('react-to-print', () => ({
  useReactToPrint: vi.fn(() => vi.fn()),
}));

vi.mock('../../../store/api/orderApi', () => ({
  useGetOrderByIdQuery: vi.fn().mockReturnValue({
    data: {
      id: 123,
      order_number: 'ALI-12345678',
      status: 'pending',
      placed_at: '2025-05-01T12:00:00Z',
      estimated_delivery: '2025-05-09T12:00:00Z',
      total_amount: 299.99,
      subtotal: 270.00,
      tax_amount: 19.99,
      shipping_amount: 10.00,
      shipping_address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        postal_code: '12345',
        country: 'Testland'
      },
      items: [
        { 
          id: 1, 
          product: { 
            name: 'Test Product',
            image: 'test.jpg'
          }, 
          quantity: 2, 
          unit_price: 99.99, 
          total_price: 199.98 
        },
        { 
          id: 2, 
          product: { 
            name: 'Another Product',
            image: 'another.jpg'
          }, 
          quantity: 1, 
          unit_price: 70.02, 
          total_price: 70.02 
        }
      ],
      payment: {
        method: 'credit_card',
        card_last4: '1234',
        status: 'complete'
      }
    },
    isLoading: false,
    error: null
  })
}));

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => vi.fn(),
  };
});

describe('CheckoutSuccessPage', () => {
  const defaultLocationState = {
    orderId: 123,
    orderNumber: 'ALI-12345678'
  };
  
  beforeEach(() => {
    // Get the mocked function reference without TypeScript syntax
    const useLocationMock = useLocation;
    useLocationMock.mockReturnValue({
      state: defaultLocationState,
      pathname: '/checkout/success'
    });
    
    vi.clearAllMocks();
  });
  
  const renderWithProviders = (locationState = defaultLocationState) => {
    // Get the mocked function reference without TypeScript syntax
    const useLocationMock = useLocation;
    useLocationMock.mockReturnValue({
      state: locationState,
      pathname: '/checkout/success'
    });
    
    const store = configureStore({
      reducer: {
        cart: (state = { items: [] }) => state
      }
    });
    
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <CheckoutSuccessPage />
        </BrowserRouter>
      </Provider>
    );
  };
  
  it('should display order details and confirmation message', () => {
    renderWithProviders();
    
    // Check that confirmation message is shown
    expect(screen.getByText(/thank you for your order/i)).toBeInTheDocument();
    expect(screen.getByText(/ALI-12345678/)).toBeInTheDocument();
    
    // Check order details
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Another Product')).toBeInTheDocument();
    expect(screen.getByText('$299.99')).toBeInTheDocument(); // Total amount
  });
  
  it('should display order tracking information', () => {
    renderWithProviders();
    
    // Check for tracking info
    expect(screen.getByText(/order status/i)).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
    expect(screen.getByText(/estimated delivery/i)).toBeInTheDocument();
    
    // Check delivery date format (will depend on how you format dates)
    const dateTexts = screen.getAllByText(/may \d+, 2025/i);
    expect(dateTexts.length).toBeGreaterThan(0);
  });
  
  it('should display shipping address', () => {
    renderWithProviders();
    
    // Check shipping address details
    expect(screen.getByText(/shipping address/i)).toBeInTheDocument();
    expect(screen.getByText(/123 test st/i)).toBeInTheDocument();
    expect(screen.getByText(/test city/i)).toBeInTheDocument();
    expect(screen.getByText(/testland/i)).toBeInTheDocument();
  });
  
  it('should display payment information', () => {
    renderWithProviders();
    
    // Check payment method is displayed
    expect(screen.getByText(/payment method/i)).toBeInTheDocument();
    expect(screen.getByText(/credit card/i)).toBeInTheDocument();
    expect(screen.getByText(/ending in 1234/i)).toBeInTheDocument();
  });
  
  it('should have a print receipt button', () => {
    renderWithProviders();
    
    // Check print button exists
    const printButton = screen.getByText(/print receipt/i);
    expect(printButton).toBeInTheDocument();
  });
  
  it('should show order price breakdown', () => {
    renderWithProviders();
    
    // Check for subtotal, tax, shipping, and total
    expect(screen.getByText(/subtotal/i)).toBeInTheDocument();
    expect(screen.getByText('$270.00')).toBeInTheDocument(); // Subtotal
    expect(screen.getByText(/tax/i)).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument(); // Tax
    expect(screen.getByText(/shipping/i)).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument(); // Shipping
  });
  
  it('should redirect to home if no order ID is provided', () => {
    // Render with no location state
    renderWithProviders(null);
    
    // Should show a message about invalid order
    expect(screen.getByText(/invalid order/i)).toBeInTheDocument();
    expect(screen.getByText(/return to home/i)).toBeInTheDocument();
  });
  
  it('should have continue shopping button', () => {
    renderWithProviders();
    
    const continueShoppingBtn = screen.getByText(/continue shopping/i);
    expect(continueShoppingBtn).toBeInTheDocument();
    expect(continueShoppingBtn.closest('a')).toHaveAttribute('href', '/');
  });
}); 