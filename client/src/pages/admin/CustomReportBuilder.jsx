import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  RemoveCircle as RemoveCircleIcon,
  Save as SaveIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  ShowChart as ShowChartIcon,
  TableChart as TableChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  useSaveCustomReportMutation,
  useGetCustomReportsQuery,
  useGetCustomReportByIdQuery,
  useUpdateCustomReportMutation,
  useDeleteCustomReportMutation,
  useRunCustomReportQuery,
  useExportReportDataMutation
} from '../../store/api/reportApi';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';

// Available metrics and dimensions for reports
const availableMetrics = [
  { id: 'revenue', name: 'Revenue', type: 'currency', group: 'Sales' },
  { id: 'orderCount', name: 'Order Count', type: 'number', group: 'Sales' },
  { id: 'avgOrderValue', name: 'Average Order Value', type: 'currency', group: 'Sales' },
  { id: 'productsSold', name: 'Products Sold', type: 'number', group: 'Sales' },
  { id: 'newCustomers', name: 'New Customers', type: 'number', group: 'Customers' },
  { id: 'returningCustomers', name: 'Returning Customers', type: 'number', group: 'Customers' },
  { id: 'customerRetentionRate', name: 'Customer Retention Rate', type: 'percentage', group: 'Customers' },
  { id: 'avgLTV', name: 'Average Lifetime Value', type: 'currency', group: 'Customers' },
  { id: 'productViews', name: 'Product Views', type: 'number', group: 'Marketing' },
  { id: 'addToCartRate', name: 'Add to Cart Rate', type: 'percentage', group: 'Marketing' },
  { id: 'conversionRate', name: 'Conversion Rate', type: 'percentage', group: 'Marketing' },
  { id: 'profit', name: 'Profit', type: 'currency', group: 'Financial' },
  { id: 'profitMargin', name: 'Profit Margin', type: 'percentage', group: 'Financial' },
];

const availableDimensions = [
  { id: 'date', name: 'Date', group: 'Time' },
  { id: 'week', name: 'Week', group: 'Time' },
  { id: 'month', name: 'Month', group: 'Time' },
  { id: 'quarter', name: 'Quarter', group: 'Time' },
  { id: 'year', name: 'Year', group: 'Time' },
  { id: 'productId', name: 'Product', group: 'Product' },
  { id: 'productCategory', name: 'Product Category', group: 'Product' },
  { id: 'productType', name: 'Product Type', group: 'Product' },
  { id: 'productBrand', name: 'Product Brand', group: 'Product' },
  { id: 'customer', name: 'Customer', group: 'Customer' },
  { id: 'customerSegment', name: 'Customer Segment', group: 'Customer' },
  { id: 'customerRegion', name: 'Customer Region', group: 'Geographic' },
  { id: 'customerCountry', name: 'Customer Country', group: 'Geographic' },
  { id: 'customerCity', name: 'Customer City', group: 'Geographic' },
  { id: 'orderStatus', name: 'Order Status', group: 'Order' },
  { id: 'paymentMethod', name: 'Payment Method', group: 'Order' },
  { id: 'shippingMethod', name: 'Shipping Method', group: 'Order' },
];

// Map of visualization types
const visualizationTypes = [
  { id: 'table', name: 'Table', icon: <TableChartIcon /> },
  { id: 'bar', name: 'Bar Chart', icon: <BarChartIcon /> },
  { id: 'line', name: 'Line Chart', icon: <ShowChartIcon /> },
  { id: 'pie', name: 'Pie Chart', icon: <PieChartIcon /> },
];

// Format report data based on type
const formatReportValue = (value, type) => {
  if (value === null || value === undefined) return '-';
  
  switch (type) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return `${value.toFixed(2)}%`;
    case 'number':
      return value.toLocaleString();
    default:
      return value;
  }
};

const CustomReportBuilder = () => {
  // State for saved reports
  const [savedReports, setSavedReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [isNewReport, setIsNewReport] = useState(true);
  
  // State for report configuration
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [selectedDimensions, setSelectedDimensions] = useState([]);
  const [selectedVisualization, setSelectedVisualization] = useState('table');
  const [dateRange, setDateRange] = useState({ start: '30d', end: 'today' });
  const [filters, setFilters] = useState([]);
  const [showOutput, setShowOutput] = useState(false);
  
  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  
  // Report parameters
  const [reportParameters, setReportParameters] = useState({});
  
  // API hooks
  const { data: customReports = [], isLoading: isLoadingReports } = useGetCustomReportsQuery();
  const { data: reportDetail, isLoading: isLoadingReportDetail } = useGetCustomReportByIdQuery(selectedReportId, { skip: !selectedReportId });
  
  const [saveReport, { isLoading: isSaving }] = useSaveCustomReportMutation();
  const [updateReport, { isLoading: isUpdating }] = useUpdateCustomReportMutation();
  const [deleteReport, { isLoading: isDeleting }] = useDeleteCustomReportMutation();
  
  const { data: reportResult, isLoading: isRunning, error: runError } = useRunCustomReportQuery(
    { 
      id: selectedReportId, 
      parameters: reportParameters 
    }, 
    { skip: !selectedReportId || !showOutput }
  );
  
  const [exportReport, { isLoading: isExporting }] = useExportReportDataMutation();
  
  // Effect to update saved reports when API response changes
  useEffect(() => {
    if (customReports?.length > 0) {
      setSavedReports(customReports);
    }
  }, [customReports]);
  
  // Effect to load report configuration when a saved report is selected
  useEffect(() => {
    if (reportDetail) {
      setReportName(reportDetail.name);
      setReportDescription(reportDetail.description || '');
      setSelectedMetrics(reportDetail.metrics || []);
      setSelectedDimensions(reportDetail.dimensions || []);
      setSelectedVisualization(reportDetail.visualizationType || 'table');
      setDateRange(reportDetail.dateRange || { start: '30d', end: 'today' });
      setFilters(reportDetail.filters || []);
      setReportParameters(reportDetail.defaultParameters || {});
    }
  }, [reportDetail]);
  
  // Create a new report
  const handleNewReport = () => {
    setSelectedReportId(null);
    setIsNewReport(true);
    setReportName('');
    setReportDescription('');
    setSelectedMetrics([]);
    setSelectedDimensions([]);
    setSelectedVisualization('table');
    setDateRange({ start: '30d', end: 'today' });
    setFilters([]);
    setReportParameters({});
    setShowOutput(false);
  };
  
  // Select a saved report
  const handleSelectReport = (reportId) => {
    setSelectedReportId(reportId);
    setIsNewReport(false);
    setShowOutput(false);
  };
  
  // Toggle a metric selection
  const handleToggleMetric = (metricId) => {
    if (selectedMetrics.includes(metricId)) {
      setSelectedMetrics(selectedMetrics.filter(id => id !== metricId));
    } else {
      setSelectedMetrics([...selectedMetrics, metricId]);
    }
  };
  
  // Toggle a dimension selection
  const handleToggleDimension = (dimensionId) => {
    if (selectedDimensions.includes(dimensionId)) {
      setSelectedDimensions(selectedDimensions.filter(id => id !== dimensionId));
    } else {
      setSelectedDimensions([...selectedDimensions, dimensionId]);
    }
  };
  
  // Save report
  const handleSaveReport = async () => {
    try {
      const reportConfig = {
        name: reportName,
        description: reportDescription,
        metrics: selectedMetrics,
        dimensions: selectedDimensions,
        visualizationType: selectedVisualization,
        dateRange,
        filters,
        defaultParameters: reportParameters
      };
      
      if (isNewReport) {
        const result = await saveReport(reportConfig).unwrap();
        setSelectedReportId(result.id);
        setIsNewReport(false);
      } else {
        await updateReport({ id: selectedReportId, ...reportConfig }).unwrap();
      }
      
      setSaveDialogOpen(false);
    } catch (error) {
      console.error('Failed to save report:', error);
    }
  };
  
  // Delete report
  const handleDeleteReport = async () => {
    try {
      await deleteReport(selectedReportId).unwrap();
      handleNewReport();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };
  
  // Run report
  const handleRunReport = () => {
    setShowOutput(true);
  };
  
  // Export report
  const handleExportReport = async (format) => {
    try {
      const result = await exportReport({
        reportType: 'custom',
        format,
        filters: {
          reportId: selectedReportId,
          ...reportParameters
        }
      }).unwrap();
      
      // Create a download link
      const url = window.URL.createObjectURL(result);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `custom-report-${reportName.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.${format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };
  
  // Add a filter
  const handleAddFilter = () => {
    setFilters([...filters, { field: '', operator: 'equals', value: '' }]);
  };
  
  // Update filter
  const handleUpdateFilter = (index, field, value) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = { ...updatedFilters[index], [field]: value };
    setFilters(updatedFilters);
  };
  
  // Remove filter
  const handleRemoveFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };
  
  // Render metric groups
  const renderMetricGroups = () => {
    const groups = {};
    
    availableMetrics.forEach(metric => {
      if (!groups[metric.group]) {
        groups[metric.group] = [];
      }
      groups[metric.group].push(metric);
    });
    
    return Object.entries(groups).map(([group, metrics]) => (
      <Box key={group} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {group}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {metrics.map(metric => (
            <Chip
              key={metric.id}
              label={metric.name}
              clickable
              color={selectedMetrics.includes(metric.id) ? 'primary' : 'default'}
              onClick={() => handleToggleMetric(metric.id)}
            />
          ))}
        </Box>
      </Box>
    ));
  };
  
  // Render dimension groups
  const renderDimensionGroups = () => {
    const groups = {};
    
    availableDimensions.forEach(dimension => {
      if (!groups[dimension.group]) {
        groups[dimension.group] = [];
      }
      groups[dimension.group].push(dimension);
    });
    
    return Object.entries(groups).map(([group, dimensions]) => (
      <Box key={group} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {group}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {dimensions.map(dimension => (
            <Chip
              key={dimension.id}
              label={dimension.name}
              clickable
              color={selectedDimensions.includes(dimension.id) ? 'primary' : 'default'}
              onClick={() => handleToggleDimension(dimension.id)}
            />
          ))}
        </Box>
      </Box>
    ));
  };
  
  // Render report output
  const renderReportOutput = () => {
    if (!showOutput) return null;
    
    if (isRunning) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (runError) {
      return <Alert severity="error">Failed to generate report: {runError.message}</Alert>;
    }
    
    if (!reportResult || !reportResult.data || reportResult.data.length === 0) {
      return <Alert severity="info">No data available for the selected criteria.</Alert>;
    }
    
    // Render the output based on visualization type
    switch (selectedVisualization) {
      case 'table':
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {selectedDimensions.map(dim => {
                    const dimension = availableDimensions.find(d => d.id === dim);
                    return (
                      <TableCell key={dim}>{dimension?.name || dim}</TableCell>
                    );
                  })}
                  {selectedMetrics.map(metric => {
                    const metricDef = availableMetrics.find(m => m.id === metric);
                    return (
                      <TableCell key={metric} align="right">{metricDef?.name || metric}</TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {reportResult.data.map((row, index) => (
                  <TableRow key={index}>
                    {selectedDimensions.map(dim => (
                      <TableCell key={dim}>{row[dim]}</TableCell>
                    ))}
                    {selectedMetrics.map(metric => {
                      const metricDef = availableMetrics.find(m => m.id === metric);
                      return (
                        <TableCell key={metric} align="right">
                          {formatReportValue(row[metric], metricDef?.type)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      // Other visualization types would go here
      default:
        return (
          <Alert severity="info">
            This visualization type is not yet implemented.
          </Alert>
        );
    }
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Custom Report Builder
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Create and save customized reports for your specific analytics needs
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Saved Reports */}
        <Grid item xs={12} md={3}>
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Saved Reports</Typography>
              <Button 
                startIcon={<AddIcon />} 
                variant="outlined" 
                size="small"
                onClick={handleNewReport}
              >
                New
              </Button>
            </Box>
            
            {isLoadingReports ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List sx={{ maxHeight: 'calc(100vh - 340px)', overflow: 'auto' }}>
                {savedReports.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No saved reports" secondary="Create a new report to get started" />
                  </ListItem>
                ) : (
                  savedReports.map(report => (
                    <ListItem 
                      key={report.id}
                      button
                      selected={selectedReportId === report.id}
                      onClick={() => handleSelectReport(report.id)}
                    >
                      <ListItemIcon>
                        {visualizationTypes.find(v => v.id === report.visualizationType)?.icon || <ShowChartIcon />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={report.name} 
                        secondary={`${report.metrics?.length || 0} metrics, ${report.dimensions?.length || 0} dimensions`} 
                      />
                    </ListItem>
                  ))
                )}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Report Configuration */}
        <Grid item xs={12} md={9}>
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <TextField
                  label="Report Name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ width: 300, mb: 1 }}
                />
                <TextField
                  label="Description (Optional)"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                />
              </Box>
              <Box>
                <Button 
                  startIcon={<SaveIcon />}
                  variant="outlined"
                  onClick={() => setSaveDialogOpen(true)}
                  disabled={!reportName || selectedMetrics.length === 0}
                  sx={{ mr: 1 }}
                >
                  Save
                </Button>
                {!isNewReport && (
                  <Button 
                    startIcon={<DeleteIcon />}
                    variant="outlined"
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete
                  </Button>
                )}
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              {/* Metrics & Dimensions */}
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>Metrics & Dimensions</Typography>
                
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      Metrics <Chip label={selectedMetrics.length} size="small" sx={{ ml: 1 }} />
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {renderMetricGroups()}
                  </AccordionDetails>
                </Accordion>
                
                <Accordion defaultExpanded sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      Dimensions <Chip label={selectedDimensions.length} size="small" sx={{ ml: 1 }} />
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {renderDimensionGroups()}
                  </AccordionDetails>
                </Accordion>
                
                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      Filters <Chip label={filters.length} size="small" sx={{ ml: 1 }} />
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {filters.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No filters defined
                      </Typography>
                    ) : (
                      filters.map((filter, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                          <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Field</InputLabel>
                            <Select
                              value={filter.field}
                              label="Field"
                              onChange={(e) => handleUpdateFilter(index, 'field', e.target.value)}
                            >
                              {[...availableMetrics, ...availableDimensions].map(field => (
                                <MenuItem key={field.id} value={field.id}>{field.name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          
                          <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Operator</InputLabel>
                            <Select
                              value={filter.operator}
                              label="Operator"
                              onChange={(e) => handleUpdateFilter(index, 'operator', e.target.value)}
                            >
                              <MenuItem value="equals">Equals</MenuItem>
                              <MenuItem value="not_equals">Does Not Equal</MenuItem>
                              <MenuItem value="greater_than">Greater Than</MenuItem>
                              <MenuItem value="less_than">Less Than</MenuItem>
                              <MenuItem value="contains">Contains</MenuItem>
                              <MenuItem value="starts_with">Starts With</MenuItem>
                              <MenuItem value="ends_with">Ends With</MenuItem>
                            </Select>
                          </FormControl>
                          
                          <TextField
                            label="Value"
                            value={filter.value}
                            onChange={(e) => handleUpdateFilter(index, 'value', e.target.value)}
                            size="small"
                            sx={{ flexGrow: 1 }}
                          />
                          
                          <IconButton onClick={() => handleRemoveFilter(index)} color="error">
                            <RemoveCircleIcon />
                          </IconButton>
                        </Box>
                      ))
                    )}
                    
                    <Button 
                      startIcon={<AddIcon />} 
                      variant="outlined"
                      size="small"
                      onClick={handleAddFilter}
                      sx={{ mt: 1 }}
                    >
                      Add Filter
                    </Button>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              
              {/* Visualization & Controls */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>Visualization</Typography>
                
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Select Visualization Type
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                      {visualizationTypes.map(type => (
                        <Chip
                          key={type.id}
                          icon={type.icon}
                          label={type.name}
                          clickable
                          color={selectedVisualization === type.id ? 'primary' : 'default'}
                          onClick={() => setSelectedVisualization(type.id)}
                        />
                      ))}
                    </Box>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Date Range
                    </Typography>
                    <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                      <InputLabel>Time Range</InputLabel>
                      <Select
                        value={dateRange.start}
                        label="Time Range"
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      >
                        <MenuItem value="today">Today</MenuItem>
                        <MenuItem value="yesterday">Yesterday</MenuItem>
                        <MenuItem value="7d">Last 7 Days</MenuItem>
                        <MenuItem value="30d">Last 30 Days</MenuItem>
                        <MenuItem value="90d">Last 90 Days</MenuItem>
                        <MenuItem value="thisMonth">This Month</MenuItem>
                        <MenuItem value="lastMonth">Last Month</MenuItem>
                        <MenuItem value="thisYear">This Year</MenuItem>
                        <MenuItem value="lastYear">Last Year</MenuItem>
                        <MenuItem value="custom">Custom Range</MenuItem>
                      </Select>
                    </FormControl>
                    
                    {dateRange.start === 'custom' && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          label="Start Date"
                          type="date"
                          size="small"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={dateRange.customStart || ''}
                          onChange={(e) => setDateRange({ ...dateRange, customStart: e.target.value })}
                        />
                        <TextField
                          label="End Date"
                          type="date"
                          size="small"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={dateRange.customEnd || ''}
                          onChange={(e) => setDateRange({ ...dateRange, customEnd: e.target.value })}
                        />
                      </Box>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      startIcon={<RefreshIcon />}
                      variant="contained"
                      fullWidth
                      onClick={handleRunReport}
                      disabled={selectedMetrics.length === 0}
                    >
                      Run Report
                    </Button>
                  </CardActions>
                </Card>
                
                {showOutput && !isRunning && !runError && reportResult?.data?.length > 0 && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Export Options
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          startIcon={<DownloadIcon />} 
                          variant="outlined"
                          size="small"
                          onClick={() => handleExportReport('CSV')}
                          disabled={isExporting}
                        >
                          CSV
                        </Button>
                        <Button 
                          startIcon={<DownloadIcon />} 
                          variant="outlined"
                          size="small"
                          onClick={() => handleExportReport('EXCEL')}
                          disabled={isExporting}
                        >
                          Excel
                        </Button>
                        <Button 
                          startIcon={<DownloadIcon />} 
                          variant="outlined"
                          size="small"
                          onClick={() => handleExportReport('PDF')}
                          disabled={isExporting}
                        >
                          PDF
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          </Paper>
          
          {/* Report Output */}
          {showOutput && (
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Report Output</Typography>
              <Divider sx={{ mb: 2 }} />
              
              {renderReportOutput()}
            </Paper>
          )}
        </Grid>
      </Grid>
      
      {/* Save Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save Report</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {isNewReport ? 'Save this report configuration?' : 'Update this report?'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isNewReport 
              ? 'This will save your current report configuration for future use.' 
              : 'This will update the existing saved report with your current configuration.'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveReport} 
            variant="contained"
            disabled={isSaving || isUpdating}
          >
            {isSaving || isUpdating ? (
              <CircularProgress size={24} />
            ) : (
              isNewReport ? 'Save' : 'Update'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Report</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to delete "{reportName}"?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteReport} 
            variant="contained"
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CustomReportBuilder; 