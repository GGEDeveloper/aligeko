import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Form } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';
import AddToCartNotification from '../cart/AddToCartNotification';

/**
 * ProductCard component for displaying a product with Add to Cart functionality
 *
 * @param {Object} props
 * @param {Object} props.product - Product data
 * @returns {JSX.Element}
 */
const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart, isInCart, getItemQuantity } = useCart();
  
  // Calculate product price
  const price = product.Prices && product.Prices.length > 0
    ? product.Prices[0].amount
    : product.price || 0;
  
  // Get product image URL
  const imageUrl = product.Images && product.Images.length > 0
    ? product.Images[0].url
    : '/placeholder-product.png';
  
  // Check if product is in cart
  const productInCart = isInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);
  
  // Check stock availability
  const stockQuantity = product.Variants && product.Variants.length > 0 && product.Variants[0].Stock
    ? product.Variants[0].Stock.quantity
    : 0;
  
  const isOutOfStock = stockQuantity <= 0;
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('This product is out of stock');
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
      toast.error('Failed to add product to cart');
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
  
  return (
    <Card className="h-100 product-card shadow-sm">
      <div className="position-relative">
        <Link to={`/products/${product.id}`}>
          <Card.Img 
            variant="top" 
            src={imageUrl} 
            alt={product.name}
            className="product-image"
            style={{ height: '200px', objectFit: 'cover' }}
          />
        </Link>
        
        {/* Stock Badge */}
        {isOutOfStock ? (
          <Badge bg="danger" className="position-absolute top-0 end-0 m-2">
            Out of Stock
          </Badge>
        ) : stockQuantity < 10 ? (
          <Badge bg="warning" className="position-absolute top-0 end-0 m-2">
            Low Stock: {stockQuantity}
          </Badge>
        ) : (
          <Badge bg="success" className="position-absolute top-0 end-0 m-2">
            In Stock
          </Badge>
        )}
        
        {/* Category Badge */}
        {product.Category && (
          <Badge bg="primary" className="position-absolute top-0 start-0 m-2">
            {product.Category.name}
          </Badge>
        )}
      </div>
      
      <Card.Body className="d-flex flex-column">
        <Link to={`/products/${product.id}`} className="text-decoration-none">
          <Card.Title className="mb-2 text-truncate">{product.name}</Card.Title>
        </Link>
        
        {product.Producer && (
          <Card.Subtitle className="mb-2 text-muted">
            {product.Producer.name}
          </Card.Subtitle>
        )}
        
        <Card.Text className="product-description text-truncate mb-2">
          {product.description || 'No description available'}
        </Card.Text>
        
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <span className="fs-5 fw-bold text-primary">
            {formatCurrency(price)}
          </span>
          
          {productInCart ? (
            <Link to="/cart" className="btn btn-outline-primary">
              In Cart ({cartQuantity})
            </Link>
          ) : (
            <Button 
              variant={isOutOfStock ? "secondary" : "primary"}
              disabled={isOutOfStock || isAddingToCart}
              onClick={handleAddToCart}
            >
              {isAddingToCart ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Adding...
                </>
              ) : (
                <>Add to Cart</>
              )}
            </Button>
          )}
        </div>
      </Card.Body>
      
      {/* Quantity selector */}
      {!isOutOfStock && !productInCart && (
        <Card.Footer className="bg-white border-top-0">
          <div className="d-flex align-items-center">
            <Form.Label htmlFor={`quantity-${product.id}`} className="me-2 mb-0">
              Qty:
            </Form.Label>
            <div className="d-flex align-items-center quantity-selector">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <i className="bi bi-dash"></i>
              </Button>
              
              <Form.Control
                id={`quantity-${product.id}`}
                type="number"
                min="1"
                max={stockQuantity}
                value={quantity}
                onChange={handleQuantityChange}
                className="mx-2 text-center"
                style={{ width: '50px' }}
              />
              
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setQuantity(Math.min(quantity + 1, stockQuantity))}
                disabled={quantity >= stockQuantity}
                aria-label="Increase quantity"
              >
                <i className="bi bi-plus"></i>
              </Button>
            </div>
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default ProductCard; 