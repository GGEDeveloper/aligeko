import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Typography,
  Box,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { Close as CloseIcon, Done as DoneIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useUpdateOrderStatusMutation, useDeleteOrderMutation } from '../../store/api/orderApi';

const BatchOperations = ({ selectedOrders, onClearSelection, onOperationComplete }) => {
  const [statusValue, setStatusValue] = useState('');
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  // API mutations
  const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  
  // Handlers for status update dialog
  const handleOpenStatusDialog = () => {
    setStatusValue('');
    setStatusError('');
    setOpenStatusDialog(true);
  };
  
  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
  };
  
  const handleStatusChange = (event) => {
    setStatusValue(event.target.value);
  };
  
  // Handlers for delete dialog
  const handleOpenDeleteDialog = () => {
    setDeleteError('');
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  
  // Perform batch status update
  const handleBatchStatusUpdate = async () => {
    if (!statusValue) {
      setStatusError('Please select a status');
      return;
    }
    
    setStatusError('');
    
    try {
      // Update status for each selected order in sequence
      await Promise.all(
        selectedOrders.map(orderId => 
          updateOrderStatus({ id: orderId, status: statusValue }).unwrap()
        )
      );
      
      handleCloseStatusDialog();
      onOperationComplete();
    } catch (error) {
      setStatusError(error?.data?.message || 'Failed to update order status');
    }
  };
  
  // Perform batch delete
  const handleBatchDelete = async () => {
    setDeleteError('');
    
    try {
      // Delete each selected order in sequence
      await Promise.all(
        selectedOrders.map(orderId => deleteOrder(orderId).unwrap())
      );
      
      handleCloseDeleteDialog();
      onOperationComplete();
    } catch (error) {
      setDeleteError(error?.data?.message || 'Failed to delete orders');
    }
  };
  
  return (
    <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1" component="div">
          {selectedOrders.length} {selectedOrders.length === 1 ? 'order' : 'orders'} selected
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<DoneIcon />}
            onClick={handleOpenStatusDialog}
            color="primary"
          >
            Update Status
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={handleOpenDeleteDialog}
            color="error"
          >
            Delete
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<CloseIcon />}
            onClick={onClearSelection}
          >
            Clear Selection
          </Button>
        </Stack>
      </Box>
      
      {/* Status Update Dialog */}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Change the status for {selectedOrders.length} selected {selectedOrders.length === 1 ? 'order' : 'orders'}.
          </DialogContentText>
          
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={statusValue}
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
          
          {statusError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {statusError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleBatchStatusUpdate} 
            variant="contained" 
            color="primary"
            disabled={isUpdatingStatus}
            startIcon={isUpdatingStatus ? <CircularProgress size={20} /> : null}
          >
            {isUpdatingStatus ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Orders</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete {selectedOrders.length} selected {selectedOrders.length === 1 ? 'order' : 'orders'}? This action cannot be undone.
          </DialogContentText>
          
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleBatchDelete} 
            variant="contained" 
            color="error"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

BatchOperations.propTypes = {
  selectedOrders: PropTypes.array.isRequired,
  onClearSelection: PropTypes.func.isRequired,
  onOperationComplete: PropTypes.func.isRequired
};

export default BatchOperations; 