import React, { useState } from 'react';
import { Button, Col, Container, Row, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CartList from '../../components/cart/CartList';
import CartSummary from '../../components/cart/CartSummary';
import { useCart } from '../../hooks/useCart';

/**
 * CartPage displays the full shopping cart with items and summary
 * 
 * @returns {JSX.Element}
 */
const CartPage = () => {
  const [syncStatus, setSyncStatus] = useState({ loading: false, success: false, error: null });
  const { cartItems, emptyCart, syncCart, isSyncing } = useCart();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      emptyCart();
    }
  };
  
  const handleCheckout = () => {
    // If not authenticated, redirect to login first
    if (!isAuthenticated) {
      navigate('/auth/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  const handleSyncCart = async () => {
    setSyncStatus({ loading: true, success: false, error: null });
    try {
      await syncCart();
      setSyncStatus({ loading: false, success: true, error: null });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSyncStatus(prev => ({ ...prev, success: false }));
      }, 3000);
    } catch (error) {
      setSyncStatus({ loading: false, success: false, error: error.message || 'Failed to sync cart' });
    }
  };
  
  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col md={8}>
          <h1>Shopping Cart</h1>
          <p className="text-muted">
            You have {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart.
          </p>
        </Col>
        <Col md={4} className="d-flex align-items-center justify-content-md-end">
          {cartItems.length > 0 && (
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleCheckout}
              className="w-100 w-md-auto"
            >
              <i className="bi bi-cart-check me-2"></i>
              Proceed to Checkout
            </Button>
          )}
        </Col>
      </Row>
      
      {syncStatus.success && (
        <Row className="mb-3">
          <Col>
            <Alert variant="success" dismissible onClose={() => setSyncStatus(prev => ({ ...prev, success: false }))}>
              Cart synced successfully!
            </Alert>
          </Col>
        </Row>
      )}
      
      {syncStatus.error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setSyncStatus(prev => ({ ...prev, error: null }))}>
              {syncStatus.error}
            </Alert>
          </Col>
        </Row>
      )}
      
      {!isAuthenticated && cartItems.length > 0 && (
        <Row className="mb-3">
          <Col>
            <Alert variant="info">
              <i className="bi bi-info-circle-fill me-2"></i>
              Please <Link to="/auth/login" className="alert-link">log in</Link> to save your cart and complete checkout.
            </Alert>
          </Col>
        </Row>
      )}
      
      {cartItems.length > 0 ? (
        <Row>
          <Col lg={8} className="mb-4 mb-lg-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h4">Cart Items</h2>
              <div className="d-flex gap-2">
                {isAuthenticated && (
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={handleSyncCart}
                    disabled={syncStatus.loading || isSyncing}
                  >
                    {(syncStatus.loading || isSyncing) ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cloud-arrow-up me-1"></i>
                        Sync Cart
                      </>
                    )}
                  </Button>
                )}
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={handleClearCart}
                >
                  <i className="bi bi-trash me-1"></i>
                  Clear Cart
                </Button>
              </div>
            </div>
            
            <CartList />
          </Col>
          
          <Col lg={4}>
            <CartSummary onCheckout={handleCheckout} />
          </Col>
        </Row>
      ) : (
        <Row className="justify-content-center">
          <Col md={8} lg={6} className="text-center">
            <div className="py-5">
              <i className="bi bi-cart-x display-1 text-muted mb-4"></i>
              <h2>Your cart is empty</h2>
              <p className="mb-4">
                Looks like you haven't added any products to your cart yet.
              </p>
              <Link to="/products" className="btn btn-primary btn-lg">
                Start Shopping
              </Link>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CartPage; 