import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

/**
 * Toast notification for when a product is added to the cart
 * 
 * @param {Object} props
 * @param {Object} props.product - Product that was added to cart
 * @param {number} props.quantity - Quantity that was added
 * @param {Object} props.t - Toast instance from react-hot-toast
 * @returns {JSX.Element}
 */
const AddToCartNotification = ({ product, quantity, t }) => {
  // Calculate product price
  const price = product.price || 
    (product.Variants && product.Variants.length > 0 && 
     product.Variants[0].Prices && product.Variants[0].Prices.length > 0)
    ? product.Variants[0].Prices[0].amount
    : 0;
  
  // Get product image URL
  const imageUrl = (product.Images && product.Images.length > 0)
    ? product.Images[0].url
    : '/placeholder-product.png';
  
  return (
    <div 
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <img 
              className="h-12 w-12 object-cover rounded"
              src={imageUrl} 
              alt={product.name}
            />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              Produto adicionado
            </p>
            <p className="mt-1 text-sm text-gray-500 line-clamp-1">
              {product.name}
            </p>
            <div className="mt-1 flex justify-between">
              <p className="text-sm text-gray-500">
                Qtd: {quantity}
              </p>
              <p className="text-sm font-medium text-yellow-600">
                {formatCurrency(price * quantity)}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => t.dismiss()}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          Fechar
        </button>
      </div>
      
      {/* View Cart Button */}
      <Link
        to="/cart"
        className="absolute bottom-3 right-3 text-xs font-medium text-yellow-600 hover:text-yellow-700 bg-yellow-50 hover:bg-yellow-100 px-2 py-1 rounded-full"
        onClick={() => t.dismiss()}
      >
        Ver carrinho
      </Link>
    </div>
  );
};

export default AddToCartNotification; 