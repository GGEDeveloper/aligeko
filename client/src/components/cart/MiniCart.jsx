import React, { useState } from 'react';
import { Badge, Button, Offcanvas } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import CartList from './CartList';
import CartSummary from './CartSummary';

/**
 * MiniCart component displays a small cart preview in the header
 * 
 * @returns {JSX.Element}
 */
const MiniCart = () => {
  const [show, setShow] = useState(false);
  const { totalItems, emptyCart } = useCart();
  const navigate = useNavigate();
  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  
  const handleCheckout = () => {
    handleClose();
    navigate('/checkout');
  };
  
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      emptyCart();
    }
  };
  
  return (
    <>
      <Button 
        variant="outline-primary" 
        className="position-relative" 
        onClick={handleShow}
        aria-label="Shopping cart"
      >
        <i className="bi bi-cart"></i>
        {totalItems > 0 && (
          <Badge 
            bg="danger" 
            pill 
            className="position-absolute top-0 start-100 translate-middle"
          >
            {totalItems}
          </Badge>
        )}
      </Button>
      
      <Offcanvas show={show} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Your Cart ({totalItems} items)</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-flex flex-column h-100">
            <div className="flex-grow-1 overflow-auto mb-3">
              <CartList compact />
            </div>
            
            {totalItems > 0 && (
              <div className="mb-3">
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  className="w-100"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </Button>
              </div>
            )}
            
            <div className="mt-auto">
              <CartSummary compact onCheckout={handleCheckout} />
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default MiniCart; 