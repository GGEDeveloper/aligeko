import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { 
  useGetOrderByIdQuery, 
  useGetOrderItemsQuery,
  useUpdateOrderMutation,
  useUpdateOrderItemMutation,
  useAddOrderItemMutation,
  useRemoveOrderItemMutation,
  useGetProductsQuery
} from '../../store/api/orderApi';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const OrderEditPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  // State for order data
  const [orderData, setOrderData] = useState({
    customerName: '',
    customerEmail: '',
    status: '',
    paymentStatus: '',
    shippingMethod: '',
    shippingCost: 0,
    tax: 0,
    notes: ''
  });
  
  // State for address data
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  
  const [billingAddress, setBillingAddress] = useState({
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  
  const [sameAsShipping, setSameAsShipping] = useState(false);
  
  // State for order items
  const [orderItems, setOrderItems] = useState([]);
  
  // Item edit dialog
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isNewItem, setIsNewItem] = useState(false);
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Success/error message
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Product search for adding items
  const [searchTerm, setSearchTerm] = useState('');
  const { data: productsData } = useGetProductsQuery(
    { search: searchTerm, limit: 10 },
    { skip: !searchTerm || searchTerm.length < 2 }
  );
  
  // API queries
  const { 
    data: order, 
    isLoading: isOrderLoading, 
    error: orderError 
  } = useGetOrderByIdQuery(orderId);
  
  const { 
    data: itemsData, 
    isLoading: isItemsLoading 
  } = useGetOrderItemsQuery(orderId);
  
  // API mutations
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const [updateOrderItem] = useUpdateOrderItemMutation();
  const [addOrderItem] = useAddOrderItemMutation();
  const [removeOrderItem] = useRemoveOrderItemMutation();
  
  // Initialize form with order data
  useEffect(() => {
    if (order) {
      setOrderData({
        customerName: order.customer?.name || '',
        customerEmail: order.customer?.email || order.email || '',
        status: order.status || 'pending',
        paymentStatus: order.paymentStatus || 'pending',
        shippingMethod: order.shippingMethod || 'Standard Shipping',
        shippingCost: order.shippingCost || 0,
        tax: order.tax || 0,
        notes: order.notes || ''
      });
      
      if (order.shippingAddress) {
        setShippingAddress(order.shippingAddress);
      }
      
      if (order.billingAddress) {
        setBillingAddress(order.billingAddress);
        setSameAsShipping(false);
      } else {
        setBillingAddress({...order.shippingAddress});
        setSameAsShipping(true);
      }
    }
  }, [order]);
  
  // Initialize items
  useEffect(() => {
    if (itemsData) {
      setOrderItems(itemsData);
    }
  }, [itemsData]);
  
  // Handle input changes
  const handleOrderChange = (field) => (event) => {
    setOrderData({
      ...orderData,
      [field]: event.target.value
    });
  };
  
  const handleNumericOrderChange = (field) => (event) => {
    let value = event.target.value;
    
    if (value === '' || value === null) {
      value = 0;
    } else {
      value = parseFloat(value);
    }
    
    setOrderData({
      ...orderData,
      [field]: value
    });
  };
  
  const handleAddressChange = (type, field) => (event) => {
    if (type === 'shipping') {
      const updatedShipping = {
        ...shippingAddress,
        [field]: event.target.value
      };
      
      setShippingAddress(updatedShipping);
      
      // Update billing address if same as shipping
      if (sameAsShipping) {
        setBillingAddress(updatedShipping);
      }
    } else {
      setBillingAddress({
        ...billingAddress,
        [field]: event.target.value
      });
    }
  };
  
  const handleSameAsShippingChange = (event) => {
    const checked = event.target.checked;
    setSameAsShipping(checked);
    
    if (checked) {
      setBillingAddress({...shippingAddress});
    }
  };
  
  // Handle save
  const handleSaveOrder = async () => {
    try {
      const orderPayload = {
        ...orderData,
        shippingAddress,
        billingAddress: sameAsShipping ? null : billingAddress
      };
      
      await updateOrder({ id: orderId, ...orderPayload }).unwrap();
      
      setSnackbar({
        open: true,
        message: 'Order updated successfully',
        severity: 'success'
      });
      
      // Navigate back to order details after short delay
      setTimeout(() => {
        navigate(`/admin/orders/${orderId}`);
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || 'Failed to update order',
        severity: 'error'
      });
    }
  };
  
  // Item dialog handlers
  const handleOpenItemDialog = (item = null) => {
    if (item) {
      setCurrentItem({...item});
      setIsNewItem(false);
    } else {
      setCurrentItem({
        name: '',
        price: 0,
        quantity: 1,
        sku: '',
        productId: null
      });
      setIsNewItem(true);
    }
    setItemDialogOpen(true);
  };
  
  const handleCloseItemDialog = () => {
    setItemDialogOpen(false);
    setCurrentItem(null);
    setSearchTerm('');
  };
  
  const handleItemChange = (field) => (event) => {
    setCurrentItem({
      ...currentItem,
      [field]: field === 'price' || field === 'quantity' 
        ? parseFloat(event.target.value) 
        : event.target.value
    });
  };
  
  const handleSelectProduct = (product) => {
    setCurrentItem({
      ...currentItem,
      name: product.name,
      price: product.price,
      sku: product.sku,
      productId: product.id
    });
    setSearchTerm('');
  };
  
  const handleSaveItem = async () => {
    try {
      if (isNewItem) {
        await addOrderItem({ 
          orderId, 
          item: currentItem 
        }).unwrap();
        
        // Get updated items
        const updated = await useGetOrderItemsQuery(orderId).refetch();
        setOrderItems(updated.data);
        
      } else {
        await updateOrderItem({ 
          orderId, 
          itemId: currentItem.id, 
          item: currentItem 
        }).unwrap();
        
        // Update local state
        setOrderItems(orderItems.map(item => 
          item.id === currentItem.id ? currentItem : item
        ));
      }
      
      setSnackbar({
        open: true,
        message: `Item ${isNewItem ? 'added' : 'updated'} successfully`,
        severity: 'success'
      });
      
      handleCloseItemDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || `Failed to ${isNewItem ? 'add' : 'update'} item`,
        severity: 'error'
      });
    }
  };
  
  // Delete item handlers
  const handleOpenDeleteDialog = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };
  
  const handleDeleteItem = async () => {
    try {
      await removeOrderItem({ 
        orderId, 
        itemId: itemToDelete.id 
      }).unwrap();
      
      // Update local state
      setOrderItems(orderItems.filter(item => item.id !== itemToDelete.id));
      
      setSnackbar({
        open: true,
        message: 'Item removed successfully',
        severity: 'success'
      });
      
      handleCloseDeleteDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || 'Failed to remove item',
        severity: 'error'
      });
    }
  };
  
  // Snackbar close handler
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
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
    const subtotal = orderItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
    
    const tax = parseFloat(orderData.tax) || 0;
    const shipping = parseFloat(orderData.shippingCost) || 0;
    const total = subtotal + tax + shipping;
    
    return { subtotal, tax, shipping, total };
  };
  
  const totals = calculateTotals();
  
  if (isOrderLoading || isItemsLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (orderError) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 3 }}>
          Error loading order: {orderError.message || 'Unknown error'}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/orders')}
          >
            Back to Orders
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/admin/orders/${orderId}`)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveOrder}
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
        
        <Typography variant="h5" gutterBottom>
          Edit Order #{order?.orderNumber || order?.id}
        </Typography>
        
        {/* Order Information Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Order Information</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Customer Name"
                    value={orderData.customerName}
                    onChange={handleOrderChange('customerName')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Customer Email"
                    value={orderData.customerEmail}
                    onChange={handleOrderChange('customerEmail')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={orderData.status}
                    onChange={handleOrderChange('status')}
                    margin="normal"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="shipped">Shipped</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="refunded">Refunded</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Payment Status"
                    value={orderData.paymentStatus}
                    onChange={handleOrderChange('paymentStatus')}
                    margin="normal"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                    <MenuItem value="refunded">Refunded</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Shipping Method"
                    value={orderData.shippingMethod}
                    onChange={handleOrderChange('shippingMethod')}
                    margin="normal"
                  >
                    <MenuItem value="Standard Shipping">Standard Shipping</MenuItem>
                    <MenuItem value="Express Shipping">Express Shipping</MenuItem>
                    <MenuItem value="Next Day Delivery">Next Day Delivery</MenuItem>
                    <MenuItem value="Pickup">In-Store Pickup</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Shipping Cost"
                    type="number"
                    value={orderData.shippingCost}
                    onChange={handleNumericOrderChange('shippingCost')}
                    margin="normal"
                    InputProps={{
                      startAdornment: <span>$</span>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tax"
                    type="number"
                    value={orderData.tax}
                    onChange={handleNumericOrderChange('tax')}
                    margin="normal"
                    InputProps={{
                      startAdornment: <span>$</span>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Order Notes"
                    value={orderData.notes}
                    onChange={handleOrderChange('notes')}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Shipping Address</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={shippingAddress.name}
                    onChange={handleAddressChange('shipping', 'name')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address Line 1"
                    value={shippingAddress.line1}
                    onChange={handleAddressChange('shipping', 'line1')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address Line 2"
                    value={shippingAddress.line2 || ''}
                    onChange={handleAddressChange('shipping', 'line2')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={shippingAddress.city}
                    onChange={handleAddressChange('shipping', 'city')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="State/Province"
                    value={shippingAddress.state}
                    onChange={handleAddressChange('shipping', 'state')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    value={shippingAddress.postalCode}
                    onChange={handleAddressChange('shipping', 'postalCode')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={shippingAddress.country}
                    onChange={handleAddressChange('shipping', 'country')}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Paper>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Billing Address</Typography>
                <Box>
                  <input
                    type="checkbox"
                    id="same-as-shipping"
                    checked={sameAsShipping}
                    onChange={handleSameAsShippingChange}
                  />
                  <label htmlFor="same-as-shipping">Same as shipping</label>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {!sameAsShipping && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={billingAddress.name}
                      onChange={handleAddressChange('billing', 'name')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address Line 1"
                      value={billingAddress.line1}
                      onChange={handleAddressChange('billing', 'line1')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address Line 2"
                      value={billingAddress.line2 || ''}
                      onChange={handleAddressChange('billing', 'line2')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={billingAddress.city}
                      onChange={handleAddressChange('billing', 'city')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="State/Province"
                      value={billingAddress.state}
                      onChange={handleAddressChange('billing', 'state')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Postal Code"
                      value={billingAddress.postalCode}
                      onChange={handleAddressChange('billing', 'postalCode')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={billingAddress.country}
                      onChange={handleAddressChange('billing', 'country')}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              )}
              
              {sameAsShipping && (
                <Typography variant="body2" color="text.secondary">
                  Using shipping address as billing address
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
        
        {/* Order Items Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Order Items</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenItemDialog()}
            >
              Add Item
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" sx={{ py: 2 }}>
                        No items in this order
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  orderItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.sku || 'N/A'}</TableCell>
                      <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.price * item.quantity)}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Tooltip title="Edit Item">
                            <IconButton size="small" onClick={() => handleOpenItemDialog(item)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove Item">
                            <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(item)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px', mb: 1 }}>
              <Typography variant="body1">Subtotal:</Typography>
              <Typography variant="body1">{formatCurrency(totals.subtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px', mb: 1 }}>
              <Typography variant="body1">Shipping:</Typography>
              <Typography variant="body1">{formatCurrency(totals.shipping)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px', mb: 1 }}>
              <Typography variant="body1">Tax:</Typography>
              <Typography variant="body1">{formatCurrency(totals.tax)}</Typography>
            </Box>
            <Divider sx={{ width: '250px', my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">{formatCurrency(totals.total)}</Typography>
            </Box>
          </Box>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveOrder}
            disabled={isUpdating}
            sx={{ ml: 2 }}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
      
      {/* Item Edit Dialog */}
      <Dialog open={itemDialogOpen} onClose={handleCloseItemDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isNewItem ? 'Add New Item' : 'Edit Item'}
        </DialogTitle>
        <DialogContent>
          {isNewItem && (
            <>
              <TextField
                fullWidth
                label="Search Products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                margin="normal"
                placeholder="Type to search products..."
              />
              
              {searchTerm.length >= 2 && productsData?.products && (
                <Box sx={{ mb: 2, maxHeight: '200px', overflow: 'auto' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Search Results
                  </Typography>
                  {productsData.products.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No products found
                    </Typography>
                  ) : (
                    productsData.products.map(product => (
                      <Box 
                        key={product.id}
                        sx={{ 
                          p: 1, 
                          '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' },
                          borderRadius: 1
                        }}
                        onClick={() => handleSelectProduct(product)}
                      >
                        <Typography variant="body1">{product.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.sku} - {formatCurrency(product.price)}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              )}
            </>
          )}
          
          <TextField
            fullWidth
            label="Product Name"
            value={currentItem?.name || ''}
            onChange={handleItemChange('name')}
            margin="normal"
            required
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="SKU"
                value={currentItem?.sku || ''}
                onChange={handleItemChange('sku')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={currentItem?.price || 0}
                onChange={handleItemChange('price')}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <span>$</span>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={currentItem?.quantity || 1}
                onChange={handleItemChange('quantity')}
                margin="normal"
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>
          
          {currentItem && (
            <Box sx={{ mt: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Item Total:</strong> {formatCurrency((currentItem.price || 0) * (currentItem.quantity || 0))}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseItemDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveItem} 
            variant="contained" 
            disabled={!currentItem?.name || !currentItem?.price}
          >
            {isNewItem ? 'Add Item' : 'Update Item'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Item Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Remove Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove "{itemToDelete?.name}" from this order?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteItem} variant="contained" color="error">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        action={
          <IconButton size="small" color="inherit" onClick={handleCloseSnackbar}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Container>
  );
};

export default OrderEditPage; 