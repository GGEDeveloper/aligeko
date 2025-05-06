import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as DocIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useGetOrderInvoicesQuery, useGenerateInvoiceMutation, useDeleteInvoiceMutation } from '../../store/api/orderApi';

const InvoiceManager = ({ orderId, orderNumber }) => {
  const navigate = useNavigate();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [emailConfirm, setEmailConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [downloadMenuAnchorEl, setDownloadMenuAnchorEl] = useState(null);
  
  // Query invoices for this order
  const {
    data: invoices,
    isLoading: isLoadingInvoices,
    refetch: refetchInvoices
  } = useGetOrderInvoicesQuery(orderId);
  
  // Mutations
  const [generateInvoice, { isLoading: isGenerating }] = useGenerateInvoiceMutation();
  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();
  
  // Handle generating a new invoice
  const handleGenerateInvoice = async () => {
    try {
      await generateInvoice(orderId).unwrap();
      setSuccess('Invoice generated successfully');
      refetchInvoices();
    } catch (err) {
      setError(err?.data?.message || 'Failed to generate invoice');
    }
  };
  
  // Handle viewing an invoice
  const handleViewInvoice = (invoiceId) => {
    navigate(`/admin/orders/${orderId}/invoice/${invoiceId}`);
  };
  
  // Handle opening the menu
  const handleOpenMenu = (event, invoice) => {
    setSelectedInvoice(invoice);
    setMenuAnchorEl(event.currentTarget);
  };
  
  // Handle closing the menu
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle opening download menu
  const handleOpenDownloadMenu = (event) => {
    setDownloadMenuAnchorEl(event.currentTarget);
    handleCloseMenu();
  };
  
  // Handle closing download menu
  const handleCloseDownloadMenu = () => {
    setDownloadMenuAnchorEl(null);
  };
  
  // Handle downloading an invoice
  const handleDownloadInvoice = async (format) => {
    if (!selectedInvoice) return;
    
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/v1';
      const downloadUrl = `${baseUrl}/orders/${orderId}/invoices/${selectedInvoice.id}/download?format=${format}`;
      
      const token = localStorage.getItem('token');
      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Determine filename and extension
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `invoice-${orderNumber || orderId}-${selectedInvoice.id}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      } else {
        // Default extension
        filename = `${filename}.${format === 'pdf' ? 'pdf' : 'docx'}`;
      }
      
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      handleCloseDownloadMenu();
    } catch (error) {
      setError('Failed to download invoice');
      handleCloseDownloadMenu();
    }
  };
  
  // Handle opening delete confirmation
  const handleConfirmDelete = () => {
    setConfirmDelete(true);
    handleCloseMenu();
  };
  
  // Handle deleting an invoice
  const handleDeleteInvoice = async () => {
    if (!selectedInvoice) return;
    
    try {
      await deleteInvoice({ orderId, invoiceId: selectedInvoice.id }).unwrap();
      setSuccess('Invoice deleted successfully');
      refetchInvoices();
    } catch (err) {
      setError(err?.data?.message || 'Failed to delete invoice');
    } finally {
      setConfirmDelete(false);
    }
  };
  
  // Handle opening email confirmation
  const handleConfirmEmail = () => {
    setEmailConfirm(true);
    handleCloseMenu();
  };
  
  // Handle emailing an invoice
  const handleEmailInvoice = async () => {
    if (!selectedInvoice) return;
    
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/v1';
      const emailUrl = `${baseUrl}/orders/${orderId}/invoices/${selectedInvoice.id}/email`;
      
      const token = localStorage.getItem('token');
      const response = await fetch(emailUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to send invoice');
      }
      
      setSuccess('Invoice sent successfully');
    } catch (err) {
      setError('Failed to send invoice');
    } finally {
      setEmailConfirm(false);
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
  
  return (
    <>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            <DescriptionIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Invoices
          </Typography>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleGenerateInvoice}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Invoice'}
          </Button>
        </Box>
        
        {(error || success) && (
          <Box sx={{ mb: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
          </Box>
        )}
        
        {isLoadingInvoices ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            {invoices?.length > 0 ? (
              <List>
                {invoices.map((invoice, index) => (
                  <React.Fragment key={invoice.id}>
                    {index > 0 && <Divider />}
                    <ListItem 
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="more options"
                          onClick={(e) => handleOpenMenu(e, invoice)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <DescriptionIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`Invoice #${invoice.invoiceNumber || invoice.id}`} 
                        secondary={`Created: ${format(new Date(invoice.createdAt), 'PPP')}`}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewInvoice(invoice.id)}
                        sx={{ mr: 1 }}
                      >
                        View
                      </Button>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  No invoices have been generated for this order yet.
                </Typography>
              </Box>
            )}
          </>
        )}
      </Paper>
      
      {/* Invoice Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleOpenDownloadMenu}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleConfirmEmail}>
          <ListItemIcon>
            <SendIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Email to Customer</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleConfirmDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Download Format Menu */}
      <Menu
        anchorEl={downloadMenuAnchorEl}
        open={Boolean(downloadMenuAnchorEl)}
        onClose={handleCloseDownloadMenu}
      >
        <MenuItem onClick={() => handleDownloadInvoice('pdf')}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDownloadInvoice('doc')}>
          <ListItemIcon>
            <DocIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Word Document</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
      >
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this invoice? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteInvoice} 
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Email Confirmation Dialog */}
      <Dialog
        open={emailConfirm}
        onClose={() => setEmailConfirm(false)}
      >
        <DialogTitle>Email Invoice</DialogTitle>
        <DialogContent>
          <Typography>
            Send this invoice to the customer's email address?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailConfirm(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleEmailInvoice} 
            color="primary"
            variant="contained"
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvoiceManager; 