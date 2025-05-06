import React from 'react';
import { Badge, Button, Card, Form, Image, Stack } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';

/**
 * CartItem component displays a single item in the cart with quantity controls
 * 
 * @param {Object} props
 * @param {Object} props.item - Cart item data
 * @param {boolean} props.compact - Whether to display in compact mode (for mini cart)
 * @returns {JSX.Element}
 */
const CartItem = ({ item, compact = false }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { id, name, price, image, quantity, variant, serverId } = item;
  
  // Check if item is synced with server
  const isSynced = isAuthenticated && serverId;
  
  // Handle quantity change
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      updateQuantity(id, newQuantity, variant);
    }
  };
  
  // Handle remove item
  const handleRemove = () => {
    removeFromCart(id, variant);
  };
  
  if (compact) {
    // Compact version for mini cart
    return (
      <Stack direction="horizontal" gap={2} className="align-items-center mb-2 border-bottom pb-2">
        <div style={{ width: '40px', height: '40px' }} className="position-relative">
          <Image 
            src={image || '/placeholder-product.png'} 
            alt={name}
            width={40}
            height={40}
            className="object-fit-cover"
          />
          {isAuthenticated && (
            <Badge 
              bg={isSynced ? "success" : "warning"} 
              className="position-absolute bottom-0 end-0"
              style={{ fontSize: '0.6rem' }}
            >
              {isSynced ? <i className="bi bi-cloud-check"></i> : <i className="bi bi-cloud"></i>}
            </Badge>
          )}
        </div>
        <div className="flex-grow-1 d-flex flex-column">
          <span className="fw-medium small text-truncate">{name}</span>
          {variant && <small className="text-muted">{variant.name}</small>}
          <div className="d-flex justify-content-between align-items-center">
            <small>{quantity} × {formatCurrency(price)}</small>
            <Button 
              variant="link" 
              size="sm" 
              className="text-danger p-0" 
              onClick={handleRemove}
            >
              Remove
            </Button>
          </div>
        </div>
      </Stack>
    );
  }
  
  // Full version for cart page
  return (
    <Card className="mb-3 cart-item">
      <Card.Body>
        <div className="d-flex">
          <div className="flex-shrink-0 position-relative" style={{ width: '100px' }}>
            <Image 
              src={image || '/placeholder-product.png'} 
              alt={name}
              className="img-fluid rounded"
            />
            {isAuthenticated && (
              <Badge 
                bg={isSynced ? "success" : "warning"} 
                className="position-absolute bottom-0 end-0"
              >
                {isSynced ? <i className="bi bi-cloud-check"></i> : <i className="bi bi-cloud"></i>}
              </Badge>
            )}
          </div>
          
          <div className="flex-grow-1 ms-3">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5 className="mb-1">{name}</h5>
                {variant && (
                  <div className="mb-2 text-muted">
                    Variant: {variant.name || variant.code}
                  </div>
                )}
                <div className="mb-2 h5">
                  {formatCurrency(price)}
                </div>
              </div>
              
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={handleRemove}
              >
                <i className="bi bi-trash"></i>
              </Button>
            </div>
            
            <div className="mt-3 d-flex align-items-center">
              <Form.Group className="d-flex align-items-center">
                <Form.Label className="me-2 mb-0">Quantity:</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  style={{ width: '70px' }}
                />
              </Form.Group>
              
              <div className="ms-auto">
                <div className="text-end fs-5 fw-bold">
                  {formatCurrency(price * quantity)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CartItem; 