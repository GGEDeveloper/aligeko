import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  SwapHoriz as SwapIcon,
  Undo as UndoIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useGetOrderItemsQuery, useCreateReturnRequestMutation, useGetOrderReturnsQuery, useUpdateReturnStatusMutation, useIssueRefundMutation } from '../../store/api/orderApi';
import { formatCurrency } from '../../utils/formatters';

const ReturnRefundManager = ({ orderId, orderStatus }) => {
  // States
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [openRefundDialog, setOpenRefundDialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Queries and mutations
  const { data: orderItems, isLoading: isLoadingItems } = useGetOrderItemsQuery(orderId);
  const { data: returns, isLoading: isLoadingReturns, refetch: refetchReturns } = useGetOrderReturnsQuery(orderId);
  const [createReturnRequest, { isLoading: isCreatingReturn }] = useCreateReturnRequestMutation();
  const [updateReturnStatus, { isLoading: isUpdatingReturn }] = useUpdateReturnStatusMutation();
  const [issueRefund, { isLoading: isRefunding }] = useIssueRefundMutation();

  // Helper functions
  const calculateTotalRefund = () => {
    if (!selectedItems.length) return 0;
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Handle opening the return dialog
  const handleOpenReturnDialog = () => {
    setSelectedItems([]);
    setReturnReason('');
    setOpenReturnDialog(true);
  };

  // Handle opening the refund dialog
  const handleOpenRefundDialog = (returnRequest = null) => {
    setSelectedReturn(returnRequest);
    
    if (returnRequest) {
      // If a return is provided, pre-populate the refund amount
      const total = returnRequest.items.reduce((sum, item) => sum + item.refundAmount, 0);
      setRefundAmount(total.toString());
    } else {
      setRefundAmount('');
    }
    
    setRefundReason('');
    setRefundMethod('original');
    setOpenRefundDialog(true);
  };

  // Handle closing dialogs
  const handleCloseReturnDialog = () => setOpenReturnDialog(false);
  const handleCloseRefundDialog = () => setOpenRefundDialog(false);

  // Handle item selection for return
  const handleItemSelect = (item) => {
    const isSelected = selectedItems.some(selected => selected.id === item.id);
    
    if (isSelected) {
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  // Handle changing return quantity
  const handleQuantityChange = (itemId, newQuantity) => {
    const maxQuantity = orderItems.find(item => item.id === itemId).quantity;
    const validQuantity = Math.min(Math.max(1, newQuantity), maxQuantity);
    
    setSelectedItems(selectedItems.map(item => 
      item.id === itemId ? { ...item, quantity: validQuantity } : item
    ));
  };

  // Submit a return request
  const handleSubmitReturn = async () => {
    if (!selectedItems.length) {
      setError('Please select at least one item to return');
      return;
    }

    if (!returnReason) {
      setError('Please provide a reason for the return');
      return;
    }

    try {
      const returnItems = selectedItems.map(item => ({
        orderItemId: item.id,
        quantity: item.quantity,
        reason: returnReason
      }));

      await createReturnRequest({
        orderId,
        items: returnItems,
        reason: returnReason
      }).unwrap();

      setSuccess('Return request created successfully');
      refetchReturns();
      handleCloseReturnDialog();
    } catch (err) {
      setError(err?.data?.message || 'Failed to create return request');
    }
  };

  // Submit a refund
  const handleSubmitRefund = async () => {
    if (!refundAmount || isNaN(parseFloat(refundAmount)) || parseFloat(refundAmount) <= 0) {
      setError('Please enter a valid refund amount');
      return;
    }

    if (!refundReason) {
      setError('Please provide a reason for the refund');
      return;
    }

    try {
      await issueRefund({
        orderId,
        returnId: selectedReturn?.id || null,
        amount: parseFloat(refundAmount),
        reason: refundReason,
        method: refundMethod
      }).unwrap();

      setSuccess('Refund issued successfully');
      refetchReturns();
      handleCloseRefundDialog();
    } catch (err) {
      setError(err?.data?.message || 'Failed to issue refund');
    }
  };

  // Approve or reject return
  const handleUpdateReturnStatus = async (returnId, status) => {
    try {
      await updateReturnStatus({
        orderId,
        returnId,
        status
      }).unwrap();
      
      setSuccess(`Return ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      refetchReturns();
    } catch (err) {
      setError(err?.data?.message || `Failed to ${status} return`);
    }
  };

  // Clear alerts after 5 seconds
  React.useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Return status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  // Render component
  return (
    <>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            <SwapIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Returns & Refunds
          </Typography>
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<UndoIcon />}
              sx={{ mr: 1 }}
              onClick={handleOpenReturnDialog}
              disabled={orderStatus === 'cancelled' || orderStatus === 'refunded'}
            >
              Process Return
            </Button>
            
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<SwapIcon />}
              onClick={() => handleOpenRefundDialog()}
              disabled={orderStatus === 'refunded'}
            >
              Issue Refund
            </Button>
          </Box>
        </Box>
        
        {(error || success) && (
          <Box sx={{ mb: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
          </Box>
        )}
        
        {/* Return Requests List */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Return Requests</Typography>
        
        {isLoadingReturns ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : returns?.length > 0 ? (
          <List>
            {returns.map((returnRequest) => (
              <Paper key={returnRequest.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">
                      Return #{returnRequest.id}
                      <Chip 
                        label={returnRequest.status} 
                        color={getStatusColor(returnRequest.status)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Requested on: {new Date(returnRequest.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Reason: {returnRequest.reason}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: { xs: 'flex-start', sm: 'flex-end' }
                  }}>
                    {returnRequest.status === 'pending' && (
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleUpdateReturnStatus(returnRequest.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleUpdateReturnStatus(returnRequest.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                    
                    {returnRequest.status === 'approved' && !returnRequest.refunded && (
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        startIcon={<SwapIcon />}
                        onClick={() => handleOpenRefundDialog(returnRequest)}
                        sx={{ mb: 1 }}
                      >
                        Process Refund
                      </Button>
                    )}
                    
                    {returnRequest.refunded && (
                      <Chip 
                        label="Refunded" 
                        color="success"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    )}
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Items</Typography>
                    <Divider sx={{ mb: 1 }} />
                    
                    <List dense disablePadding>
                      {returnRequest.items.map((item) => (
                        <ListItem key={item.id} disablePadding sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={`${item.name} (×${item.quantity})`}
                            secondary={`${formatCurrency(item.price)} per unit`}
                          />
                          <Typography variant="body2">
                            {formatCurrency(item.price * item.quantity)}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No return requests found for this order.
          </Typography>
        )}
      </Paper>
      
      {/* Return Request Dialog */}
      <Dialog open={openReturnDialog} onClose={handleCloseReturnDialog} maxWidth="md" fullWidth>
        <DialogTitle>Process Return</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Select items to return:</Typography>
          
          {isLoadingItems ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {orderItems?.map((item) => (
                <ListItem 
                  key={item.id}
                  secondaryAction={
                    selectedItems.some(selected => selected.id === item.id) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', width: 120 }}>
                        <Button 
                          size="small"
                          onClick={() => handleQuantityChange(item.id, 
                            selectedItems.find(s => s.id === item.id).quantity - 1)}
                          disabled={selectedItems.find(s => s.id === item.id)?.quantity <= 1}
                        >
                          -
                        </Button>
                        <Typography sx={{ mx: 1 }}>
                          {selectedItems.find(s => s.id === item.id)?.quantity || 0}
                        </Typography>
                        <Button 
                          size="small"
                          onClick={() => handleQuantityChange(item.id, 
                            selectedItems.find(s => s.id === item.id).quantity + 1)}
                          disabled={selectedItems.find(s => s.id === item.id)?.quantity >= item.quantity}
                        >
                          +
                        </Button>
                      </Box>
                    )
                  }
                >
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={selectedItems.some(selected => selected.id === item.id)}
                        onChange={() => handleItemSelect(item)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatCurrency(item.price)} × {item.quantity}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <TextField
            fullWidth
            label="Return Reason"
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            multiline
            rows={3}
            required
            variant="outlined"
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1">Total Refund Amount:</Typography>
            <Typography variant="subtitle1">
              {formatCurrency(calculateTotalRefund())}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReturnDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitReturn} 
            variant="contained"
            disabled={isCreatingReturn || selectedItems.length === 0 || !returnReason}
            startIcon={isCreatingReturn ? <CircularProgress size={20} /> : null}
          >
            {isCreatingReturn ? 'Processing...' : 'Submit Return'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Refund Dialog */}
      <Dialog open={openRefundDialog} onClose={handleCloseRefundDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedReturn ? 'Process Refund for Return' : 'Issue Refund'}
        </DialogTitle>
        <DialogContent>
          {selectedReturn && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Return #{selectedReturn.id}</Typography>
              <Typography variant="body2" color="text.secondary">
                Items: {selectedReturn.items.length}
              </Typography>
            </Box>
          )}
          
          <TextField
            fullWidth
            label="Refund Amount"
            type="number"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            required
            variant="outlined"
            sx={{ mb: 2, mt: 1 }}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Refund Method</InputLabel>
            <Select
              value={refundMethod}
              onChange={(e) => setRefundMethod(e.target.value)}
              label="Refund Method"
              required
            >
              <MenuItem value="original">Original Payment Method</MenuItem>
              <MenuItem value="store_credit">Store Credit</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Refund Reason"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            multiline
            rows={3}
            required
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRefundDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitRefund} 
            variant="contained"
            color="secondary"
            disabled={isRefunding || !refundAmount || !refundReason || !refundMethod}
            startIcon={isRefunding ? <CircularProgress size={20} /> : null}
          >
            {isRefunding ? 'Processing...' : 'Issue Refund'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReturnRefundManager; 