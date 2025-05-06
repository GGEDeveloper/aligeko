import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Alert, Spinner } from 'react-bootstrap';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCart } from '../../hooks/useCart';
import { usePlaceOrderMutation } from '../../store/api/orderApi';
import AddressStep from '../../components/checkout/AddressStep';
import ShippingStep from '../../components/checkout/ShippingStep';
import PaymentStep from '../../components/checkout/PaymentStep';
import ReviewStep from '../../components/checkout/ReviewStep';
import { formatCurrency } from '../../utils/formatters';

/**
 * CheckoutPage component with multi-step checkout process
 * 
 * @returns {JSX.Element}
 */
const CheckoutPage = () => {
  const { isAuthenticated, user, customer } = useSelector(state => state.auth);
  const { cartItems, totalAmount, syncCart, clearCart } = useCart();
  const [placeOrder, { isLoading: isPlacingOrder }] = usePlaceOrderMutation();
  const navigate = useNavigate();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState({
    address: null,
    shipping: null,
    payment: null
  });
  const [error, setError] = useState(null);
  
  // Calculate total with tax and shipping
  const taxRate = 0.1;
  const subtotal = totalAmount;
  const taxAmount = subtotal * taxRate;
  const shippingAmount = checkoutData.shipping?.price || 0;
  const total = subtotal + taxAmount + shippingAmount;
  
  // Sync cart with server on component mount
  useEffect(() => {
    if (isAuthenticated) {
      syncCart().catch(err => {
        console.error('Error syncing cart:', err);
        setError('Failed to sync cart with server. Please try again.');
      });
    }
  }, [isAuthenticated, syncCart]);
  
  // Redirect if cart is empty or user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: '/checkout' }} />;
  }
  
  if (cartItems.length === 0) {
    return <Navigate to="/cart" replace />;
  }
  
  // Handle step data updates
  const updateCheckoutData = (step, data) => {
    setCheckoutData(prev => ({
      ...prev,
      [step]: data
    }));
  };
  
  // Navigate to next step
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Handle order placement
  const handlePlaceOrder = async () => {
    try {
      // Validate checkout data
      if (!checkoutData.address || !checkoutData.shipping || !checkoutData.payment) {
        setError('Please complete all required information before placing your order.');
        return;
      }
      
      // Prepare order data
      const orderData = {
        customer_id: customer?.id,
        shipping_address_id: checkoutData.address.id,
        billing_address_id: checkoutData.address.id, // Using same address for billing
        items: cartItems.map(item => ({
          variant_id: item.variant?.id,
          product_id: item.product_id || item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          tax_rate: taxRate,
          tax_amount: item.price * item.quantity * taxRate
        })),
        shipping_method: checkoutData.shipping.id,
        payment_method: checkoutData.payment.method,
        payment_details: {
          ...checkoutData.payment
        },
        total_amount: total,
        subtotal_amount: subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        notes: ''
      };
      
      // Call the API to place the order
      const response = await placeOrder(orderData).unwrap();
      
      // Clear cart and redirect to success page
      await clearCart();
      
      // Navigate to success page with order info
      navigate('/checkout/success', { 
        state: { 
          orderId: response.id,
          orderNumber: response.order_number
        }
      });
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.data?.message || 'Failed to place order. Please try again.');
    }
  };
  
  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <AddressStep 
            onNext={nextStep} 
            value={checkoutData.address}
            onChange={(data) => updateCheckoutData('address', data)}
          />
        );
      case 2:
        return (
          <ShippingStep 
            onNext={nextStep} 
            onPrev={prevStep}
            value={checkoutData.shipping}
            onChange={(data) => updateCheckoutData('shipping', data)}
          />
        );
      case 3:
        return (
          <PaymentStep 
            onNext={nextStep} 
            onPrev={prevStep}
            value={checkoutData.payment}
            onChange={(data) => updateCheckoutData('payment', data)}
          />
        );
      case 4:
        return (
          <ReviewStep 
            checkoutData={checkoutData}
            cartItems={cartItems}
            subtotal={subtotal}
            tax={taxAmount}
            shipping={shippingAmount}
            total={total}
            onPlaceOrder={handlePlaceOrder}
            onPrev={prevStep}
            isPlacingOrder={isPlacingOrder}
          />
        );
      default:
        return null;
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = (currentStep / 4) * 100;
  
  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1>Checkout</h1>
        </Col>
      </Row>
      
      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}
      
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <div className={`step-indicator ${currentStep >= 1 ? 'active' : ''}`}>
                  <span className="step-number">1</span>
                  <span className="step-title">Address</span>
                </div>
                <div className={`step-indicator ${currentStep >= 2 ? 'active' : ''}`}>
                  <span className="step-number">2</span>
                  <span className="step-title">Shipping</span>
                </div>
                <div className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}>
                  <span className="step-number">3</span>
                  <span className="step-title">Payment</span>
                </div>
                <div className={`step-indicator ${currentStep >= 4 ? 'active' : ''}`}>
                  <span className="step-number">4</span>
                  <span className="step-title">Review</span>
                </div>
              </div>
              <ProgressBar now={progressPercentage} className="mb-3" />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col lg={8}>
          {renderStepContent()}
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax ({(taxRate * 100).toFixed(0)}%):</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>
                  {checkoutData.shipping 
                    ? formatCurrency(shippingAmount) 
                    : 'To be determined'}
                </span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold">Total:</span>
                <span className="fw-bold fs-5">{formatCurrency(total)}</span>
              </div>
              
              <div className="d-grid">
                {currentStep < 4 ? (
                  <Button 
                    variant="primary"
                    onClick={nextStep}
                  >
                    Continue to {
                      currentStep === 1 ? 'Shipping' : 
                      currentStep === 2 ? 'Payment' :
                      'Review'
                    }
                  </Button>
                ) : (
                  <Button 
                    variant="primary"
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header className="bg-light">
              <h5 className="mb-0">Order Items ({cartItems.length})</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="checkout-items-list">
                {cartItems.map(item => (
                  <div key={item.id + (item.variant?.id || '')} className="d-flex p-3 border-bottom">
                    <div className="flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                      <img 
                        src={item.image || '/placeholder-product.png'} 
                        alt={item.name}
                        className="img-fluid rounded"
                      />
                    </div>
                    <div className="ms-3">
                      <div className="fw-medium">{item.name}</div>
                      {item.variant && (
                        <div className="text-muted small">
                          Variant: {item.variant.name || item.variant.code}
                        </div>
                      )}
                      <div className="d-flex justify-content-between mt-1">
                        <span>{item.quantity} × {formatCurrency(item.price)}</span>
                        <span className="fw-medium">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage; 