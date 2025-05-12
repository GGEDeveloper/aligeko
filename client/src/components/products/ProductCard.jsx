import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';
import AddToCartNotification from '../cart/AddToCartNotification';

/**
 * ProductCard component for displaying a product with enhanced information and Add to Cart functionality
 *
 * @param {Object} props
 * @param {Object} props.product - Product data
 * @returns {JSX.Element}
 */
const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSpecsTooltip, setShowSpecsTooltip] = useState(false);
  const { addToCart, isInCart, getItemQuantity } = useCart();
  
  // Calculate product price
  const price = product.price || 
    (product.variants && product.variants.length > 0 && 
     product.variants[0].prices && product.variants[0].prices.length > 0)
    ? product.variants[0].prices[0].gross_price
    : 0;
  
  // Calculate discount price (if exists)
  const retailPrice = product.retail_price || 
    (product.variants && product.variants.length > 0 && 
     product.variants[0].prices && product.variants[0].prices.length > 1)
    ? product.variants[0].prices.find(p => p.type === 'retail')?.gross_price
    : null;
  
  const hasDiscount = retailPrice && retailPrice > price;
  const discountPercentage = hasDiscount ? Math.round((1 - price / retailPrice) * 100) : 0;
  
  // Get product image URL (use main image if available)
  const imageUrl = product.images && product.images.length > 0
    ? product.images.find(img => img.is_main)?.url || product.images[0].url
    : '/placeholder-product.png';
  
  // Check if product is in cart
  const productInCart = isInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);
  
  // Check stock availability
  const stockQuantity = product.variants && product.variants.length > 0 && 
                       product.variants[0].stock
    ? product.variants[0].stock.quantity
    : 999; // Default to 999 if stock information is not available
  
  const isOutOfStock = stockQuantity <= 0;
  
  // Format description
  const shortDescription = product.short_description || 
                          product.description?.substring(0, 100) || 
                          'Descrição não disponível';
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('Este produto está fora de estoque');
      return;
    }
    
    setIsAddingToCart(true);
    
    try {
      addToCart(product, quantity);
      toast.custom((t) => (
        <AddToCartNotification 
          product={product} 
          quantity={quantity} 
          t={t} 
        />
      ), {
        duration: 4000,
        position: 'bottom-right',
      });
    } catch (error) {
      toast.error('Falha ao adicionar produto ao carrinho');
      console.error('Add to cart error:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setQuantity(Math.min(value, stockQuantity));
    }
  };

  // Get product specifications for tooltip
  const getSpecifications = () => {
    const specs = [];
    if (product.weight) specs.push(`Peso: ${product.weight}kg`);
    if (product.dimensions) specs.push(`Dimensões: ${product.dimensions}`);
    if (product.ean) specs.push(`EAN: ${product.ean}`);
    if (product.material) specs.push(`Material: ${product.material}`);
    
    return specs.length > 0 ? specs.join(' | ') : 'Especificações não disponíveis';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full product-card">
      <div className="relative pt-[100%]"> {/* Aspect ratio 1:1 */}
        <Link to={`/products/${product.id}`}>
          <img 
            src={imageUrl} 
            alt={product.name}
            className="absolute top-0 left-0 w-full h-full object-contain p-4"
          />
        </Link>
        
        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            -{discountPercentage}%
          </span>
        )}
        
        {/* Stock Badge */}
        {isOutOfStock ? (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Esgotado
          </span>
        ) : stockQuantity < 10 ? (
          <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
            Estoque Baixo: {stockQuantity}
          </span>
        ) : (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
            Em Estoque
          </span>
        )}
        
        {/* Category Badge */}
        {product.category && (
          <span className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            {product.category.name}
          </span>
        )}
        
        {/* Quick view button - Size fixed to h-3 w-3 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-20">
          <Link 
            to={`/products/${product.id}`}
            className="bg-white text-gray-800 rounded-full p-1 shadow-lg hover:bg-yellow-500 hover:text-white transition-colors duration-300 visualizacao-rapida"
            aria-label="Visualização rápida"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        {/* Producer name and code */}
        {product.producer && (
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs text-gray-600">
              {product.producer.name}
            </span>
            <span className="text-xs text-gray-500">
              Cód: {product.code?.substring(0, 8)}
            </span>
          </div>
        )}
        
        {/* Product name */}
        <Link to={`/products/${product.id}`} className="text-gray-900 hover:text-yellow-600">
          <h3 className="font-medium text-lg line-clamp-2 mb-1 min-h-[3.5rem]">{product.name}</h3>
        </Link>
        
        {/* Short description with custom tooltip */}
        <div className="relative">
          <div 
            className="cursor-help"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500 info-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {showTooltip && (
            <div className="absolute z-10 bottom-full left-0 mb-2 w-full max-w-xs bg-gray-800 text-white text-xs rounded-md p-1.5 shadow-lg">
              {product.description || shortDescription}
              <div className="absolute left-0 w-2 h-2 -bottom-1 transform translate-x-6 rotate-45 bg-gray-800"></div>
            </div>
          )}
        </div>
        
        {/* Specifications tooltip */}
        <div className="relative mb-3">
          <div 
            className="flex items-center cursor-help text-xs text-gray-500"
            onMouseEnter={() => setShowSpecsTooltip(true)}
            onMouseLeave={() => setShowSpecsTooltip(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 mr-1 info-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">Ver especificações</span>
          </div>
          
          {showSpecsTooltip && (
            <div className="absolute z-10 bottom-0 left-0 mb-5 w-full max-w-xs bg-gray-800 text-white text-xs rounded-md p-1.5 shadow-lg">
              <ul className="list-disc pl-4">
                {product.specs && product.specs.map((spec, index) => (
                  <li key={index}>{spec}</li>
                ))}
                {(!product.specs || product.specs.length === 0) && (
                  <li>Informações técnicas não disponíveis</li>
                )}
              </ul>
              <div className="absolute left-0 w-2 h-2 -bottom-1 transform translate-x-6 rotate-45 bg-gray-800"></div>
            </div>
          )}
        </div>
        
        {/* Price */}
        <div className="mt-auto">
          <div className="flex justify-between items-end mb-3">
            <div>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through block">
                  {formatCurrency(retailPrice)}
                </span>
              )}
          <span className="text-lg font-bold text-yellow-600">
            {formatCurrency(price)}
          </span>
            </div>
          
            {product.ean && (
              <span className="text-xs text-gray-500">
                EAN: {product.ean}
              </span>
              )}
      </div>
      
          {/* Add to cart button */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button 
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md hover:bg-gray-100 disabled:opacity-50"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || isOutOfStock || isAddingToCart || productInCart}
                aria-label="Diminuir quantidade"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <input
                id={`quantity-${product.id}`}
                type="number"
                min="1"
                max={stockQuantity}
                value={quantity}
                onChange={handleQuantityChange}
                disabled={isOutOfStock || isAddingToCart || productInCart}
                className="h-8 w-12 border-t border-b border-gray-300 text-center text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
              />
              
              <button 
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md hover:bg-gray-100 disabled:opacity-50"
                onClick={() => setQuantity(Math.min(quantity + 1, stockQuantity))}
                disabled={quantity >= stockQuantity || isOutOfStock || isAddingToCart || productInCart}
                aria-label="Aumentar quantidade"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            {productInCart ? (
              <Link to="/cart" className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>No Carrinho ({cartQuantity})</span>
              </Link>
            ) : (
              <button 
                className={`px-3 py-2 rounded-md flex items-center ${
                  isOutOfStock || isAddingToCart
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
                disabled={isOutOfStock || isAddingToCart}
                onClick={handleAddToCart}
              >
                {isAddingToCart ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Adicionando...</span>
                  </>
                ) : isOutOfStock ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Esgotado</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Adicionar</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;