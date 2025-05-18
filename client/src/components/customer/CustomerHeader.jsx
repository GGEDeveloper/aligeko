import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';

const CustomerHeader = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
    // Dispatch logout action
    handleMenuClose();
    navigate('/login');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/customer/profile');
  };

  const handleSettings = () => {
    handleMenuClose();
    navigate('/customer/settings');
  };

  const menuId = 'primary-account-menu';
  const notificationsId = 'primary-notifications-menu';
  const isMenuOpen = Boolean(anchorEl);
  const isNotificationsOpen = Boolean(notificationsAnchorEl);

  // Mock notifications
  const notifications = [
    { id: 1, text: 'Your order #12345 has been shipped', time: '2 hours ago', read: false },
    { id: 2, text: 'Special offer: 20% off on all products', time: '1 day ago', read: true },
    { id: 3, text: 'Your review was published', time: '3 days ago', read: true },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - 240px)` },
        ml: { md: '240px' },
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              size="large"
              aria-label={`show ${unreadCount} new notifications`}
              color="inherit"
              onClick={handleNotificationsOpen}
              aria-controls={notificationsId}
              aria-haspopup="true"
              aria-expanded={isNotificationsOpen ? 'true' : undefined}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={notificationsAnchorEl}
            id={notificationsId}
            open={isNotificationsOpen}
            onClose={handleNotificationsClose}
            onClick={handleNotificationsClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ width: 360, maxWidth: '100%', p: 2 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                Notifications
              </Typography>
              <Divider sx={{ mb: 1 }} />
              
              {notifications.length > 0 ? (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {notifications.map((notification) => (
                    <MenuItem 
                      key={notification.id}
                      sx={{
                        py: 1.5,
                        borderRadius: 1,
                        mb: 0.5,
                        bgcolor: !notification.read ? 'action.hover' : 'transparent',
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2">
                          {notification.text}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.time}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Box>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <NotificationsIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No new notifications
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 1 }} />
              <Box sx={{ textAlign: 'center', pt: 1 }}>
                <Typography 
                  variant="button" 
                  sx={{ 
                    color: 'primary.main', 
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  View All Notifications
                </Typography>
              </Box>
            </Box>
          </Menu>
          
          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={isMenuOpen ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={isMenuOpen ? 'true' : undefined}
              >
                <Avatar 
                  alt={user?.name || 'User'} 
                  src={user?.avatar} 
                  sx={{ width: 36, height: 36 }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            {!isMobile && (
              <Box sx={{ ml: 1, textAlign: 'left' }}>
                <Typography variant="subtitle2" noWrap>
                  {user?.name || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {user?.email || 'user@example.com'}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Toolbar>
      
      <Menu
        anchorEl={anchorEl}
        id={menuId}
        open={isMenuOpen}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {user?.name || 'User'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email || 'user@example.com'}
          </Typography>
        </Box>
        <Divider />
        
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error' }}>
            Logout
          </ListItemText>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default CustomerHeader;
