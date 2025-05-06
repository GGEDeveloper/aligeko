import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  CircularProgress
} from '@mui/material';
import { 
  FileDownload as DownloadIcon,
  TableChart as ExcelIcon,
  Description as CSVIcon,
  PictureAsPdf as PDFIcon
} from '@mui/icons-material';
import { useGetOrdersQuery } from '../../store/api/orderApi';

const OrdersExport = ({ selectedOrders }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);
  
  // If there are selected orders, we'll export just those
  // Otherwise, we'll fetch all orders for export
  const { data: allOrdersData } = useGetOrdersQuery(
    { limit: 1000 },
    { skip: selectedOrders.length > 0 }
  );
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleExport = async (format) => {
    setExportFormat(format);
    setExportLoading(true);
    
    try {
      const ordersToExport = selectedOrders.length > 0 
        ? selectedOrders 
        : allOrdersData?.orders.map(order => order.id) || [];
      
      // Generate export URL
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/v1';
      const orderIds = ordersToExport.join(',');
      const exportUrl = `${baseUrl}/orders/export?format=${format}&ids=${orderIds}`;
      
      // Fetch the file
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
      const response = await fetch(exportUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Get the blob and create download link
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'orders-export';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      } else {
        // Fallback filename
        const date = new Date().toISOString().split('T')[0];
        filename = `orders-export-${date}.${format}`;
      }
      
      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExportLoading(false);
      setExportFormat(null);
      handleClose();
    }
  };
  
  return (
    <>
      <Button
        variant="outlined"
        startIcon={exportLoading ? <CircularProgress size={20} /> : <DownloadIcon />}
        onClick={handleClick}
        disabled={exportLoading}
      >
        {exportLoading ? `Exporting ${exportFormat}...` : 'Export'}
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleExport('csv')}>
          <ListItemIcon>
            <CSVIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>CSV</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleExport('excel')}>
          <ListItemIcon>
            <ExcelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Excel</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleExport('pdf')}>
          <ListItemIcon>
            <PDFIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>PDF</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

OrdersExport.propTypes = {
  selectedOrders: PropTypes.array.isRequired
};

export default OrdersExport; 