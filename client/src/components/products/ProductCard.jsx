import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';
import AddToCartNotification from '../cart/AddToCartNotification';
import { 
  BsEye, BsInfoCircle, BsCartPlus, 
  BsPlusCircle, BsDashCircle,
  BsCheckCircle, BsArrowRightShort
} from 'react-icons/bs';

/**
 * Enhanced ProductCard component with futuristic design
 * Displays product information with enhanced visual styling and interactions
 * Improved with optimized image loading and UI refinements
 *
 * @param {Object} props
 * @param {Object} props.product - Product data object
 * @param {string} props.viewMode - View mode (grid or list)
 * @returns {JSX.Element}
 */
const ProductCard = ({ product = {}, viewMode = 'grid' }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const { addToCart, isInCart, getItemQuantity } = useCart();
  
  // Defensive check for product validity
  if (!product || !product.id) {
    console.error('Invalid product data received in ProductCard:', product);
    return (
      <div className="bg-white rounded-xl overflow-hidden flex flex-col h-full product-card border border-neutral-200 p-4">
        <div className="text-center text-neutral-500">
          <p>Invalid product data</p>
        </div>
      </div>
    );
  }
  
  const isList = viewMode === 'list';
  
  // Calculate product price with safety checks
  const price = (product.price || 
    (product.variants && Array.isArray(product.variants) && product.variants.length > 0 && 
     product.variants[0]?.prices && Array.isArray(product.variants[0].prices) && product.variants[0].prices.length > 0)
    ? product.variants[0].prices[0]?.gross_price
    : 0) || 0; // Ensure we never return undefined
  
  // Calculate discount price (if exists) with safety checks
  const retailPrice = (product.retail_price || 
    (product.variants && Array.isArray(product.variants) && product.variants.length > 0 && 
     product.variants[0]?.prices && Array.isArray(product.variants[0].prices) && product.variants[0].prices.length > 1)
    ? product.variants[0].prices.find(p => p?.type === 'retail')?.gross_price
    : null) || null; // Ensure we never return undefined
  
  const hasDiscount = retailPrice && retailPrice > price;
  const discountPercentage = hasDiscount ? Math.round((1 - price / retailPrice) * 100) : 0;
  
  // Get product image URL with extensive fallbacks and safety checks
  const getImageUrl = () => {
    try {
      // Additional debug logging
      console.log(`Product ${product.id} - ${product.name || 'unnamed'} image data:`, {
        Images: product.Images,
        images: product.images,
        url: product.url,
        image_url: product.image_url,
        imageUrl: product.imageUrl
      });
      
      // Check for Images array (capital I) with full safety checks
      if (product.Images && Array.isArray(product.Images) && product.Images.length > 0) {
        const mainImage = product.Images.find(img => img && img.is_main === true);
        if (mainImage && mainImage.url) return mainImage.url;
        if (product.Images[0] && product.Images[0].url) return product.Images[0].url;
      }
      
      // Check for images array (lowercase i) with full safety checks
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        const mainImage = product.images.find(img => img && img.is_main === true);
        if (mainImage && mainImage.url) return mainImage.url;
        if (product.images[0] && product.images[0].url) return product.images[0].url;
      }
      
      // Direct field checks with safety checks
      if (product.image_url && typeof product.image_url === 'string') return product.image_url;
      if (product.url && typeof product.url === 'string' && product.url.match(/\.(jpeg|jpg|gif|png)$/i)) return product.url;
      if (product.imageUrl && typeof product.imageUrl === 'string') return product.imageUrl;
      
      // Category-specific placeholder logic with safety checks
      if (product.category_id && typeof product.category_id === 'string') {
        const categoryId = product.category_id.toLowerCase();
        if (categoryId.includes('hydraulic')) {
          return '/assets/icons/category-hydraulic.png';
        } else if (categoryId.includes('electric')) {
          return '/assets/icons/category-electric.png';
        } else if (categoryId.includes('tools')) {
          return '/assets/icons/category-tools.png';
        }
      }
      
      // Default fallback
      return '/assets/placeholder-product.png';
    } catch (error) {
      console.error(`Error getting image URL for product ${product.id}:`, error);
      return '/assets/placeholder-product.png';
    }
  };
  
  // Update image URL when product changes with error handling
  useEffect(() => {
    try {
      const url = getImageUrl();
      setImageUrl(url);
      
      // Debug logging
      console.log(`ProductCard ${product.id} - ${product.name || 'unnamed'}:`, {
        Images: product.Images,
        images: product.images,
        selectedUrl: url
      });
      
      // Reset image loading state
      setImageLoaded(false);
      setImageError(false);
    } catch (error) {
      console.error(`Error in ProductCard useEffect for product ${product.id}:`, error);
      setImageUrl('/assets/placeholder-product.png');
      setImageError(true);
    }
  }, [product]);
  
  // Handle image loading error with improved logging
  const handleImageError = () => {
    console.warn(`Failed to load image for product: ${product.id} - ${product.name || 'unnamed'}`, imageUrl);
    setImageError(true);
  };

  // Handle image load success
  const handleImageLoad = () => {
    console.log(`Image loaded successfully for product: ${product.id}`, imageUrl);
    setImageLoaded(true);
  };
  
  // Check if product is in cart with safety checks
  const productInCart = product.id ? isInCart(product.id) : false;
  const cartQuantity = product.id ? getItemQuantity(product.id) : 0;
  
  // Check stock availability with safety checks
  const stockQuantity = (product.variants && Array.isArray(product.variants) && 
                       product.variants.length > 0 && product.variants[0]?.stock)
    ? (product.variants[0].stock.quantity || 0)
    : 999; // Default to 999 if stock information is not available
  
  const isOutOfStock = stockQuantity <= 0;
  
  // Format description with safety checks
  const shortDescription = product.short_description || 
                          product.description_short ||
                          (product.description && typeof product.description === 'string' 
                            ? product.description.substring(0, 100) 
                            : 'Descrição não disponível');
  
  // Handle add to cart
  const handleAddToCart = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
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

  const incrementQuantity = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (quantity < stockQuantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Get product specifications for tooltip
  const getSpecifications = () => {
    const specs = [];
    if (product.weight) specs.push(`Peso: ${product.weight}kg`);
    if (product.dimensions) specs.push(`Dimensões: ${product.dimensions}`);
    if (product.ean) specs.push(`EAN: ${product.ean}`);
    if (product.material) specs.push(`Material: ${product.material}`);
    
    return specs.length > 0 ? specs : ['Especificações não disponíveis'];
  };
  
  // Render grid view product card
  if (!isList) {
    return (
      <div className="bg-white rounded-lg overflow-hidden flex flex-col h-full min-h-[250px] max-w-[240px] mx-auto product-card hover:shadow-md transition-all duration-200 border border-neutral-200 transform hover:-translate-y-1">
        {/* Product Image with Overlay */}
        <div className="relative overflow-hidden product-image-container" style={{ paddingTop: '100%' }}> {/* Aspect ratio 1:1, more compact */}
          <Link to={`/products/${product.id}`} className="block absolute inset-0">
            {!imageError ? (
              <>
                {!imageLoaded && (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                    <div className="w-8 h-8 border-t-2 border-b-2 border-brand rounded-full animate-spin"></div>
                  </div>
                )}
                <img 
                  src={imageUrl} 
                  alt={product.name}
                  className={`w-full h-full object-contain p-2 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              </>
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-neutral-100 text-neutral-400">
                <span className="text-sm">Imagem não disponível</span>
              </div>
            )}
            
            {/* Interactive Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
              <div className="p-4 text-white flex justify-end space-x-2">
                <button 
                  className="bg-brand p-2 rounded-full hover:bg-brand-600 transition-colors visualizacao-rapida"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDetails(!showDetails);
                  }}
                  aria-label="Ver detalhes rápidos"
                >
                  <BsEye className="h-4 w-4" />
                </button>
                
                <button 
                  className="bg-primary-700 p-2 rounded-full hover:bg-primary-800 transition-colors"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAddingToCart}
                  aria-label="Adicionar ao carrinho"
                >
                  <BsCartPlus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Link>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {hasDiscount && (
              <span className="inline-block bg-error text-white font-semibold text-xs px-2 py-1 rounded-md">
                -{discountPercentage}%
              </span>
            )}
            
            {product.is_new && (
              <span className="inline-block bg-info text-white font-semibold text-xs px-2 py-1 rounded-md">
                Novo
              </span>
            )}
          </div>
          
          {/* Stock Badge */}
          <div className="absolute top-2 right-2">
            {isOutOfStock ? (
              <span className="inline-block bg-error text-white text-xs px-2 py-1 rounded-md">
                Esgotado
              </span>
            ) : stockQuantity < 10 ? (
              <span className="inline-block bg-warning text-white text-xs px-2 py-1 rounded-md">
                Restam {stockQuantity}
              </span>
            ) : (
              <span className="inline-block bg-success text-white text-xs px-2 py-1 rounded-md">
                Em Estoque
              </span>
            )}
          </div>
        </div>
        
        {/* Product Info */}
        <div className="p-4 flex-grow flex flex-col">
          {/* Category & Brand */}
          <div className="flex justify-between items-center mb-2">
            {product.category && (
              <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-md">
                {product.category.name}
              </span>
            )}
            
            {product.producer && (
              <span className="text-xs font-medium text-primary-600">
                {product.producer.name}
              </span>
            )}
          </div>
          
          {/* Product Name */}
          <Link to={`/products/${product.id}`} className="hover:text-brand-600 transition-colors">
            <h3 className="font-semibold text-primary-800 text-base product-name">
              {product.name}
            </h3>
          </Link>
          
          {/* Quick Info */}
          <div className="mt-2 mb-auto">
            <div className="flex items-center text-xs text-neutral-600 space-x-1 mb-1 info-icon">
              <BsInfoCircle className="h-4 w-4 text-neutral-500" />
              <span className="line-clamp-1">{shortDescription}</span>
            </div>
            
            {product.ean && (
              <div className="text-xs text-neutral-500 mt-1">
                EAN: {product.ean}
              </div>
            )}
          </div>
          
          {/* Price and Actions */}
          <div className="mt-4">
            {/* Price */}
            <div className="flex justify-between items-end mb-2">
              <div>
                {hasDiscount && (
                  <span className="text-sm text-neutral-500 line-through block">
                    {formatCurrency(retailPrice)}
                  </span>
                )}
                <span className="text-lg font-bold text-brand-700">
                  {formatCurrency(price)}
                </span>
              </div>
              
              {/* If in cart indicator */}
              {productInCart && (
                <div className="flex items-center text-success">
                  <BsCheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-xs">{cartQuantity} no carrinho</span>
                </div>
              )}
            </div>
            
            {/* Add to Cart Flow */}
            {!isOutOfStock && (
              <div className="flex mt-2 gap-2">
                <div className="flex items-center border border-neutral-300 rounded-md overflow-hidden">
                  <button 
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="px-2 py-1 hover:bg-neutral-100 disabled:opacity-50 text-neutral-700"
                  >
                    <BsDashCircle className="h-3 w-3" />
                  </button>
                  <input 
                    type="text"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-10 text-center text-sm border-x border-neutral-300 py-1 focus:outline-none"
                  />
                  <button 
                    onClick={incrementQuantity}
                    disabled={quantity >= stockQuantity}
                    className="px-2 py-1 hover:bg-neutral-100 disabled:opacity-50 text-neutral-700"
                  >
                    <BsPlusCircle className="h-3 w-3" />
                  </button>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || isOutOfStock}
                  className={`flex-grow bg-brand hover:bg-brand-600 text-sm font-medium py-1 px-4 rounded-md text-black transition-colors ${isAddingToCart ? 'opacity-70' : ''}`}
                >
                  {isAddingToCart ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick View Modal */}
        {showDetails && (
          <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetails(false)}
          >
            <div 
              className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-neutral-200 flex justify-between">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  &times;
                </button>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="aspect-square bg-neutral-100 rounded-lg flex items-center justify-center">
                    <img 
                      src={imageUrl} 
                      alt={product.name}
                      className="max-h-full max-w-full object-contain p-2"
                      onError={handleImageError}
                    />
                  </div>
                  
                  <div>
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-neutral-700 mb-1">Descrição</h4>
                      <p className="text-sm text-neutral-600">
                        {product.description || shortDescription}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-neutral-700 mb-1">Especificações</h4>
                      <ul className="text-sm text-neutral-600 list-disc pl-4">
                        {getSpecifications().map((spec, index) => (
                          <li key={index}>{spec}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-neutral-700 mb-1">Preço</h4>
                      <div className="flex items-baseline">
                        {hasDiscount && (
                          <span className="text-sm text-neutral-500 line-through mr-2">
                            {formatCurrency(retailPrice)}
                          </span>
                        )}
                        <span className="text-xl font-bold text-brand-700">
                          {formatCurrency(price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <Link 
                    to={`/products/${product.id}`}
                    className="block w-full text-center bg-primary-700 hover:bg-primary-800 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    Ver detalhes completos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // List view product card
  return (
    <div className="bg-white rounded-lg overflow-hidden flex md:flex-row product-card hover:shadow-md transition-all duration-200 border border-neutral-200 min-h-[140px] max-w-full">
      <div className="flex flex-col md:flex-row">
        {/* Product Image */}
        <div className="product-image-container flex-shrink-0 w-full md:w-32 aspect-square bg-neutral-100 flex items-center justify-center">
          <Link to={`/products/${product.id}`} className="block h-full">
            {!imageError ? (
              <>
                {!imageLoaded && (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                    <div className="w-8 h-8 border-t-2 border-b-2 border-brand rounded-full animate-spin"></div>
                  </div>
                )}
                <img 
                  src={imageUrl} 
                  alt={product.name}
                  className={`w-full h-full object-contain p-2 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              </>
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-neutral-100 text-neutral-400">
                <span className="text-sm">Imagem não disponível</span>
              </div>
            )}
          </Link>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {hasDiscount && (
              <span className="inline-block bg-error text-white font-semibold text-xs px-2 py-1 rounded-md">
                -{discountPercentage}%
              </span>
            )}
            
            {product.is_new && (
              <span className="inline-block bg-info text-white font-semibold text-xs px-2 py-1 rounded-md">
                Novo
              </span>
            )}
          </div>
        </div>
        
        {/* Product Info */}
        <div className="p-4 flex-grow flex flex-col">
          {/* Category & Brand */}
          <div className="flex justify-between items-center mb-2">
            {product.category && (
              <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-md">
                {product.category.name}
              </span>
            )}
            
            {product.producer && (
              <span className="text-xs font-medium text-primary-600">
                {product.producer.name}
              </span>
            )}
          </div>
          
          {/* Product Name */}
          <Link to={`/products/${product.id}`} className="hover:text-brand-600 transition-colors">
            <h3 className="font-semibold text-primary-800 text-base product-name">
              {product.name}
            </h3>
          </Link>
          
          {/* Description */}
          <div className="mt-2 mb-3">
            <p className="text-sm text-neutral-600 line-clamp-2">
              {shortDescription}
            </p>
          </div>
          
          {/* Specifications */}
          <div className="mt-1 mb-auto">
            <div className="flex flex-wrap gap-2">
              {product.ean && (
                <span className="text-xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded">
                  EAN: {product.ean}
                </span>
              )}
              {product.weight && (
                <span className="text-xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded">
                  Peso: {product.weight}kg
                </span>
              )}
            </div>
          </div>
          
          {/* Price and Actions */}
          <div className="mt-4 flex flex-wrap justify-between items-end">
            {/* Price */}
            <div className="mb-2 md:mb-0">
              {hasDiscount && (
                <span className="text-sm text-neutral-500 line-through block">
                  {formatCurrency(retailPrice)}
                </span>
              )}
              <span className="text-lg font-bold text-brand-700">
                {formatCurrency(price)}
              </span>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              {!isOutOfStock ? (
                <>
                  <div className="flex items-center border border-neutral-300 rounded-md overflow-hidden">
                    <button 
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="px-2 py-1 hover:bg-neutral-100 disabled:opacity-50 text-neutral-700"
                    >
                      <BsDashCircle className="h-3 w-3" />
                    </button>
                    <input 
                      type="text"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-10 text-center text-sm border-x border-neutral-300 py-1 focus:outline-none"
                    />
                    <button 
                      onClick={incrementQuantity}
                      disabled={quantity >= stockQuantity}
                      className="px-2 py-1 hover:bg-neutral-100 disabled:opacity-50 text-neutral-700"
                    >
                      <BsPlusCircle className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || isOutOfStock}
                    className={`bg-brand hover:bg-brand-600 text-sm font-medium py-2 px-4 rounded-md text-black transition-colors ${isAddingToCart ? 'opacity-70' : ''}`}
                  >
                    {isAddingToCart ? 'Adicionando...' : 'Adicionar ao Carrinho'}
                  </button>
                </>
              ) : (
                <span className="inline-block bg-error text-white text-sm px-3 py-2 rounded-md">
                  Esgotado
                </span>
              )}
              
              <Link
                to={`/products/${product.id}`}
                className="bg-primary-700 hover:bg-primary-800 text-white p-2 rounded-md transition-colors flex items-center"
              >
                <span className="hidden md:inline mr-1">Ver Detalhes</span>
                <BsArrowRightShort className="h-4 w-4" />
              </Link>
            </div>
          </div>
          
          {/* Cart Indicator */}
          {productInCart && (
            <div className="mt-2 flex items-center text-success">
              <BsCheckCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">{cartQuantity} no carrinho</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;