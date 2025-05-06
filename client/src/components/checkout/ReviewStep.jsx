import React from 'react';
import { Card, Button, Row, Col, ListGroup, Spinner } from 'react-bootstrap';
import { formatCurrency } from '../../utils/formatters';

/**
 * ReviewStep component for reviewing order details before placing order
 * 
 * @param {Object} props
 * @param {Object} props.checkoutData - All checkout data (address, shipping, payment)
 * @param {Array} props.cartItems - Cart items
 * @param {number} props.subtotal - Order subtotal
 * @param {number} props.tax - Tax amount
 * @param {number} props.shipping - Shipping cost
 * @param {number} props.total - Order total
 * @param {Function} props.onPlaceOrder - Function to place order
 * @param {Function} props.onPrev - Function to go back to previous step
 * @param {boolean} props.isPlacingOrder - Whether the order is currently being placed
 * @returns {JSX.Element}
 */
const ReviewStep = ({ 
  checkoutData, 
  cartItems, 
  subtotal, 
  tax, 
  shipping, 
  total, 
  onPlaceOrder, 
  onPrev,
  isPlacingOrder
}) => {
  const { address, shipping: shippingOption, payment } = checkoutData;
  
  // Format payment method display
  const getPaymentDisplay = () => {
    switch (payment?.method) {
      case 'credit_card':
        return (
          <>
            <div>Credit Card</div>
            <div className="text-muted small">
              Card ending in {payment.cardData?.cardNumber?.slice(-4) || 'XXXX'}
            </div>
          </>
        );
      case 'wire_transfer':
        return (
          <>
            <div>Wire Transfer</div>
            <div className="text-muted small">
              Bank: {payment.wireData?.bankName || 'Not specified'}
            </div>
          </>
        );
      case 'purchase_order':
        return (
          <>
            <div>Purchase Order</div>
            <div className="text-muted small">
              PO #: {payment.purchaseOrder?.poNumber || 'Not specified'}
            </div>
          </>
        );
      default:
        return <div>Payment method not selected</div>;
    }
  };
  
  return (
    <Card className="mb-4">
      <Card.Header className="bg-light">
        <h4 className="mb-0">Review Order</h4>
      </Card.Header>
      <Card.Body>
        <Row className="mb-4">
          <Col md={4}>
            <h5>Shipping Address</h5>
            {address ? (
              <div>
                <div className="fw-medium">{address.name}</div>
                <div>{address.street}</div>
                <div>{address.city}, {address.state} {address.zipCode}</div>
                <div>{address.country}</div>
              </div>
            ) : (
              <div className="text-danger">No shipping address selected</div>
            )}
          </Col>
          <Col md={4}>
            <h5>Shipping Method</h5>
            {shippingOption ? (
              <div>
                <div className="fw-medium">{shippingOption.name}</div>
                <div className="text-muted">{shippingOption.description}</div>
                <div>
                  {shippingOption.price === 0 
                    ? 'Free' 
                    : `${formatCurrency(shippingOption.price)}`}
                </div>
              </div>
            ) : (
              <div className="text-danger">No shipping method selected</div>
            )}
          </Col>
          <Col md={4}>
            <h5>Payment Method</h5>
            {payment ? (
              getPaymentDisplay()
            ) : (
              <div className="text-danger">No payment method selected</div>
            )}
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <h5 className="mb-3">Order Items ({cartItems.length})</h5>
        <ListGroup className="mb-4">
          {cartItems.map(item => (
            <ListGroup.Item key={item.id + (item.variant?.id || '')}>
              <div className="d-flex">
                <div className="flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                  <img 
                    src={item.image || '/placeholder-product.png'} 
                    alt={item.name}
                    className="img-fluid rounded"
                  />
                </div>
                <div className="ms-3 flex-grow-1">
                  <div className="d-flex justify-content-between">
                    <div className="fw-medium">{item.name}</div>
                    <div className="fw-medium">{formatCurrency(item.price * item.quantity)}</div>
                  </div>
                  {item.variant && (
                    <div className="text-muted small">
                      Variant: {item.variant.name || item.variant.code}
                    </div>
                  )}
                  <div className="text-muted">
                    {item.quantity} × {formatCurrency(item.price)}
                  </div>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
        
        <Row>
          <Col md={6}>
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              By placing your order, you agree to our terms and conditions and privacy policy.
            </div>
          </Col>
          <Col md={6}>
            <div className="bg-light p-3 rounded">
              <h5 className="mb-3">Order Summary</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-bold">Total:</span>
                <span className="fw-bold fs-5">{formatCurrency(total)}</span>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
      <Card.Footer className="d-flex justify-content-between">
        <Button 
          variant="outline-secondary" 
          onClick={onPrev}
          disabled={isPlacingOrder}
        >
          Back to Payment
        </Button>
        <Button 
          variant="primary" 
          size="lg"
          onClick={onPlaceOrder}
          disabled={isPlacingOrder || !address || !shippingOption || !payment}
        >
          {isPlacingOrder ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Processing Order...
            </>
          ) : (
            'Place Order'
          )}
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default ReviewStep; 