import React, { useState } from 'react';
import { 
  Box, 
  ToggleButtonGroup, 
  ToggleButton, 
  useTheme, 
  Typography 
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 2,
          border: 1,
          borderColor: 'grey.300',
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Typography variant="subtitle2">{label}</Typography>
        {payload.map((entry, index) => (
          <Typography
            key={`item-${index}`}
            variant="body2"
            sx={{ color: entry.color, mt: 0.5 }}
          >
            {`${entry.name}: ${entry.value.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}`}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

const SalesChart = ({ data = [] }) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState('revenue');
  
  const handleViewChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };
  
  const renderChart = () => {
    switch (viewMode) {
      case 'revenue':
        return (
          <>
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </>
        );
      case 'orders':
        return (
          <>
            <Line
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </>
        );
      case 'combined':
        return (
          <>
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
              yAxisId="left"
            />
            <Line
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
              yAxisId="right"
            />
          </>
        );
      default:
        return null;
    }
  };
  
  // Format Y-axis values
  const formatYAxis = (value) => {
    if (viewMode === 'orders' || (viewMode === 'combined' && value < 1000)) {
      return value;
    }
    return formatCurrency(value).replace('.00', '');
  };
  
  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          size="small"
        >
          <ToggleButton value="revenue">
            Revenue
          </ToggleButton>
          <ToggleButton value="orders">
            Orders
          </ToggleButton>
          <ToggleButton value="combined">
            Combined
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 60,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="date" 
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId={viewMode === 'combined' ? 'left' : 'left'}
            tickFormatter={formatYAxis}
            stroke={theme.palette.primary.main}
            tick={{ fontSize: 12 }}
          />
          {viewMode === 'combined' && (
            <YAxis 
              yAxisId="right" 
              orientation="right"
              stroke={theme.palette.secondary.main}
              tick={{ fontSize: 12 }}
            />
          )}
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {renderChart()}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default SalesChart; 