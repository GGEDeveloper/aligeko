import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as DocIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useGetOrderByIdQuery, useGetOrderItemsQuery } from '../../store/api/orderApi';

// Use an inline SVG logo instead of an external file
const companyLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgODAiPjxwYXRoIGZpbGw9IiMwNDRhODgiIGQ9Ik00MCAyMGg0MHY0MEg0MHoiLz48cGF0aCBmaWxsPSIjMDQ0YTg4IiBkPSJNMTYwIDIwaDQwdjQwaC00MHoiLz48cGF0aCBmaWxsPSIjMDc3MWI2IiBkPSJNMTAwIDIwaDQwdjQwaC00MHoiLz48dGV4dCB4PSI1MCIgeT0iNjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzA0NGE4OCI+QWxpVG9vbHM8L3RleHQ+PC9zdmc+";

const InvoicePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef();
  
  // State for download menu
  const [downloadAnchorEl, setDownloadAnchorEl] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState(null);
  
  // Queries for order data
  const {
    data: order,
    isLoading: isOrderLoading,
    error: orderError
  } = useGetOrderByIdQuery(orderId);
  
  const {
    data: orderItems,
    isLoading: isItemsLoading
  } = useGetOrderItemsQuery(orderId);
  
  // Handle print functionality
  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Invoice-${order?.orderNumber || order?.id}`,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        resolve();
      });
    }
  });
  
  // Handle download menu
  const handleOpenDownloadMenu = (event) => {
    setDownloadAnchorEl(event.currentTarget);
  };
  
  const handleCloseDownloadMenu = () => {
    setDownloadAnchorEl(null);
  };
  
  // Handle download in different formats
  const handleDownload = async (format) => {
    setDownloadFormat(format);
    setIsDownloading(true);
    
    try {
      // Generate download URL
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/v1';
      const downloadUrl = `${baseUrl}/orders/${orderId}/invoice?format=${format}`;
      
      // Fetch the file
      const token = localStorage.getItem('token');
      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `invoice-${order?.orderNumber || order?.id}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      } else {
        // Default filename with extension
        filename = `${filename}.${format === 'pdf' ? 'pdf' : format === 'doc' ? 'docx' : 'pdf'}`;
      }
      
      // Create and trigger download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
      setDownloadFormat(null);
      handleCloseDownloadMenu();
    }
  };
  
  // Handle email invoice
  const handleEmailInvoice = async () => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/v1';
      const emailUrl = `${baseUrl}/orders/${orderId}/invoice/email`;
      
      const token = localStorage.getItem('token');
      const response = await fetch(emailUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to send invoice email');
      }
      
      // Show success message (you would use a toast or snackbar in a real app)
      alert('Invoice sent successfully!');
    } catch (error) {
      console.error('Email error:', error);
      alert('Failed to send invoice. Please try again.');
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Calculate order totals
  const calculateTotals = () => {
    if (!orderItems) return { subtotal: 0, tax: 0, shipping: 0, total: 0 };
    
    const subtotal = orderItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
    
    const tax = order?.tax || 0;
    const shipping = order?.shippingCost || 0;
    const total = subtotal + tax + shipping;
    
    return { subtotal, tax, shipping, total };
  };
  
  const totals = calculateTotals();
  
  // Current date for invoice
  const currentDate = format(new Date(), 'MMMM dd, yyyy');
  
  // Loading state
  if (isOrderLoading || isItemsLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  // Error state
  if (orderError) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 3 }}>
          Error loading order: {orderError.message || 'Unknown error'}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/admin/orders/${orderId}`)}
          >
            Back to Order
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/admin/orders/${orderId}`)}
          >
            Back to Order
          </Button>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Print
            </Button>
            
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleOpenDownloadMenu}
              disabled={isDownloading}
            >
              {isDownloading ? `Downloading ${downloadFormat}...` : 'Download'}
            </Button>
            
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleEmailInvoice}
            >
              Email
            </Button>
          </Stack>
        </Box>
        
        {/* Download Menu */}
        <Menu
          anchorEl={downloadAnchorEl}
          open={Boolean(downloadAnchorEl)}
          onClose={handleCloseDownloadMenu}
        >
          <MenuItem onClick={() => handleDownload('pdf')}>
            <ListItemIcon>
              <PdfIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>PDF</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleDownload('doc')}>
            <ListItemIcon>
              <DocIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Word Document</ListItemText>
          </MenuItem>
        </Menu>
        
        {/* Invoice Content */}
        <Paper sx={{ p: 4, mb: 3 }} ref={invoiceRef}>
          {/* Invoice Header */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Box>
                <img 
                  src={companyLogo} 
                  alt="AliTools Logo" 
                  style={{ maxWidth: 150, height: 'auto' }} 
                />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  AliTools B2B E-commerce
                </Typography>
                <Typography variant="body2">
                  123 Commerce Avenue
                </Typography>
                <Typography variant="body2">
                  New York, NY 10001
                </Typography>
                <Typography variant="body2">
                  United States
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  support@alitools.com
                </Typography>
                <Typography variant="body2">
                  +1 (555) 123-4567
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                  INVOICE
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Invoice No:</strong> INV-{order?.orderNumber || order?.id}
                </Typography>
                <Typography variant="body1">
                  <strong>Order No:</strong> #{order?.orderNumber || order?.id}
                </Typography>
                <Typography variant="body1">
                  <strong>Date:</strong> {currentDate}
                </Typography>
                <Typography variant="body1">
                  <strong>Order Date:</strong> {format(new Date(order?.createdAt), 'MMMM dd, yyyy')}
                </Typography>
                <Typography variant="body1" sx={{ 
                  mt: 1, 
                  py: 0.5, 
                  px: 1, 
                  bgcolor: '#f5f5f5', 
                  display: 'inline-block',
                  borderRadius: 1
                }}>
                  <strong>Status:</strong> {order?.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ mb: 3 }} />
          
          {/* Customer Information */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                BILL TO
              </Typography>
              <Typography variant="body1">
                {order?.customer?.name || order?.billingAddress?.name || 'N/A'}
              </Typography>
              <Typography variant="body2">
                {order?.customer?.email || 'N/A'}
              </Typography>
              
              {order?.billingAddress && (
                <>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {order.billingAddress.line1}
                  </Typography>
                  {order.billingAddress.line2 && (
                    <Typography variant="body2">
                      {order.billingAddress.line2}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
                  </Typography>
                  <Typography variant="body2">
                    {order.billingAddress.country}
                  </Typography>
                </>
              )}
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                SHIP TO
              </Typography>
              <Typography variant="body1">
                {order?.shippingAddress?.name || 'N/A'}
              </Typography>
              
              {order?.shippingAddress && (
                <>
                  <Typography variant="body2">
                    {order.shippingAddress.line1}
                  </Typography>
                  {order.shippingAddress.line2 && (
                    <Typography variant="body2">
                      {order.shippingAddress.line2}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </Typography>
                  <Typography variant="body2">
                    {order.shippingAddress.country}
                  </Typography>
                </>
              )}
              
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Shipping Method:</strong> {order?.shippingMethod || 'Standard Shipping'}
              </Typography>
            </Grid>
          </Grid>
          
          {/* Order Items */}
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Price</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderItems?.length > 0 ? (
                  orderItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.sku || 'N/A'}</TableCell>
                      <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.price * item.quantity)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Order Summary */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Box sx={{ width: 300 }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body1">Subtotal:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right">
                    {formatCurrency(totals.subtotal)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body1">Shipping:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right">
                    {formatCurrency(totals.shipping)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body1">Tax:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right">
                    {formatCurrency(totals.tax)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="h6">Total:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" align="right">
                    {formatCurrency(totals.total)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
          
          {/* Payment Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              PAYMENT INFORMATION
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Payment Method:</strong> {order?.paymentMethod || 'Credit Card'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Payment Status:</strong> {order?.paymentStatus || 'pending'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          {/* Notes */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              NOTES
            </Typography>
            <Typography variant="body2">
              {order?.notes || 'Thank you for your business!'}
            </Typography>
          </Box>
          
          {/* Terms and Conditions */}
          <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              TERMS AND CONDITIONS
            </Typography>
            <Typography variant="body2">
              Payment is due within 30 days. Please make checks payable to AliTools B2B E-commerce or pay via bank transfer using the details provided. For any questions regarding this invoice, please contact our customer service team.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default InvoicePage; 