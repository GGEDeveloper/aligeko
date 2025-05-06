import React, { useState } from 'react';
import { useSelector } from 'react-redux';

/**
 * A stub CheckoutFlow component for testing
 */
const CheckoutFlow = () => {
  const [activeStep, setActiveStep] = useState('shipping');
  const cartItems = useSelector(state => state.cart.items);

  const handleNext = () => {
    if (activeStep === 'shipping') {
      setActiveStep('payment');
    } else if (activeStep === 'payment') {
      setActiveStep('review');
    }
  };

  return (
    <div className="checkout-flow">
      <div className="checkout-steps">
        <div className={`step ${activeStep === 'shipping' ? 'active' : ''}`}>
          Shipping Address
        </div>
        <div className={`step ${activeStep === 'payment' ? 'active' : ''}`}>
          Payment Details
        </div>
        <div className={`step ${activeStep === 'review' ? 'active' : ''}`}>
          Review Order
        </div>
      </div>
      
      {activeStep === 'shipping' && (
        <div className="shipping-step">
          <h2>Shipping Address</h2>
          <form>
            <div>
              <label htmlFor="firstName">First Name</label>
              <input id="firstName" type="text" defaultValue="Test" />
            </div>
            <div>
              <label htmlFor="lastName">Last Name</label>
              <input id="lastName" type="text" defaultValue="User" />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" defaultValue="test@example.com" />
            </div>
            <div>
              <label htmlFor="address">Address</label>
              <input id="address" type="text" required />
              {/* This will show validation error when empty */}
              <span className="error">Address is required</span>
            </div>
            <div>
              <label htmlFor="city">City</label>
              <input id="city" type="text" required />
            </div>
            <div>
              <label htmlFor="state">State</label>
              <input id="state" type="text" required />
            </div>
            <div>
              <label htmlFor="postal_code">Postal Code</label>
              <input id="postal_code" type="text" required />
            </div>
            <button type="button" onClick={handleNext}>Next Step</button>
          </form>
        </div>
      )}
      
      {activeStep === 'payment' && (
        <div className="payment-step">
          <h2>Payment Details</h2>
          <div data-testid="card-element">
            {/* Card element will be inserted here by mock */}
          </div>
          <button type="button" onClick={handleNext}>Review Order</button>
        </div>
      )}
      
      <div className="order-summary">
        <h3>Order Summary</h3>
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <span>{item.name}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="cart-total">
          <strong>Total:</strong>
          <span>${useSelector(state => state.cart.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFlow; 