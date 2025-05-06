import React, { useState } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  ButtonGroup,
  Button,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { useGetSalesSummaryQuery } from '../../store/api/reportApi';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';

// Import chart components
import SalesChart from '../../components/reports/SalesChart';
import ProductPerformanceChart from '../../components/reports/ProductPerformanceChart';
import CustomerAcquisitionChart from '../../components/reports/CustomerAcquisitionChart';

const MetricCard = ({ title, value, icon, percentChange, loading, error }) => {
  const isPositive = percentChange >= 0;
  
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" color="text.secondary">
            {title}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 1, 
            borderRadius: 1,
            bgcolor: isPositive ? 'success.light' : 'error.light',
            color: 'white'
          }}>
            {isPositive ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
            <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
              {Math.abs(percentChange)}%
            </Typography>
          </Box>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={40} />
          </Box>
        ) : error ? (
          <Alert severity="error">Failed to load data</Alert>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                mr: 2, 
                bgcolor: 'primary.light', 
                borderRadius: '50%', 
                p: 1,
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}>
                {icon}
              </Box>
              <Typography variant="h4" component="div">
                {value}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const ReportsDashboardPage = () => {
  // Default date range: last 30 days
  const [dateRange, setDateRange] = useState([subDays(new Date(), 30), new Date()]);
  const [timeFilter, setTimeFilter] = useState('30days');
  
  // Format dates for API calls
  const startDate = format(dateRange[0], 'yyyy-MM-dd');
  const endDate = format(dateRange[1], 'yyyy-MM-dd');
  
  // Fetch sales summary data
  const { 
    data: salesData, 
    isLoading: isLoadingSales, 
    isError: isSalesError 
  } = useGetSalesSummaryQuery({ startDate, endDate });
  
  // Handle time filter changes
  const handleTimeFilterChange = (filter) => {
    let newStartDate;
    const today = new Date();
    
    switch(filter) {
      case '7days':
        newStartDate = subDays(today, 7);
        break;
      case '30days':
        newStartDate = subDays(today, 30);
        break;
      case 'month':
        newStartDate = startOfMonth(today);
        break;
      case 'week':
        newStartDate = startOfWeek(today);
        break;
      default:
        newStartDate = subDays(today, 30);
    }
    
    setTimeFilter(filter);
    setDateRange([newStartDate, today]);
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reports & Analytics
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Monitor your business performance with real-time analytics
        </Typography>
      </Box>
      
      {/* Date Range Filter */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <ButtonGroup variant="outlined" aria-label="time filter">
            <Button 
              onClick={() => handleTimeFilterChange('7days')}
              variant={timeFilter === '7days' ? 'contained' : 'outlined'}
            >
              Last 7 Days
            </Button>
            <Button 
              onClick={() => handleTimeFilterChange('30days')}
              variant={timeFilter === '30days' ? 'contained' : 'outlined'}
            >
              Last 30 Days
            </Button>
            <Button 
              onClick={() => handleTimeFilterChange('month')}
              variant={timeFilter === 'month' ? 'contained' : 'outlined'}
            >
              This Month
            </Button>
            <Button 
              onClick={() => handleTimeFilterChange('week')}
              variant={timeFilter === 'week' ? 'contained' : 'outlined'}
            >
              This Week
            </Button>
          </ButtonGroup>
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateRangePicker
              value={dateRange}
              onChange={(newValue) => {
                setDateRange(newValue);
                setTimeFilter('custom');
              }}
              slots={{ field: SingleInputDateRangeField }}
              slotProps={{
                textField: {
                  InputProps: {
                    startAdornment: <DateRangeIcon sx={{ mr: 1 }} />,
                  },
                }
              }}
            />
          </LocalizationProvider>
        </Box>
      </Paper>
      
      {/* Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Sales"
            value={salesData ? formatCurrency(salesData.totalSales) : '$0.00'}
            icon={<AttachMoneyIcon />}
            percentChange={salesData?.salesGrowth || 0}
            loading={isLoadingSales}
            error={isSalesError}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Orders"
            value={salesData?.totalOrders || 0}
            icon={<ShoppingCartIcon />}
            percentChange={salesData?.ordersGrowth || 0}
            loading={isLoadingSales}
            error={isSalesError}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="New Customers"
            value={salesData?.newCustomers || 0}
            icon={<PeopleIcon />}
            percentChange={salesData?.customersGrowth || 0}
            loading={isLoadingSales}
            error={isSalesError}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Average Order Value"
            value={salesData ? formatCurrency(salesData.averageOrderValue) : '$0.00'}
            icon={<AttachMoneyIcon />}
            percentChange={salesData?.aovGrowth || 0}
            loading={isLoadingSales}
            error={isSalesError}
          />
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Sales Trends</Typography>
            <Divider sx={{ mb: 2 }} />
            {isLoadingSales ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            ) : isSalesError ? (
              <Alert severity="error">Failed to load sales data</Alert>
            ) : (
              <SalesChart data={salesData?.salesTrend || []} />
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Top Products</Typography>
            <Divider sx={{ mb: 2 }} />
            {isLoadingSales ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            ) : isSalesError ? (
              <Alert severity="error">Failed to load product data</Alert>
            ) : (
              <ProductPerformanceChart data={salesData?.topProducts || []} />
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Customer Acquisition</Typography>
            <Divider sx={{ mb: 2 }} />
            {isLoadingSales ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            ) : isSalesError ? (
              <Alert severity="error">Failed to load customer data</Alert>
            ) : (
              <CustomerAcquisitionChart data={salesData?.customerAcquisition || []} />
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Inventory Status</Typography>
            <Divider sx={{ mb: 2 }} />
            {isLoadingSales ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            ) : isSalesError ? (
              <Alert severity="error">Failed to load inventory data</Alert>
            ) : (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  {salesData?.lowStockItems || 0} products are running low on inventory
                </Alert>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Total SKUs: {salesData?.totalSKUs || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Out of Stock: {salesData?.outOfStockItems || 0}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ReportsDashboardPage; 