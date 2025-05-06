import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  TextField,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  LocalShipping as ShippingIcon,
  Email as EmailIcon,
  History as HistoryIcon,
  NoteAdd as AddNoteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import {
  useGetOrderByIdQuery,
  useGetOrderItemsQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
  useGetOrderShipmentsQuery
} from '../../store/api/orderApi';
import { format } from 'date-fns';
import InvoiceManager from '../../components/orders/InvoiceManager';
import ReturnRefundManager from '../../components/orders/ReturnRefundManager';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`order-tabpanel-${index}`}
      aria-labelledby={`order-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Order status color mapping
const statusColors = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'secondary'
};

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  
  // Fetch order data
  const { 
    data: order, 
    isLoading: isOrderLoading, 
    error: orderError 
  } = useGetOrderByIdQuery(orderId);
  
  // Fetch order items
  const { 
    data: orderItems, 
    isLoading: isItemsLoading 
  } = useGetOrderItemsQuery(orderId);
  
  // Fetch order shipments
  const {
    data: shipments,
    isLoading: isShipmentsLoading
  } = useGetOrderShipmentsQuery(orderId);
  
  // Order mutations
  const [updateOrderStatus, { isLoading: isStatusUpdating }] = useUpdateOrderStatusMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle status dialog
  const handleOpenStatusDialog = () => {
    setNewStatus(order?.status || '');
    setStatusDialogOpen(true);
  };
  
  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
  };
  
  const handleStatusChange = (event) => {
    setNewStatus(event.target.value);
  };
  
  const handleUpdateStatus = async () => {
    try {
      await updateOrderStatus({ id: orderId, status: newStatus }).unwrap();
      setStatusDialogOpen(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };
  
  // Handle delete dialog
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleDeleteOrder = async () => {
    try {
      await deleteOrder(orderId).unwrap();
      setDeleteDialogOpen(false);
      navigate('/admin/orders');
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };
  
  // Handle note adding
  const handleAddNote = () => {
    setIsAddingNote(true);
  };
  
  const handleCancelNote = () => {
    setNote('');
    setIsAddingNote(false);
  };
  
  const handleSaveNote = () => {
    // We'd implement the API call here
    console.log('Saving note:', note);
    setNote('');
    setIsAddingNote(false);
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
    if (!orderItems?.length) return { subtotal: 0, tax: 0, shipping: 0, total: 0 };
    
    const subtotal = orderItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
    
    const tax = order?.tax || 0;
    const shipping = order?.shippingCost || 0;
    const total = subtotal + tax + shipping;
    
    return { subtotal, tax, shipping, total };
  };
  
  const totals = calculateTotals();
  
  // If order is loading, show loading indicator
  if (isOrderLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  // If there's an error, show error message
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
  
  // Otherwise, render order details
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/orders')}
          sx={{ mb: 2 }}
        >
          Back to Orders
        </Button>
        
        {/* Order Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" component="h1" gutterBottom>
                Order #{order?.orderNumber || order?.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Placed on {format(new Date(order?.createdAt), 'MMMM dd, yyyy - HH:mm')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/admin/orders/${orderId}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => window.open(`/admin/orders/${orderId}/invoice`, '_blank')}
                >
                  Invoice
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EmailIcon />}
                >
                  Email
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleOpenDeleteDialog}
                >
                  Delete
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>Status</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={order?.status}
                  color={statusColors[order?.status] || 'default'}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleOpenStatusDialog}
                >
                  Change
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>Payment</Typography>
              <Chip
                label={order?.paymentStatus}
                color={order?.paymentStatus === 'paid' ? 'success' : order?.paymentStatus === 'pending' ? 'warning' : 'error'}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>Total</Typography>
              <Typography variant="h6">{formatCurrency(order?.total || 0)}</Typography>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Tabs Navigation */}
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Summary" />
            <Tab label="Items" />
            <Tab label="Shipping" />
            <Tab label="Invoices" />
            <Tab label="Returns & Refunds" />
            <Tab label="History" />
            <Tab label="Notes" />
          </Tabs>
        </Box>
        
        {/* Summary Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Customer Information</Typography>
                <Divider sx={{ mb: 2 }} />
                {order?.customer ? (
                  <>
                    <Typography variant="body1">
                      {order.customer.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.customer.email}
                    </Typography>
                    {order.customer.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {order.customer.phone}
                      </Typography>
                    )}
                    <Button
                      sx={{ mt: 1 }}
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/admin/customers/${order.customer.id}`)}
                    >
                      View Customer
                    </Button>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Guest checkout - No account
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Order Summary</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">{formatCurrency(totals.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Shipping</Typography>
                  <Typography variant="body2">{formatCurrency(totals.shipping)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Tax</Typography>
                  <Typography variant="body2">{formatCurrency(totals.tax)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
                  <Typography variant="subtitle1" fontWeight="bold">{formatCurrency(totals.total)}</Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Shipping Address</Typography>
                <Divider sx={{ mb: 2 }} />
                {order?.shippingAddress ? (
                  <>
                    <Typography variant="body2">
                      {order.shippingAddress.name}
                    </Typography>
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
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No shipping address provided
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Billing Address</Typography>
                <Divider sx={{ mb: 2 }} />
                {order?.billingAddress ? (
                  <>
                    <Typography variant="body2">
                      {order.billingAddress.name}
                    </Typography>
                    <Typography variant="body2">
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
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Same as shipping address
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Items Tab */}
        <TabPanel value={activeTab} index={1}>
          <Paper>
            {isItemsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : orderItems?.length > 0 ? (
              <Box>
                <List sx={{ width: '100%' }}>
                  {orderItems.map((item) => (
                    <React.Fragment key={item.id}>
                      <ListItem
                        alignItems="flex-start"
                        secondaryAction={
                          <Typography variant="body1">
                            {formatCurrency(item.price * item.quantity)}
                          </Typography>
                        }
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">{item.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.sku && `SKU: ${item.sku}`}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {formatCurrency(item.price)} × {item.quantity}
                              </Typography>
                              
                              {/* Display item options if any */}
                              {item.options && Object.keys(item.options).length > 0 && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  Options: {Object.entries(item.options).map(([key, value]) => (
                                    `${key}: ${value}`
                                  )).join(', ')}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
                
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Subtotal</Typography>
                    <Typography variant="body2">{formatCurrency(totals.subtotal)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Shipping</Typography>
                    <Typography variant="body2">{formatCurrency(totals.shipping)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Tax</Typography>
                    <Typography variant="body2">{formatCurrency(totals.tax)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
                    <Typography variant="subtitle1" fontWeight="bold">{formatCurrency(totals.total)}</Typography>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">No items in this order</Typography>
              </Box>
            )}
          </Paper>
        </TabPanel>
        
        {/* Shipping Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Shipping Information</Typography>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Shipping Method</Typography>
                  <Typography variant="body1">
                    {order?.shippingMethod || 'Standard Shipping'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Shipping Cost</Typography>
                  <Typography variant="body1">
                    {formatCurrency(order?.shippingCost || 0)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
          
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Shipments</Typography>
              <Button
                variant="contained"
                startIcon={<ShippingIcon />}
                onClick={() => navigate(`/admin/orders/${orderId}/shipping`)}
              >
                Manage Shipments
              </Button>
            </Box>
            
            {isShipmentsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : shipments?.length > 0 ? (
              shipments.map((shipment) => (
                <Card key={shipment.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" gutterBottom>Shipment #{shipment.id}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Created on {format(new Date(shipment.createdAt), 'MMM dd, yyyy')}
                        </Typography>
                        <Chip
                          label={shipment.status}
                          color={
                            shipment.status === 'delivered' ? 'success' :
                            shipment.status === 'shipped' ? 'primary' :
                            'default'
                          }
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" gutterBottom>Carrier</Typography>
                        <Typography variant="body2">
                          {shipment.carrier || 'N/A'}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ mt: 1 }} gutterBottom>Tracking Number</Typography>
                        <Typography variant="body2">
                          {shipment.trackingNumber || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" gutterBottom>Items</Typography>
                        <Typography variant="body2">
                          {shipment.items?.length || 0} items
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ mt: 1 }}
                          onClick={() => navigate(`/admin/orders/${orderId}/shipping/${shipment.id}`)}
                        >
                          View Details
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">No shipments created yet</Typography>
                <Button
                  variant="contained"
                  startIcon={<ShippingIcon />}
                  sx={{ mt: 2 }}
                  onClick={() => navigate(`/admin/orders/${orderId}/shipping`)}
                >
                  Create Shipment
                </Button>
              </Paper>
            )}
          </Box>
        </TabPanel>
        
        {/* Invoices Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ mt: 3 }}>
            <InvoiceManager 
              orderId={orderId} 
              orderNumber={order?.orderNumber || order?.id} 
            />
          </Box>
        </TabPanel>
        
        {/* Returns & Refunds Tab */}
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ mt: 3 }}>
            <ReturnRefundManager 
              orderId={orderId}
              orderStatus={order?.status}
            />
          </Box>
        </TabPanel>
        
        {/* History Tab */}
        <TabPanel value={activeTab} index={5}>
          <Paper>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon />
              <Typography variant="h6">Order History</Typography>
            </Box>
            <Divider />
            
            {order?.history && order.history.length > 0 ? (
              <List>
                {order.history.map((event) => (
                  <React.Fragment key={event.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Typography variant="body1">
                            {event.description}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {format(new Date(event.timestamp), 'MMM dd, yyyy - HH:mm')}
                            {event.user && ` by ${event.user.name}`}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">No history events found</Typography>
              </Box>
            )}
          </Paper>
        </TabPanel>
        
        {/* Notes Tab */}
        <TabPanel value={activeTab} index={6}>
          <Paper>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Order Notes</Typography>
              {!isAddingNote && (
                <Button
                  variant="contained"
                  startIcon={<AddNoteIcon />}
                  onClick={handleAddNote}
                >
                  Add Note
                </Button>
              )}
            </Box>
            <Divider />
            
            {isAddingNote && (
              <Box sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Add a note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  variant="outlined"
                  placeholder="Enter your note here..."
                />
                <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelNote}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveNote}
                    disabled={!note.trim()}
                  >
                    Save Note
                  </Button>
                </Stack>
              </Box>
            )}
            
            {order?.notes && order.notes.length > 0 ? (
              <List>
                {order.notes.map((note) => (
                  <React.Fragment key={note.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Typography variant="body1">
                            {note.content}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {format(new Date(note.createdAt), 'MMM dd, yyyy - HH:mm')}
                            {note.author && ` by ${note.author}`}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">No notes found</Typography>
              </Box>
            )}
          </Paper>
        </TabPanel>
      </Box>
      
      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Change the status of order #{order?.orderNumber || order?.id}.
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={newStatus}
              label="Status"
              onChange={handleStatusChange}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateStatus} 
            variant="contained" 
            color="primary"
            disabled={isStatusUpdating}
            startIcon={isStatusUpdating ? <CircularProgress size={20} /> : null}
          >
            {isStatusUpdating ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete order #{order?.orderNumber || order?.id}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteOrder} 
            variant="contained" 
            color="error"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderDetailPage; 