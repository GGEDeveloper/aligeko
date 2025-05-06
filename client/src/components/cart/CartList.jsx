import React from 'react';
import { Alert } from 'react-bootstrap';
import { useCart } from '../../hooks/useCart';
import CartItem from './CartItem';

/**
 * CartList component displays all items in the cart
 * 
 * @param {Object} props
 * @param {boolean} props.compact - Whether to display in compact mode
 * @returns {JSX.Element}
 */
const CartList = ({ compact = false }) => {
  const { cartItems } = useCart();

  if (cartItems.length === 0) {
    return (
      <Alert variant="info">
        Your cart is empty. Add some products to get started!
      </Alert>
    );
  }

  return (
    <div className={compact ? 'mini-cart-list' : 'cart-list'}>
      {cartItems.map((item) => (
        <CartItem 
          key={`${item.id}-${item.variant?.id || 'default'}`} 
          item={item} 
          compact={compact} 
        />
      ))}
    </div>
  );
};

export default CartList; 