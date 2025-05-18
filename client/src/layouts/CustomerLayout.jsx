import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import CustomerSidebar from '../components/customer/CustomerSidebar';
import CustomerHeader from '../components/customer/CustomerHeader';

const CustomerLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Header */}
      <CustomerHeader onMenuClick={handleDrawerToggle} />
      
      {/* Sidebar */}
      <CustomerSidebar 
        open={mobileOpen} 
        onClose={handleDrawerToggle} 
      />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 240px)` },
          ml: { md: '240px' },
          mt: '64px', // Height of the AppBar
          backgroundColor: theme.palette.background.default,
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Container maxWidth={false}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default CustomerLayout;
