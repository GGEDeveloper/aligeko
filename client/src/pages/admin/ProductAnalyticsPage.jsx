import React, { useState } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { useGetProductPerformanceQuery, useExportReportDataMutation } from '../../store/api/reportApi';
import { format, subDays, startOfMonth, subMonths } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';

// Import chart components
import ProductPerformanceChart from '../../components/reports/ProductPerformanceChart';

const ProductAnalyticsPage = () => {
  // State for filters
  const [dateRange, setDateRange] = useState([subMonths(new Date(), 3), new Date()]);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState('sales');
  const [sortOrder, setSortOrder] = useState('desc');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Format dates for API calls
  const startDate = format(dateRange[0], 'yyyy-MM-dd');
  const endDate = format(dateRange[1], 'yyyy-MM-dd');
  
  // Fetch product performance data
  const { 
    data: productPerformance, 
    isLoading, 
    isError 
  } = useGetProductPerformanceQuery({ 
    startDate, 
    endDate, 
    limit,
    sortBy,
    sortOrder,
    categoryId: categoryFilter || undefined,
    search: searchQuery || undefined
  });
  
  // Export report data
  const [exportReport, { isLoading: isExporting }] = useExportReportDataMutation();
  
  const handleExport = async (format) => {
    try {
      const result = await exportReport({
        reportType: 'product-performance',
        format,
        filters: {
          startDate,
          endDate,
          categoryId: categoryFilter || undefined,
          search: searchQuery || undefined
        }
      }).unwrap();
      
      // Create a download link
      const url = window.URL.createObjectURL(result);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `product-performance-${format}-${format(new Date(), 'yyyy-MM-dd')}.${format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };
  
  // Handle sort
  const handleSort = (property) => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Product Performance Analytics
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Analyze product sales, revenue, and performance over time
        </Typography>
      </Box>
      
      {/* Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="h2">
              Product Performance Metrics
            </Typography>
            <IconButton 
              size="small" 
              sx={{ ml: 1 }}
              onClick={() => setShowFilters(!showFilters)}
              color={showFilters ? 'primary' : 'default'}
            >
              <FilterListIcon />
            </IconButton>
          </Box>
          
          <Box>
            <Button 
              startIcon={<FileDownloadIcon />} 
              variant="outlined" 
              sx={{ mr: 1 }}
              onClick={() => handleExport('CSV')}
              disabled={isExporting}
            >
              CSV
            </Button>
            <Button 
              startIcon={<FileDownloadIcon />} 
              variant="outlined"
              onClick={() => handleExport('EXCEL')}
              disabled={isExporting}
            >
              Excel
            </Button>
          </Box>
        </Box>
        
        {showFilters && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateRangePicker
                    value={dateRange}
                    onChange={(newValue) => setDateRange(newValue)}
                    slots={{ field: SingleInputDateRangeField }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        label: 'Date Range'
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Category"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {/* Add category options here */}
                    <MenuItem value="1">Electronics</MenuItem>
                    <MenuItem value="2">Clothing</MenuItem>
                    <MenuItem value="3">Home & Garden</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Search Products"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    endAdornment: <SearchIcon color="action" />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Limit</InputLabel>
                  <Select
                    value={limit}
                    label="Limit"
                    onChange={(e) => setLimit(e.target.value)}
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      
      {/* Product Performance Chart */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Top {limit} Products by {sortBy === 'sales' ? 'Revenue' : 'Units Sold'}</Typography>
            <Divider sx={{ mb: 2 }} />
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            ) : isError ? (
              <Alert severity="error">Failed to load product performance data</Alert>
            ) : (
              <Box sx={{ height: 400 }}>
                <ProductPerformanceChart data={productPerformance?.products || []} />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Product Performance Table */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Product Performance Details</Typography>
        <Divider sx={{ mb: 2 }} />
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">Failed to load product performance data</Alert>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="product performance table">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'unitsSold'}
                      direction={sortBy === 'unitsSold' ? sortOrder : 'desc'}
                      onClick={() => handleSort('unitsSold')}
                    >
                      Units Sold
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'sales'}
                      direction={sortBy === 'sales' ? sortOrder : 'desc'}
                      onClick={() => handleSort('sales')}
                    >
                      Revenue
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'profit'}
                      direction={sortBy === 'profit' ? sortOrder : 'desc'}
                      onClick={() => handleSort('profit')}
                    >
                      Profit
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Stock Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productPerformance?.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell component="th" scope="row">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.unitsSold.toLocaleString()}</TableCell>
                    <TableCell>{formatCurrency(product.sales)}</TableCell>
                    <TableCell>{formatCurrency(product.profit)}</TableCell>
                    <TableCell>
                      {product.stockLevel === 0 ? (
                        <Chip label="Out of Stock" color="error" size="small" />
                      ) : product.stockLevel < 10 ? (
                        <Chip label="Low Stock" color="warning" size="small" />
                      ) : (
                        <Chip label={`${product.stockLevel} in stock`} color="success" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Additional Insights */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Product Insights</Typography>
        <Divider sx={{ mb: 2 }} />
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">Failed to load product insights</Alert>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Best Performing Category
                </Typography>
                <Typography variant="h5">
                  {productPerformance?.insights?.bestCategory?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatCurrency(productPerformance?.insights?.bestCategory?.sales || 0)} in sales
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Most Profitable Product
                </Typography>
                <Typography variant="h5">
                  {productPerformance?.insights?.mostProfitable?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatCurrency(productPerformance?.insights?.mostProfitable?.profit || 0)} profit margin
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Trending Product
                </Typography>
                <Typography variant="h5">
                  {productPerformance?.insights?.trending?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {productPerformance?.insights?.trending?.growth || 0}% increase in sales
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default ProductAnalyticsPage; 