import React from 'react';
import { 
  Box, 
  useTheme, 
  Typography 
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

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
            {`${entry.name}: ${entry.value.toLocaleString()}`}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

const CustomerAcquisitionChart = ({ data = [] }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="date" 
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="newCustomers"
            name="New Customers"
            stroke={theme.palette.primary.main}
            fill={theme.palette.primary.light}
            fillOpacity={0.6}
            stackId="1"
          />
          <Area
            type="monotone"
            dataKey="returningCustomers"
            name="Returning Customers"
            stroke={theme.palette.secondary.main}
            fill={theme.palette.secondary.light}
            fillOpacity={0.6}
            stackId="1"
          />
          <Area
            type="monotone"
            dataKey="churn"
            name="Customer Churn"
            stroke={theme.palette.error.main}
            fill={theme.palette.error.light}
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CustomerAcquisitionChart; 