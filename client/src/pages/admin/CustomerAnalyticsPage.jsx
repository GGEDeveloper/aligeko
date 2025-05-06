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
  Button,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Business as BusinessIcon,
  Language as LanguageIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { 
  useGetCustomerAnalyticsQuery, 
  useExportReportDataMutation 
} from '../../store/api/reportApi';
import { format, subDays, startOfMonth, subMonths } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';

// Import chart components
import CustomerAcquisitionChart from '../../components/reports/CustomerAcquisitionChart';

// Customer segmentation value component
const SegmentValue = ({ value, prevValue, label, icon }) => {
  const change = value - prevValue;
  const percentage = prevValue ? Math.round((change / prevValue) * 100) : 0;
  
  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 0.5, 
          px: 1,
          borderRadius: 1,
          bgcolor: change >= 0 ? 'success.light' : 'error.light',
          color: 'white',
          fontSize: '0.75rem'
        }}>
          {change >= 0 ? <ArrowUpwardIcon fontSize="inherit" /> : <ArrowDownwardIcon fontSize="inherit" />}
          <Typography variant="caption" component="span" sx={{ ml: 0.5 }}>
            {Math.abs(percentage)}%
          </Typography>
        </Box>
      </Box>
      
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
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
      </Box>
    </Paper>
  );
};

const CustomerAnalyticsPage = () => {
  // State for filters and tabs
  const [dateRange, setDateRange] = useState([subMonths(new Date(), 3), new Date()]);
  const [segment, setSegment] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  
  // Format dates for API calls
  const startDate = format(dateRange[0], 'yyyy-MM-dd');
  const endDate = format(dateRange[1], 'yyyy-MM-dd');
  
  // Fetch customer analytics data
  const { 
    data, 
    isLoading, 
    isError 
  } = useGetCustomerAnalyticsQuery({ 
    startDate, 
    endDate, 
    segment: segment !== 'all' ? segment : undefined
  });
  
  // Export report data
  const [exportReport, { isLoading: isExporting }] = useExportReportDataMutation();
  
  const handleExport = async (format) => {
    try {
      const result = await exportReport({
        reportType: 'customer-analytics',
        format,
        filters: {
          startDate,
          endDate,
          segment: segment !== 'all' ? segment : undefined
        }
      }).unwrap();
      
      // Create a download link
      const url = window.URL.createObjectURL(result);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `customer-analytics-${format.toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.${format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Customer Analytics
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Analyze customer behavior, segmentation, and lifetime value
        </Typography>
      </Box>
      
      {/* Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateRangePicker
              value={dateRange}
              onChange={(newValue) => setDateRange(newValue)}
              slots={{ field: SingleInputDateRangeField }}
              slotProps={{
                textField: {
                  InputProps: {
                    startAdornment: <TimelineIcon sx={{ mr: 1 }} />,
                  },
                  size: "small"
                }
              }}
            />
          </LocalizationProvider>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Customer Segment</InputLabel>
              <Select
                value={segment}
                label="Customer Segment"
                onChange={(e) => setSegment(e.target.value)}
              >
                <MenuItem value="all">All Segments</MenuItem>
                <MenuItem value="new">New Customers</MenuItem>
                <MenuItem value="loyal">Loyal Customers</MenuItem>
                <MenuItem value="returning">Returning Customers</MenuItem>
                <MenuItem value="at-risk">At-Risk Customers</MenuItem>
                <MenuItem value="inactive">Inactive Customers</MenuItem>
                <MenuItem value="business">Business Customers</MenuItem>
              </Select>
            </FormControl>
            
            <Button 
              startIcon={<FileDownloadIcon />} 
              variant="outlined" 
              onClick={() => handleExport('CSV')}
              disabled={isExporting}
              size="small"
            >
              Export
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SegmentValue 
            value={data?.metrics?.totalCustomers || 0} 
            prevValue={data?.metrics?.previousPeriod?.totalCustomers || 0}
            label="Total Customers"
            icon={<PersonIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SegmentValue 
            value={data?.metrics?.newCustomers || 0} 
            prevValue={data?.metrics?.previousPeriod?.newCustomers || 0}
            label="New Customers"
            icon={<PersonIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SegmentValue 
            value={formatCurrency(data?.metrics?.avgLTV || 0)} 
            prevValue={data?.metrics?.previousPeriod?.avgLTV || 0}
            label="Avg. Lifetime Value"
            icon={<BusinessIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SegmentValue 
            value={`${data?.metrics?.retentionRate || 0}%`} 
            prevValue={data?.metrics?.previousPeriod?.retentionRate || 0}
            label="Retention Rate"
            icon={<TimelineIcon />}
          />
        </Grid>
      </Grid>
      
      {/* Tabs */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Customer Acquisition" />
            <Tab label="Customer Segmentation" />
            <Tab label="Geographic Distribution" />
            <Tab label="Customer Lifetime Value" />
          </Tabs>
        </Box>
        
        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {/* Customer Acquisition Tab */}
          {tabValue === 0 && (
            <div>
              <Typography variant="h6" gutterBottom>Customer Acquisition Trends</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Track how your customer base has grown over time, including new and returning customers.
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                  <CircularProgress />
                </Box>
              ) : isError ? (
                <Alert severity="error">Failed to load customer acquisition data</Alert>
              ) : (
                <Box sx={{ height: 400 }}>
                  <CustomerAcquisitionChart data={data?.customerAcquisition || []} />
                </Box>
              )}
            </div>
          )}
          
          {/* Customer Segmentation Tab */}
          {tabValue === 1 && (
            <div>
              <Typography variant="h6" gutterBottom>Customer Segmentation Analysis</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Understand how your customer base is distributed across different segments.
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                  <CircularProgress />
                </Box>
              ) : isError ? (
                <Alert severity="error">Failed to load customer segmentation data</Alert>
              ) : (
                <Grid container spacing={3}>
                  {data?.segmentation?.map((segment, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          borderTop: '5px solid',
                          borderColor: segment.color || 'primary.main'
                        }}
                      >
                        <Typography variant="h6" align="center" gutterBottom>
                          {segment.name}
                        </Typography>
                        
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                          <Typography variant="h3">
                            {segment.percentage}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {segment.count.toLocaleString()} customers
                          </Typography>
                        </Box>
                        
                        <Divider sx={{ width: '100%', my: 1 }} />
                        
                        <Box sx={{ width: '100%' }}>
                          <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <span>Avg. Order Value:</span>
                            <span>{formatCurrency(segment.avgOrderValue)}</span>
                          </Typography>
                          <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <span>Lifetime Value:</span>
                            <span>{formatCurrency(segment.ltv)}</span>
                          </Typography>
                          <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Purchase Frequency:</span>
                            <span>{segment.purchaseFrequency.toFixed(1)} orders/month</span>
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </div>
          )}
          
          {/* Geographic Distribution Tab */}
          {tabValue === 2 && (
            <div>
              <Typography variant="h6" gutterBottom>Geographic Distribution</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                See where your customers are located and identify key markets.
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                  <CircularProgress />
                </Box>
              ) : isError ? (
                <Alert severity="error">Failed to load geographic data</Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Country/Region</TableCell>
                        <TableCell>Customers</TableCell>
                        <TableCell>% of Total</TableCell>
                        <TableCell>Orders</TableCell>
                        <TableCell>Revenue</TableCell>
                        <TableCell>Avg. Order Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data?.geographicDistribution?.map((region) => (
                        <TableRow key={region.region}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LanguageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                              {region.region}
                            </Box>
                          </TableCell>
                          <TableCell>{region.customers.toLocaleString()}</TableCell>
                          <TableCell>{region.percentage}%</TableCell>
                          <TableCell>{region.orders.toLocaleString()}</TableCell>
                          <TableCell>{formatCurrency(region.revenue)}</TableCell>
                          <TableCell>{formatCurrency(region.avgOrderValue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </div>
          )}
          
          {/* Customer Lifetime Value Tab */}
          {tabValue === 3 && (
            <div>
              <Typography variant="h6" gutterBottom>Customer Lifetime Value Analysis</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Understand the long-term value of your customers and identify high-value segments.
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                  <CircularProgress />
                </Box>
              ) : isError ? (
                <Alert severity="error">Failed to load LTV data</Alert>
              ) : (
                <Box>
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                      <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Average Customer Acquisition Cost
                        </Typography>
                        <Typography variant="h5">
                          {formatCurrency(data?.ltv?.cac || 0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Cost to acquire a new customer
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Average Lifetime Value
                        </Typography>
                        <Typography variant="h5">
                          {formatCurrency(data?.ltv?.avgLtv || 0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Revenue generated over customer lifetime
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          LTV:CAC Ratio
                        </Typography>
                        <Typography variant="h5">
                          {data?.ltv?.ltvCacRatio?.toFixed(2) || '0.00'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Value generated per acquisition cost
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="h6" gutterBottom>
                    Lifetime Value by Segment
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Customer Segment</TableCell>
                          <TableCell>Avg. LTV</TableCell>
                          <TableCell>Revenue Contribution</TableCell>
                          <TableCell>Customer Count</TableCell>
                          <TableCell>Acquisition Cost</TableCell>
                          <TableCell>LTV:CAC Ratio</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data?.ltv?.segmentBreakdown?.map((segment) => (
                          <TableRow key={segment.segment}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {segment.segment}
                              </Typography>
                            </TableCell>
                            <TableCell>{formatCurrency(segment.avgLtv)}</TableCell>
                            <TableCell>{segment.revenueContribution}%</TableCell>
                            <TableCell>{segment.customerCount.toLocaleString()}</TableCell>
                            <TableCell>{formatCurrency(segment.cac)}</TableCell>
                            <TableCell>
                              <Chip 
                                label={segment.ltvCacRatio.toFixed(2)} 
                                color={segment.ltvCacRatio >= 3 ? 'success' : segment.ltvCacRatio >= 1 ? 'primary' : 'error'} 
                                size="small" 
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </div>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CustomerAnalyticsPage; 