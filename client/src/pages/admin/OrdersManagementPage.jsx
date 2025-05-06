import React, { useState, useEffect } from 'react';
import { useGetOrdersQuery } from '../../store/api/orderApi';
import { Box, Typography, Paper, Container, Grid, TextField, InputAdornment, MenuItem, Button, Stack, Divider, Chip, CircularProgress, Alert } from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon, Sort as SortIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import OrdersList from '../../components/orders/OrdersList';
import BatchOperations from '../../components/orders/BatchOperations';
import { Link } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import OrdersExport from '../../components/orders/OrdersExport';

const OrdersManagementPage = () => {
  // State for search, filters, pagination, and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    startDate: null,
    endDate: null,
    minTotal: '',
    maxTotal: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  
  // Format query parameters for API call
  const queryParams = {
    page: page + 1, // API uses 1-based indexing
    limit: rowsPerPage,
    sortBy,
    sortOrder,
    ...(searchTerm && { search: searchTerm }),
    ...(filters.status && { status: filters.status }),
    ...(filters.startDate && { startDate: filters.startDate.toISOString().split('T')[0] }),
    ...(filters.endDate && { endDate: filters.endDate.toISOString().split('T')[0] }),
    ...(filters.minTotal && { minTotal: filters.minTotal }),
    ...(filters.maxTotal && { maxTotal: filters.maxTotal })
  };
  
  // Fetch orders data
  const { data, error, isLoading, refetch } = useGetOrdersQuery(queryParams);
  
  // Reset pagination when filters or search changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm, filters]);
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle filter changes
  const handleFilterChange = (field) => (event) => {
    setFilters({
      ...filters,
      [field]: event.target.value
    });
  };
  
  const handleDateChange = (field) => (date) => {
    setFilters({
      ...filters,
      [field]: date
    });
  };
  
  // Handle sort changes
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };
  
  // Handle pagination changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      startDate: null,
      endDate: null,
      minTotal: '',
      maxTotal: ''
    });
    setSearchTerm('');
  };
  
  // Handle order selection for batch operations
  const handleOrderSelection = (orderIds) => {
    setSelectedOrders(orderIds);
  };
  
  // Refresh orders data
  const handleRefresh = () => {
    refetch();
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Order Management</Typography>
        
        {/* Action Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by order ID, customer name or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  startIcon={<FilterIcon />}
                  onClick={toggleFilters}
                >
                  Filters {showFilters ? '▲' : '▼'}
                </Button>
                
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                >
                  Refresh
                </Button>
                
                <OrdersExport selectedOrders={selectedOrders} />
              </Stack>
            </Grid>
          </Grid>
          
          {/* Filter Section */}
          {showFilters && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={2}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={filters.status}
                    onChange={handleFilterChange('status')}
                    size="small"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="shipped">Shipped</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="refunded">Refunded</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} md={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={filters.startDate}
                      onChange={handleDateChange('startDate')}
                      renderInput={(params) => <TextField size="small" fullWidth {...params} />}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} md={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={filters.endDate}
                      onChange={handleDateChange('endDate')}
                      renderInput={(params) => <TextField size="small" fullWidth {...params} />}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="Min Total"
                    type="number"
                    value={filters.minTotal}
                    onChange={handleFilterChange('minTotal')}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="Max Total"
                    type="number"
                    value={filters.maxTotal}
                    onChange={handleFilterChange('maxTotal')}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} md={2}>
                  <Stack direction="row" spacing={1}>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={clearFilters}
                      fullWidth
                    >
                      Clear
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
        
        {/* Applied Filters Chips */}
        {(searchTerm || filters.status || filters.startDate || filters.endDate || filters.minTotal || filters.maxTotal) && (
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {searchTerm && (
                <Chip 
                  label={`Search: ${searchTerm}`} 
                  onDelete={() => setSearchTerm('')}
                  color="primary"
                  variant="outlined"
                />
              )}
              
              {filters.status && (
                <Chip 
                  label={`Status: ${filters.status}`} 
                  onDelete={() => setFilters({...filters, status: ''})}
                  color="primary"
                  variant="outlined"
                />
              )}
              
              {filters.startDate && (
                <Chip 
                  label={`From: ${filters.startDate.toLocaleDateString()}`} 
                  onDelete={() => setFilters({...filters, startDate: null})}
                  color="primary"
                  variant="outlined"
                />
              )}
              
              {filters.endDate && (
                <Chip 
                  label={`To: ${filters.endDate.toLocaleDateString()}`} 
                  onDelete={() => setFilters({...filters, endDate: null})}
                  color="primary"
                  variant="outlined"
                />
              )}
              
              {filters.minTotal && (
                <Chip 
                  label={`Min Total: $${filters.minTotal}`} 
                  onDelete={() => setFilters({...filters, minTotal: ''})}
                  color="primary"
                  variant="outlined"
                />
              )}
              
              {filters.maxTotal && (
                <Chip 
                  label={`Max Total: $${filters.maxTotal}`} 
                  onDelete={() => setFilters({...filters, maxTotal: ''})}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
        )}
        
        {/* Batch Operations */}
        {selectedOrders.length > 0 && (
          <BatchOperations 
            selectedOrders={selectedOrders} 
            onClearSelection={() => setSelectedOrders([])}
            onOperationComplete={() => {
              setSelectedOrders([]);
              refetch();
            }}
          />
        )}
        
        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading orders: {error.message || 'Unknown error'}
          </Alert>
        )}
        
        {/* Orders List */}
        <Paper sx={{ width: '100%', mb: 2 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <OrdersList 
              orders={data?.orders || []}
              totalCount={data?.totalCount || 0}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              onOrderSelection={handleOrderSelection}
              selectedOrders={selectedOrders}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default OrdersManagementPage; 