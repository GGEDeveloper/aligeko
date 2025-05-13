import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  useGetProductQuery, 
  useDeleteProductMutation 
} from '../store/api/productApi';
import { toast } from 'react-hot-toast';
import { useCart } from '../hooks/useCart';
import { formatCurrency } from '../utils/formatters';
import AddToCartNotification from '../components/cart/AddToCartNotification';
import ProductCard from '../components/products/ProductCard';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart, isInCart, getItemQuantity } = useCart();
  
  // Fetch product data
  const {
    data: product,
    isLoading,
    isError,
    error
  } = useGetProductQuery(id);
  
  // Delete product mutation
  const [deleteProduct, {
    isLoading: isDeleting,
    isError: isDeleteError,
    error: deleteError
  }] = useDeleteProductMutation();
  
  // Load related products (by same category or producer)
  // Use a state to store related products
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { data: allProducts } = useGetProductQuery('all');

  // Get related products when main product loads
  useEffect(() => {
    if (product && allProducts?.data) {
      try {
        console.log('Finding related products. Product:', product?.id, 'AllProducts data:', Array.isArray(allProducts.data) ? allProducts.data.length : 'not an array');
        
        // Make a safe copy of the data to work with
        const safeProductsData = Array.isArray(allProducts.data) ? allProducts.data.filter(p => p && typeof p === 'object') : [];
        
        // First verify we have valid data to work with
        if (safeProductsData.length === 0) {
          console.log('No valid products data to find related products');
          setRelatedProducts([]);
          return;
        }
        
        // Get products from the same category or producer with extensive null checks
        const related = safeProductsData
          .filter(p => {
            try {
              // Skip if product is invalid or the same as current product
              if (!p || !p.id) return false;
              
              const productId = parseInt(id);
              if (isNaN(productId) || p.id === productId) return false;
              
              // Safe category comparison with multiple fallback checks
              const sameCategory = Boolean(
                (product.category && p.category && product.category.id && p.category.id && product.category.id === p.category.id) || 
                (product.Category && p.Category && product.Category.id && p.Category.id && product.Category.id === p.Category.id) ||
                (product.category_id && p.category_id && product.category_id === p.category_id)
              );
              
              // Safe producer comparison with multiple fallback checks
              const sameProducer = Boolean(
                (product.producer && p.producer && product.producer.id && p.producer.id && product.producer.id === p.producer.id) ||
                (product.Producer && p.Producer && product.Producer.id && p.Producer.id && product.Producer.id === p.Producer.id) ||
                (product.producer_id && p.producer_id && product.producer_id === p.producer_id)
              );
              
              return sameCategory || sameProducer;
            } catch (filterError) {
              console.error('Error filtering a related product:', filterError);
              return false;
            }
          })
          .slice(0, 4); // Limit to 4 related products
        
        console.log('Related products found:', related.length);
        
        // Final safety check on each related product
        const safeRelated = related.map(p => {
          if (!p.Images) p.Images = [];
          if (!p.Category) p.Category = {};
          if (!p.Producer) p.Producer = {};
          return p;
        });
        
        setRelatedProducts(safeRelated);
      } catch (error) {
        console.error('Error finding related products:', error);
        setRelatedProducts([]);
      }
    } else {
      setRelatedProducts([]);
    }
  }, [product, allProducts, id]);
  
  // Handle delete product
  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(id).unwrap();
      toast.success('Product deleted successfully');
      navigate('/products');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete product');
    }
    setShowDeleteModal(false);
  };
  
  // Find selected variant on component mount
  useEffect(() => {
    if (product?.Variants && product.Variants.length > 0) {
      setSelectedVariant(product.Variants[0]);
    }
  }, [product]);
  
  // Get current price from selected variant or default product price
  const getCurrentPrice = () => {
    if (selectedVariant && selectedVariant.Prices && selectedVariant.Prices.length > 0) {
      return selectedVariant.Prices[0].amount;
    } else if (product.Prices && product.Prices.length > 0) {
      return product.Prices[0].amount;
    }
    return product.price || 0;
  };
  
  // Get current stock quantity
  const getCurrentStock = () => {
    if (selectedVariant && selectedVariant.Stock) {
      return selectedVariant.Stock.quantity || 0;
    }
    return getTotalStock();
  };
  
  // Handle variant change
  const handleVariantChange = (variantId) => {
    const variant = product.Variants.find(v => v.id === Number(variantId));
    setSelectedVariant(variant);
    // Reset quantity if needed
    if (variant && variant.Stock && variant.Stock.quantity < quantity) {
      setQuantity(Math.min(1, variant.Stock.quantity));
    }
  };
  
  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      const maxQuantity = getCurrentStock();
      setQuantity(Math.min(value, maxQuantity));
    }
  };
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (getCurrentStock() <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    
    setIsAddingToCart(true);
    
    try {
      const variantData = selectedVariant ? {
        id: selectedVariant.id,
        code: selectedVariant.code,
        name: selectedVariant.name || selectedVariant.code,
        price: getCurrentPrice()
      } : null;
      
      addToCart(product, quantity, variantData);
      
      toast.custom((t) => (
        <AddToCartNotification 
          product={product} 
          quantity={quantity}
          variant={variantData}
          t={t} 
        />
      ), {
        duration: 4000,
        position: 'bottom-right',
      });
    } catch (error) {
      toast.error('Failed to add product to cart');
      console.error('Add to cart error:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  // Check if the current product/variant is in cart
  const productInCart = selectedVariant 
    ? isInCart(product.id, { id: selectedVariant.id })
    : isInCart(product.id);
  
  const cartQuantity = selectedVariant
    ? getItemQuantity(product.id, { id: selectedVariant.id })
    : getItemQuantity(product.id);
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  // Render error state
  if (isError) {
    return (
      <div className="py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error?.data?.message || 'Unknown error occurred'}</span>
        </div>
      </div>
    );
  }
  
  // Calculate stock status
  const getTotalStock = () => {
    if (!product.Variants || product.Variants.length === 0) {
      return 0;
    }
    
    return product.Variants.reduce((total, variant) => {
      if (variant.Stock && variant.Stock.quantity) {
        return total + variant.Stock.quantity;
      }
      return total;
    }, 0);
  };
  
  // Get stock status badge
  const getStockStatusBadge = () => {
    const totalStock = getTotalStock();
    
    if (totalStock <= 0) {
      return <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Out of Stock</span>;
    } else if (totalStock < 10) {
      return <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Low Stock</span>;
    } else {
      return <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">In Stock</span>;
    }
  };
  
  // Get main product image URL
  const getMainImageUrl = () => {
    if (!product) return '/assets/placeholder-product.png';
    
    // Log for debugging
    console.log(`ProductDetail ${product.id} - ${product.name || 'unnamed'} image data:`, {
      Images: product.Images,
      images: product.images,
      url: product.url,
      image_url: product.image_url,
      imageUrl: product.imageUrl
    });
    
    // Verificar a propriedade Images (com I maiúsculo) que é retornada pelo backend
    if (product.Images && Array.isArray(product.Images) && product.Images.length > 0) {
      const mainImage = product.Images.find(img => img && img.is_main === true);
      if (mainImage && mainImage.url) return mainImage.url;
      if (product.Images[0] && product.Images[0].url) return product.Images[0].url;
    }
    
    // Verificar a propriedade images (com i minúsculo) como fallback
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const mainImage = product.images.find(img => img && img.is_main === true);
      if (mainImage && mainImage.url) return mainImage.url;
      if (product.images[0] && product.images[0].url) return product.images[0].url;
    }
    
    // Direct field checks
    if (product.image_url) return product.image_url;
    if (product.url && typeof product.url === 'string' && product.url.match(/\.(jpeg|jpg|gif|png)$/i)) return product.url;
    if (product.imageUrl) return product.imageUrl;
    
    // Categoria-specific placeholder logic
    if (product.category_id) {
      const categoryId = product.category_id.toString().toLowerCase();
      if (categoryId.includes('hydraulic')) {
        return '/assets/icons/category-hydraulic.png';
      } else if (categoryId.includes('electric')) {
        return '/assets/icons/category-electric.png';
      } else if (categoryId.includes('tools')) {
        return '/assets/icons/category-tools.png';
      }
    }
    
    // Último fallback: imagem de placeholder global
    return '/assets/placeholder-product.png';
  };
  
  // Get all product images for gallery
  const getProductImages = () => {
    if (!product) return [];
    
    let images = [];
    
    // Primeiro, verificar a propriedade Images (com I maiúsculo)
    if (product.Images && Array.isArray(product.Images) && product.Images.length > 0) {
      images = product.Images.filter(img => img && img.url).map(img => ({
        id: img.id || `img-${Math.random()}`,
        url: img.url,
        is_main: img.is_main || false
      }));
    } 
    // Fallback para a propriedade images (com i minúsculo)
    else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      images = product.images.filter(img => img && img.url).map(img => ({
        id: img.id || `img-${Math.random()}`,
        url: img.url,
        is_main: img.is_main || false
      }));
    }
    
    // Se não há imagens, mas temos uma URL direta, criar um objeto de imagem
    if (images.length === 0) {
      if (product.image_url) {
        images.push({
          id: 'default',
          url: product.image_url,
          is_main: true
        });
      } else if (product.url && typeof product.url === 'string' && product.url.match(/\.(jpeg|jpg|gif|png)$/i)) {
        images.push({
          id: 'default',
          url: product.url,
          is_main: true
        });
      } else if (product.imageUrl) {
        images.push({
          id: 'default',
          url: product.imageUrl,
          is_main: true
        });
      } else {
        // Category-specific placeholder
        let placeholderUrl = '/assets/placeholder-product.png';
        
        if (product.category_id) {
          const categoryId = product.category_id.toString().toLowerCase();
          if (categoryId.includes('hydraulic')) {
            placeholderUrl = '/assets/icons/category-hydraulic.png';
          } else if (categoryId.includes('electric')) {
            placeholderUrl = '/assets/icons/category-electric.png';
          } else if (categoryId.includes('tools')) {
            placeholderUrl = '/assets/icons/category-tools.png';
          }
        }
        
        images.push({
          id: 'placeholder',
          url: placeholderUrl,
          is_main: true
        });
      }
    }
    
    return images;
  };
  
  // Inside your render section, add this Add to Cart UI component where appropriate
  const renderAddToCartSection = () => {
    const currentPrice = getCurrentPrice();
    const currentStock = getCurrentStock();
    const isOutOfStock = currentStock <= 0;
    
    return (
      <div className="card p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Product Options</h3>
        
        {/* Variant Selector */}
        {product.Variants && product.Variants.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Variant
            </label>
            <select
              className="border border-neutral-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              value={selectedVariant ? selectedVariant.id : ''}
              onChange={(e) => handleVariantChange(e.target.value)}
            >
              {product.Variants.map(variant => (
                <option 
                  key={variant.id} 
                  value={variant.id}
                  disabled={variant.Stock && variant.Stock.quantity <= 0}
                >
                  {variant.name || variant.code} 
                  {variant.Stock && variant.Stock.quantity <= 0 ? ' (Out of Stock)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Price */}
        <div className="mb-4">
          <span className="text-sm text-neutral-500">Price:</span>
          <span className="text-2xl font-bold text-primary-600 block">
            {formatCurrency(currentPrice)}
          </span>
        </div>
        
        {/* Stock Status */}
        <div className="mb-4">
          <span className="text-sm text-neutral-500">Availability:</span>
          <div className="mt-1">
            {isOutOfStock ? (
              <span className="inline-block bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                Out of Stock
              </span>
            ) : currentStock < 10 ? (
              <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded">
                Low Stock ({currentStock} available)
              </span>
            ) : (
              <span className="inline-block bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
                In Stock
              </span>
            )}
          </div>
        </div>
        
        {!isOutOfStock && (
          <>
            {/* Quantity Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Quantity
              </label>
              <div className="flex w-1/3">
                <button 
                  className="border border-neutral-300 px-3 py-2 rounded-l-md bg-neutral-50 hover:bg-neutral-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <i className="bi bi-dash"></i>
                </button>
                <input
                  type="number"
                  min="1"
                  max={currentStock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="border-t border-b border-neutral-300 text-center p-2 w-16 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
                <button 
                  className="border border-neutral-300 px-3 py-2 rounded-r-md bg-neutral-50 hover:bg-neutral-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  onClick={() => setQuantity(Math.min(quantity + 1, currentStock))}
                  disabled={quantity >= currentStock}
                >
                  <i className="bi bi-plus"></i>
                </button>
              </div>
            </div>
            
            {/* Add to Cart Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              {productInCart ? (
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <span className="inline-block bg-primary-100 text-primary-800 px-4 py-2 rounded-md text-center">
                    In Cart ({cartQuantity})
                  </span>
                  <Link 
                    to="/cart" 
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-center transition-smooth focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    View Cart
                  </Link>
                </div>
              ) : (
                <button 
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-smooth focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cart-plus mr-2"></i>
                      Add to Cart
                    </>
                  )}
                </button>
              )}
              
              <button 
                className="w-full sm:w-auto border border-primary-500 text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-md transition-smooth focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <i className="bi bi-heart mr-2"></i>
                Add to Wishlist
              </button>
            </div>
          </>
        )}
      </div>
    );
  };
  
  // At the bottom of your component, add the related products section
  const renderRelatedProducts = () => {
    // Extra validity check for relatedProducts
    if (!relatedProducts || !Array.isArray(relatedProducts) || relatedProducts.length === 0) {
      console.log('No related products to render');
      return null;
    }
    
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Produtos relacionados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 grid-view">
          {relatedProducts.map((relatedProduct, index) => {
            // Extra safety check with detailed logging
            if (!relatedProduct) {
              console.warn('Null related product at index', index);
              return null;
            }
            
            if (typeof relatedProduct !== 'object') {
              console.warn('Invalid related product (not an object) at index', index, typeof relatedProduct);
              return null;
            }
            
            if (!relatedProduct.id) {
              console.warn('Related product missing ID at index', index, relatedProduct);
              return null;
            }
            
            // Ensure we have safe Images array
            if (!relatedProduct.Images) {
              relatedProduct.Images = [];
            }
            
            return (
              <ProductCard 
                key={`related-${relatedProduct.id}-${index}`} 
                product={relatedProduct} 
                viewMode="grid"
              />
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to="/products" className="text-primary-600 hover:text-primary-700 transition-smooth flex items-center">
          <i className="bi bi-arrow-left mr-2"></i>
          Back to Products
        </Link>
      </div>
      
      {/* Product Header */}
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <div>
          <h1 className="mb-2">{product?.name || 'Product Details'}</h1>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {product?.Category?.name && (
              <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
                {product.Category.name}
              </span>
            )}
            {product?.Producer?.name && (
              <span className="inline-block bg-neutral-100 text-neutral-800 text-xs px-2 py-1 rounded">
                {product.Producer.name}
              </span>
            )}
            {getStockStatusBadge()}
          </div>
          <p className="text-neutral-600 text-sm">Product ID: {product?.id || 'N/A'}</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Link to={`/products/${id}/edit`}>
            <button className="btn-outline flex items-center">
              <i className="bi bi-pencil mr-1"></i> Edit
            </button>
          </Link>
          <button 
            className={`border border-red-500 text-red-500 hover:bg-red-50 px-4 py-2 rounded-md transition-smooth flex items-center ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin h-4 w-4 border-t-2 border-red-500 rounded-full mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <i className="bi bi-trash mr-1"></i> Delete
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Product Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Image */}
        <div className="md:col-span-1">
          <div className="card">
            <img
              src={getMainImageUrl()}
              alt={product.name}
              className="w-full h-64 object-cover rounded-t-lg"
            />
          </div>
        </div>
        
        {/* Product Details Tabs */}
        <div className="md:col-span-2">
          <div className="card">
            {/* Tabs Header */}
            <div className="border-b border-neutral-300">
              <nav className="flex flex-wrap">
                <button
                  className={`px-4 py-3 font-medium border-b-2 transition-smooth ${
                    activeTab === 'details'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                <button
                  className={`px-4 py-3 font-medium border-b-2 transition-smooth ${
                    activeTab === 'variants'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                  onClick={() => setActiveTab('variants')}
                >
                  Variants
                </button>
                <button
                  className={`px-4 py-3 font-medium border-b-2 transition-smooth ${
                    activeTab === 'pricing'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                  onClick={() => setActiveTab('pricing')}
                >
                  Pricing
                </button>
                <button
                  className={`px-4 py-3 font-medium border-b-2 transition-smooth ${
                    activeTab === 'images'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                  onClick={() => setActiveTab('images')}
                >
                  Images
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="font-semibold text-neutral-700">Description:</div>
                    <div className="md:col-span-2">{product.description}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="font-semibold text-neutral-700">SKU:</div>
                    <div className="md:col-span-2">{product.sku}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="font-semibold text-neutral-700">Base Price:</div>
                    <div className="md:col-span-2 font-medium text-secondary-500">
                      ${parseFloat(product.base_price).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="font-semibold text-neutral-700">Producer:</div>
                    <div className="md:col-span-2">{product.Producer?.name || 'N/A'}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="font-semibold text-neutral-700">Category:</div>
                    <div className="md:col-span-2">{product.Category?.name || 'N/A'}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="font-semibold text-neutral-700">Unit:</div>
                    <div className="md:col-span-2">
                      {product.Unit?.name || 'N/A'} 
                      {product.Unit?.moq && (
                        <span className="text-neutral-500 ml-2">
                          (Min Order: {product.Unit.moq})
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="font-semibold text-neutral-700">Created At:</div>
                    <div className="md:col-span-2">
                      {new Date(product.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'variants' && (
                <div>
                  {product.Variants && product.Variants.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-full text-sm">
                        <thead className="bg-neutral-100">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-neutral-700">#</th>
                            <th className="px-4 py-3 text-left font-medium text-neutral-700">SKU</th>
                            <th className="px-4 py-3 text-left font-medium text-neutral-700">Attributes</th>
                            <th className="px-4 py-3 text-left font-medium text-neutral-700">Price</th>
                            <th className="px-4 py-3 text-left font-medium text-neutral-700">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                          {product.Variants.map((variant, index) => (
                            <tr key={variant.id} className="hover:bg-neutral-50">
                              <td className="px-4 py-3">{index + 1}</td>
                              <td className="px-4 py-3">{variant.sku}</td>
                              <td className="px-4 py-3">
                                {variant.VariantAttributes && variant.VariantAttributes.map((attr, idx) => (
                                  <span key={attr.id || idx} className="block">
                                    <span className="font-medium">{attr.attribute_name}:</span> {attr.value}
                                  </span>
                                ))}
                              </td>
                              <td className="px-4 py-3 font-medium text-secondary-500">
                                ${parseFloat(variant.price || product.base_price).toFixed(2)}
                              </td>
                              <td className="px-4 py-3">
                                {variant.Stock ? variant.Stock.quantity : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-600">
                      No variants available for this product.
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <button className="btn-outline flex items-center">
                      <i className="bi bi-plus-lg mr-1"></i> Add Variant
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'pricing' && (
                <div>
                  {product.PriceTiers && product.PriceTiers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-full text-sm">
                        <thead className="bg-neutral-100">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-neutral-700">#</th>
                            <th className="px-4 py-3 text-left font-medium text-neutral-700">Quantity Range</th>
                            <th className="px-4 py-3 text-left font-medium text-neutral-700">Price</th>
                            <th className="px-4 py-3 text-left font-medium text-neutral-700">Discount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                          {product.PriceTiers.map((tier, index) => (
                            <tr key={tier.id} className="hover:bg-neutral-50">
                              <td className="px-4 py-3">{index + 1}</td>
                              <td className="px-4 py-3">
                                {tier.min_quantity} - {tier.max_quantity || '∞'}
                              </td>
                              <td className="px-4 py-3 font-medium text-secondary-500">
                                ${parseFloat(tier.price).toFixed(2)}
                              </td>
                              <td className="px-4 py-3">
                                {tier.discount_percentage ? `${tier.discount_percentage}%` : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-600">
                      No special pricing tiers available for this product.
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <button className="btn-outline flex items-center">
                      <i className="bi bi-plus-lg mr-1"></i> Add Price Tier
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'images' && (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {getProductImages().map((image, index) => (
                      <div key={image.id || index} className="relative group">
                        <img
                          src={image.url}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-48 object-cover rounded border border-neutral-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button className="text-white bg-red-500 hover:bg-red-600 p-2 rounded-full mx-1">
                            <i className="bi bi-trash"></i>
                          </button>
                          <button className="text-white bg-neutral-700 hover:bg-neutral-800 p-2 rounded-full mx-1">
                            <i className="bi bi-arrows-move"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button className="btn-outline flex items-center">
                      <i className="bi bi-cloud-upload mr-1"></i> Upload Images
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="mb-4 text-lg font-medium">Confirm Delete</h3>
            <p className="mb-4 text-neutral-600">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="btn-outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-smooth"
                onClick={handleDeleteProduct}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add to Cart Section */}
      {renderAddToCartSection()}
      
      {/* Related Products Section */}
      {renderRelatedProducts()}
    </div>
  );
};

export default ProductDetailPage; 