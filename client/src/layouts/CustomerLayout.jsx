import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, CssBaseline, styled } from '@mui/material';
import CustomerSidebar from '../components/customer/CustomerSidebar';
import CustomerHeader from '../components/customer/CustomerHeader';
import Footer from '../../components/ui/Footer';

// Styled components
const MainContent = styled(Box)(({ theme: t }) => ({
  flexGrow: 1,
  padding: t.spacing(3),
  width: '100%',
  [t.breakpoints.up('md')]: {
    width: 'calc(100% - 240px)',
    marginLeft: '240px',
  },
  marginTop: '64px', // Height of the AppBar
  backgroundColor: t.palette.background.default,
  minHeight: 'calc(100vh - 64px)',
  display: 'flex',
  flexDirection: 'column',
}));

const ContentWrapper = styled(Box)(() => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
}));

const CustomerLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Hide footer on certain routes if needed
  const hideFooter = false; // Add route conditions here if needed

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <CustomerHeader onMenuClick={handleDrawerToggle} />
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <CustomerSidebar open={mobileOpen} onClose={handleDrawerToggle} />
        
        {/* Main Content */}
        <MainContent component="main">
          <ContentWrapper>
            <Container maxWidth={false} sx={{ flex: 1 }}>
              <Outlet />
            </Container>
            {!hideFooter && (
              <Box sx={{ mt: 'auto' }}>
                <Footer />
              </Box>
            )}
          </ContentWrapper>
        </MainContent>
      </Box>
    </Box>
  );
};

export default CustomerLayout;
