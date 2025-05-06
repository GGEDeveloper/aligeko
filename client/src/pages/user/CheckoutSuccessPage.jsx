import React, { useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../store/slices/cartSlice';
import { useGetOrderByIdQuery } from '../../store/api/orderApi';
import { formatCurrency } from '../../utils/formatters';
import { useReactToPrint } from 'react-to-print';
import OrderTracking from '../../components/checkout/OrderTracking';
import '../../components/checkout/OrderTracking.css';

/**
 * CheckoutSuccessPage shown after a successful order placement
 * 
 * @returns {JSX.Element}
 */
const CheckoutSuccessPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const printReceiptRef = useRef();
  
  // Get order data from navigation state
  const orderData = location.state || {};
  const { orderId, orderNumber } = orderData;
  
  // Fetch complete order details if we have an ID
  const { data: orderDetails, isLoading, error } = useGetOrderByIdQuery(
    orderId, 
    { skip: !orderId }
  );
  
  // If no order data, redirect to home
  if (!orderId && !orderNumber) {
    return <Navigate to="/" replace />;
  }
  
  // Clear cart on successful order completion
  useEffect(() => {
    dispatch(clearCart());
    // Server cart was already cleared during order placement
  }, [dispatch]);
  
  // Handle print functionality
  const handlePrint = useReactToPrint({
    content: () => printReceiptRef.current,
    documentTitle: `AliTools-Receipt-${orderNumber}`,
    onAfterPrint: () => console.log('Receipt printed successfully')
  });
  
  // Calculate estimated delivery date (14 days from now)
  const orderDate = orderDetails?.placed_at ? new Date(orderDetails.placed_at) : new Date();
  const estimatedDelivery = new Date(orderDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  
  // Get shipping date from order details if available
  const shippingDate = orderDetails?.shipments?.[0]?.shipping_date 
    ? new Date(orderDetails.shipments[0].shipping_date) 
    : null;
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center mb-5">
        <Col md={8} lg={6} className="text-center">
          <div className="success-animation">
            <div className="success-checkmark">
              <div className="check-icon">
                <span className="icon-line line-tip"></span>
                <span className="icon-line line-long"></span>
                <div className="icon-circle"></div>
                <div className="icon-fix"></div>
              </div>
            </div>
          </div>
          
          <h1 className="mb-4">Order Placed Successfully!</h1>
          <p className="lead mb-4">
            Thank you for your order. We've received your purchase request and are working on it now.
          </p>
          
          <Card className="mb-4">
            <Card.Body>
              <h5 className="card-title text-primary mb-4">Order Details</h5>
              
              <div className="row mb-3">
                <div className="col-6 text-start text-muted">Order Number:</div>
                <div className="col-6 text-end fw-bold">{orderNumber}</div>
              </div>
              
              <div className="row mb-3">
                <div className="col-6 text-start text-muted">Order Date:</div>
                <div className="col-6 text-end">{orderDate.toLocaleDateString()}</div>
              </div>
              
              <div className="row mb-3">
                <div className="col-6 text-start text-muted">Estimated Delivery:</div>
                <div className="col-6 text-end">{estimatedDelivery.toLocaleDateString()}</div>
              </div>
            </Card.Body>
          </Card>
          
          <div className="d-grid gap-3 mb-5">
            <Button as={Link} to={`/orders/${orderId}`} variant="primary">
              View Order Details
            </Button>
            
            <Button variant="outline-primary" onClick={handlePrint}>
              <i className="bi bi-printer me-2"></i>
              Print Receipt
            </Button>
            
            <Button as={Link} to="/products" variant="outline-secondary">
              Continue Shopping
            </Button>
          </div>
        </Col>
      </Row>
      
      <Row className="justify-content-center mb-5">
        <Col md={10} lg={8}>
          <Card>
            <Card.Header className="bg-light">
              <h5 className="mb-0">Track Your Order</h5>
            </Card.Header>
            <Card.Body>
              <OrderTracking 
                status={orderDetails?.status || 'pending'}
                orderDate={orderDate}
                estimatedDelivery={estimatedDelivery}
                shippedDate={shippingDate}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <div style={{ display: 'none' }}>
        <div ref={printReceiptRef} className="receipt-container p-4">
          <div className="text-center mb-4">
            <h2>AliTools B2B</h2>
            <h4>Order Receipt</h4>
          </div>
          
          <div className="row mb-4">
            <div className="col-6">
              <h5>Order Information</h5>
              <p>
                <strong>Order Number:</strong> {orderNumber}<br />
                <strong>Order Date:</strong> {orderDate.toLocaleDateString()}<br />
                <strong>Payment Method:</strong> {orderDetails?.payment_method || 'Credit Card'}<br />
              </p>
            </div>
            <div className="col-6">
              <h5>Shipping Information</h5>
              <p>
                <strong>Estimated Delivery:</strong> {estimatedDelivery.toLocaleDateString()}<br />
                <strong>Shipping Method:</strong> {orderDetails?.shipping_method || 'Standard Shipping'}<br />
              </p>
            </div>
          </div>
          
          <h5>Order Items</h5>
          <Table bordered className="mb-4">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails?.items?.map(item => (
                <tr key={item.id}>
                  <td>{item.product?.name || 'Product'}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.unit_price)}</td>
                  <td>{formatCurrency(item.total_price)}</td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="4" className="text-center">Order items not available for print</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-end"><strong>Subtotal:</strong></td>
                <td>{formatCurrency(orderDetails?.subtotal_amount || 0)}</td>
              </tr>
              <tr>
                <td colSpan="3" className="text-end"><strong>Tax:</strong></td>
                <td>{formatCurrency(orderDetails?.tax_amount || 0)}</td>
              </tr>
              <tr>
                <td colSpan="3" className="text-end"><strong>Shipping:</strong></td>
                <td>{formatCurrency(orderDetails?.shipping_amount || 0)}</td>
              </tr>
              <tr>
                <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                <td className="fw-bold">{formatCurrency(orderDetails?.total_amount || 0)}</td>
              </tr>
            </tfoot>
          </Table>
          
          <div className="row">
            <div className="col-12">
              <p className="text-center">
                Thank you for your business with AliTools B2B!<br />
                For any questions, please contact our customer support at support@alitools.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CheckoutSuccessPage; 