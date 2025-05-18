import React, { useEffect, useRef } from 'react';
import { Container, Box, Typography, Button, Table } from '@mui/material';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../store/slices/cartSlice';
import { useGetOrderByIdQuery } from '../../store/api/orderApi';
import { formatCurrency } from '../../utils/formatters';
import { useReactToPrint } from 'react-to-print';
import OrderTracking from '../../components/checkout/OrderTracking';
import { styled } from '@mui/material/styles';
import {
  Print as PrintIcon,
  ShoppingCart as ShoppingCartIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

/**
 * CheckoutSuccessPage shown after a successful order placement
 *
 * @returns {JSX.Element}
 */
const CheckoutSuccessPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const printReceiptRef = useRef();

  // Handle print functionality
  const handlePrint = useReactToPrint({
    content: () => printReceiptRef.current,
    documentTitle: `AliTools-Receipt-${orderNumber}`,
    onAfterPrint: () => console.log('Receipt printed successfully'),
  });

  // Get order data from navigation state
  const orderData = location.state || {};
  const { orderId, orderNumber } = orderData;

  // Fetch complete order details if we have an ID
  const {
    data: orderDetails,
    isLoading,
    error,
  } = useGetOrderByIdQuery(orderId, { skip: !orderId });

  // Clear cart on successful order completion
  useEffect(() => {
    dispatch(clearCart());
    // Server cart was already cleared during order placement
  }, [dispatch]);

  // If no order data, redirect to home
  if (!orderId && !orderNumber) {
    return <Navigate to="/" replace />;
  }

  // Theme is not currently used, removed to fix lint error

  // Calculate dates
  const orderDate = orderDetails?.placed_at ? new Date(orderDetails.placed_at) : new Date();
  const estimatedDelivery = orderDetails?.estimated_delivery
    ? new Date(orderDetails.estimated_delivery)
    : new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000);
  const shippingDate = orderDetails?.shipped_at ? new Date(orderDetails.shipped_at) : null;

  // Handle track package
  const handleTrackPackage = () => {
    if (orderDetails?.tracking_url) {
      window.open(orderDetails.tracking_url, '_blank');
    } else if (orderDetails?.tracking_number) {
      // Open generic tracking page with tracking number if no specific URL is provided
      window.open(
        `https://www.google.com/search?q=track+${orderDetails.tracking_number}`,
        '_blank'
      );
    }
  };

  // Get order status for tracking
  const getOrderStatus = () => {
    if (orderDetails?.status) {
      return orderDetails.status.toLowerCase();
    }
    return 'pending';
  };

  // Get carrier information
  const getCarrierInfo = () => {
    if (orderDetails?.shipping_carrier) {
      return orderDetails.shipping_carrier;
    }
    return orderDetails?.shipping_method === 'express'
      ? 'Transportadora Expressa'
      : 'Transportadora Padrão';
  };

  // Styled components
  const StyledButton = styled(Button)(({ theme }) => ({
    textTransform: 'none',
    fontWeight: 500,
    padding: '8px 16px',
    borderRadius: '8px',
    boxShadow: 'none',
    '&:hover': {
      boxShadow: theme.shadows[2],
    },
  }));

  const SuccessIcon = styled('div')({
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#e8f5e9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    '& svg': {
      fontSize: '48px',
      color: '#4caf50',
    },
  });

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Carregando detalhes do pedido...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          Ocorreu um erro ao carregar os detalhes do pedido.
        </Typography>
        <Button variant="contained" color="primary" component={Link} to="/" sx={{ mt: 2 }}>
          Voltar para a Página Inicial
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <SuccessIcon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </SuccessIcon>

        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, color: 'primary.main' }}
        >
          Pedido Realizado com Sucesso!
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          paragraph
          sx={{ maxWidth: '700px', mx: 'auto', mb: 4 }}
        >
          Seu pedido <strong>#{orderNumber}</strong> foi confirmado e está sendo processado.
          Enviamos os detalhes para <strong>{orderDetails?.customer_email || 'seu e-mail'}</strong>.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 6 }}>
          <StyledButton
            variant="contained"
            color="primary"
            component={Link}
            to={`/orders/${orderId}`}
            startIcon={<InfoIcon />}
          >
            Ver Detalhes do Pedido
          </StyledButton>

          <StyledButton
            variant="outlined"
            color="primary"
            onClick={handlePrint}
            startIcon={<PrintIcon />}
          >
            Imprimir Recibo
          </StyledButton>

          <StyledButton
            variant="outlined"
            color="secondary"
            component={Link}
            to="/products"
            startIcon={<ShoppingCartIcon />}
          >
            Continuar Comprando
          </StyledButton>
        </Box>
      </Box>

      {/* Order Tracking Section */}
      <Box sx={{ mb: 8 }}>
        <OrderTracking
          status={getOrderStatus()}
          orderDate={orderDate}
          estimatedDelivery={estimatedDelivery}
          shippedDate={shippingDate}
          trackingNumber={orderDetails?.tracking_number}
          carrier={getCarrierInfo()}
          onTrackPackage={handleTrackPackage}
        />
      </Box>

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
                <strong>Order Number:</strong> {orderNumber}
                <br />
                <strong>Order Date:</strong> {orderDate.toLocaleDateString()}
                <br />
                <strong>Payment Method:</strong> {orderDetails?.payment_method || 'Credit Card'}
                <br />
              </p>
            </div>
            <div className="col-6">
              <h5>Shipping Information</h5>
              <p>
                <strong>Estimated Delivery:</strong> {estimatedDelivery.toLocaleDateString()}
                <br />
                <strong>Shipping Method:</strong>{' '}
                {orderDetails?.shipping_method || 'Standard Shipping'}
                <br />
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
                  <td colSpan="4" className="text-center">
                    Order items not available for print
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-end">
                  <strong>Subtotal:</strong>
                </td>
                <td>{formatCurrency(orderDetails?.subtotal_amount || 0)}</td>
              </tr>
              <tr>
                <td colSpan="3" className="text-end">
                  <strong>Tax:</strong>
                </td>
                <td>{formatCurrency(orderDetails?.tax_amount || 0)}</td>
              </tr>
              <tr>
                <td colSpan="3" className="text-end">
                  <strong>Shipping:</strong>
                </td>
                <td>{formatCurrency(orderDetails?.shipping_amount || 0)}</td>
              </tr>
              <tr>
                <td colSpan="3" className="text-end">
                  <strong>Total:</strong>
                </td>
                <td className="fw-bold">{formatCurrency(orderDetails?.total_amount || 0)}</td>
              </tr>
            </tfoot>
          </Table>

          <div className="row">
            <div className="col-12">
              <p className="text-center">
                Thank you for your business with AliTools B2B!
                <br />
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
