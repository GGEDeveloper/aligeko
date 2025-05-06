import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

/**
 * CustomToast component for cart notifications
 * 
 * @param {Object} props
 * @param {Object} props.product - Product data
 * @param {number} props.quantity - Quantity added
 * @param {Object} props.variant - Optional variant data
 * @returns {JSX.Element}
 */
const AddToCartNotification = ({ product, quantity, variant }) => {
  if (!product) return null;
  
  const productName = product.name;
  const productImage = product.image || 
    (product.Images && product.Images.length > 0 ? product.Images[0].url : '/placeholder-product.png');
  
  const price = variant ? variant.price : (product.price || 0);
  const totalPrice = price * quantity;
  
  return (
    <div className="flex items-start" style={{ minWidth: '280px', maxWidth: '320px' }}>
      <div className="flex-shrink-0 mr-3">
        <img 
          src={productImage} 
          alt={productName}
          className="w-16 h-16 object-cover rounded"
        />
      </div>
      <div className="flex-grow">
        <h4 className="text-sm font-medium mb-1 text-truncate">{productName}</h4>
        {variant && (
          <p className="text-xs text-gray-500 mb-1">
            Variant: {variant.name || variant.code}
          </p>
        )}
        <p className="text-xs text-gray-500 mb-2">
          {quantity} × {formatCurrency(price)} = {formatCurrency(totalPrice)}
        </p>
        <div className="flex gap-2">
          <Link 
            to="/cart" 
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-xs px-2 py-1 rounded text-center"
          >
            View Cart
          </Link>
          <Link 
            to="/checkout" 
            className="flex-1 border border-primary-600 text-primary-600 hover:bg-primary-50 text-xs px-2 py-1 rounded text-center"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AddToCartNotification; 