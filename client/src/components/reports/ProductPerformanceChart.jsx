import React from 'react';
import { 
  Box, 
  useTheme,
  Typography
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
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
        <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>
        <Typography variant="body2">
          Sales: {formatCurrency(payload[0].value)}
        </Typography>
        <Typography variant="body2">
          Units Sold: {payload[1]?.value.toLocaleString()}
        </Typography>
      </Box>
    );
  }
  return null;
};

const ProductPerformanceChart = ({ data = [] }) => {
  const theme = useTheme();
  
  // If we have more than 5 products, only show top 5
  const displayData = data.slice(0, 5).map(product => ({
    ...product,
    name: product.name.length > 20 
      ? `${product.name.substring(0, 18)}...` 
      : product.name,
    fullName: product.name  // Keep original name for tooltip
  }));
  
  return (
    <Box sx={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={displayData}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 150,  // Increase left margin for longer product names
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            type="number" 
            stroke={theme.palette.text.secondary}
            tickFormatter={(value) => formatCurrency(value).replace('.00', '')}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            type="category"
            dataKey="fullName"
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 12 }}
            width={140}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="sales" 
            name="Sales ($)" 
            fill={theme.palette.primary.main}
          />
          <Bar 
            dataKey="unitsSold" 
            name="Units Sold" 
            fill={theme.palette.secondary.main} 
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ProductPerformanceChart; 