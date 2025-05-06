import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  Box,
  Typography,
  Chip,
  IconButton,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// Order status color mapping
const statusColors = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'secondary'
};

const OrdersList = ({
  orders,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onOrderSelection,
  selectedOrders,
  sortBy,
  sortOrder,
  onSortChange
}) => {
  const navigate = useNavigate();
  const [selectAll, setSelectAll] = useState(false);

  // Handle view order details
  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // Handle edit order
  const handleEditOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}/edit`);
  };

  // Handle print invoice
  const handlePrintInvoice = (orderId) => {
    window.open(`/admin/orders/${orderId}/invoice`, '_blank');
  };

  // Handle shipping management
  const handleShippingManager = (orderId) => {
    navigate(`/admin/orders/${orderId}/shipping`);
  };

  // Handle checkbox selection
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelectedOrders = orders.map(order => order.id);
      setSelectAll(true);
      onOrderSelection(newSelectedOrders);
    } else {
      setSelectAll(false);
      onOrderSelection([]);
    }
  };

  const handleSelectOrder = (orderId) => {
    const selectedIndex = selectedOrders.indexOf(orderId);
    let newSelectedOrders = [];

    if (selectedIndex === -1) {
      newSelectedOrders = [...selectedOrders, orderId];
    } else {
      newSelectedOrders = selectedOrders.filter(id => id !== orderId);
    }

    onOrderSelection(newSelectedOrders);
    setSelectAll(newSelectedOrders.length === orders.length);
  };

  const isOrderSelected = (orderId) => selectedOrders.indexOf(orderId) !== -1;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Table headers with sorting capability
  const headers = [
    { id: 'id', label: 'Order ID', sortable: true },
    { id: 'createdAt', label: 'Order Date', sortable: true },
    { id: 'customerName', label: 'Customer', sortable: true },
    { id: 'total', label: 'Total', sortable: true },
    { id: 'status', label: 'Status', sortable: true },
    { id: 'paymentStatus', label: 'Payment', sortable: true },
    { id: 'actions', label: 'Actions', sortable: false }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer>
        <Table sx={{ minWidth: 750 }} aria-labelledby="ordersTable">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedOrders.length > 0 && selectedOrders.length < orders.length}
                  checked={selectAll}
                  onChange={handleSelectAll}
                  inputProps={{ 'aria-label': 'select all orders' }}
                />
              </TableCell>
              {headers.map((header) => (
                <TableCell
                  key={header.id}
                  sortDirection={sortBy === header.id ? sortOrder : false}
                  align={header.id === 'total' ? 'right' : 'left'}
                >
                  {header.sortable ? (
                    <TableSortLabel
                      active={sortBy === header.id}
                      direction={sortBy === header.id ? sortOrder : 'asc'}
                      onClick={() => onSortChange(header.id)}
                    >
                      {header.label}
                    </TableSortLabel>
                  ) : (
                    header.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headers.length + 1} align="center">
                  <Typography variant="body1" sx={{ py: 3 }}>
                    No orders found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const isSelected = isOrderSelected(order.id);
                return (
                  <TableRow
                    hover
                    key={order.id}
                    selected={isSelected}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectOrder(order.id)}
                        inputProps={{ 'aria-labelledby': `enhanced-table-checkbox-${order.id}` }}
                      />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      #{order.orderNumber || order.id}
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), 'MMM dd, yyyy - HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" component="div" fontWeight="medium">
                          {order.customer?.name || 'Guest'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.customer?.email || order.email || 'No email provided'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={statusColors[order.status] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.paymentStatus}
                        color={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'pending' ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewOrder(order.id)}
                            color="primary"
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Order">
                          <IconButton
                            size="small"
                            onClick={() => handleEditOrder(order.id)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print Invoice">
                          <IconButton
                            size="small"
                            onClick={() => handlePrintInvoice(order.id)}
                          >
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Shipping">
                          <IconButton
                            size="small"
                            onClick={() => handleShippingManager(order.id)}
                          >
                            <ShippingIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
};

OrdersList.propTypes = {
  orders: PropTypes.array.isRequired,
  totalCount: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
  onOrderSelection: PropTypes.func.isRequired,
  selectedOrders: PropTypes.array.isRequired,
  sortBy: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired
};

export default OrdersList; 