import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';

/**
 * CartSummary component shows totals, discounts, and taxes
 * 
 * @param {Object} props
 * @param {boolean} props.compact - Whether to display in compact mode
 * @param {Function} props.onCheckout - Checkout callback function
 * @returns {JSX.Element}
 */
const CartSummary = ({ compact = false, onCheckout }) => {
  const { cartItems, totalAmount } = useCart();
  const { isAuthenticated } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  // Calculate tax (example: 10%)
  const taxRate = 0.1;
  const subtotal = totalAmount;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  
  // Check if cart is empty
  const isCartEmpty = cartItems.length === 0;
  
  const handleCheckout = () => {
    if (onCheckout && typeof onCheckout === 'function') {
      onCheckout();
    } else {
      // If not authenticated, redirect to login first
      if (!isAuthenticated) {
        navigate('/auth/login', { state: { from: '/checkout' } });
        return;
      }
      navigate('/checkout');
    }
  };
  
  if (compact) {
    // Compact version for mini cart
    return (
      <div className="mini-cart-summary border-top pt-2 mt-2">
        <div className="d-flex justify-content-between mb-2">
          <span>Subtotal:</span>
          <span className="fw-bold">{formatCurrency(subtotal)}</span>
        </div>
        <div className="d-grid gap-2">
          <Link to="/cart" className="btn btn-outline-primary btn-sm">
            View Cart
          </Link>
          <Button 
            variant="primary" 
            size="sm" 
            disabled={isCartEmpty}
            onClick={handleCheckout}
          >
            Checkout
          </Button>
        </div>
      </div>
    );
  }
  
  // Full version for cart page
  return (
    <Card>
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">Order Summary</h5>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between mb-2">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>Tax ({(taxRate * 100).toFixed(0)}%):</span>
          <span>{formatCurrency(taxAmount)}</span>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>Shipping:</span>
          <span>Free</span>
        </div>
        
        <hr />
        
        <div className="d-flex justify-content-between mb-3">
          <span className="fw-bold">Total:</span>
          <span className="fw-bold fs-5">{formatCurrency(total)}</span>
        </div>
        
        <div className="d-grid gap-2">
          <Button 
            variant="primary" 
            size="lg" 
            disabled={isCartEmpty}
            onClick={handleCheckout}
          >
            {isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}
          </Button>
          <Link to="/products" className="btn btn-outline-secondary">
            Continue Shopping
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CartSummary; 