import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import CustomerSidebar from '../customer/CustomerSidebar';
import CustomerHeader from '../customer/CustomerHeader';

const CustomerLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CustomerSidebar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomerHeader />
        <Box component="main" sx={{ flex: 1, py: 3, px: { xs: 2, md: 4 } }}>
          <Container maxWidth="xl">
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default CustomerLayout;
