import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { styled, useTheme } from '@mui/material/styles';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
  useMediaQuery,
  Typography,
  IconButton,
  Collapse,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as ProfileIcon,
  ShoppingCart as OrdersIcon,
  Home as AddressBookIcon,
  Favorite as WishlistIcon,
  Help as SupportIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Payment as PaymentMethodsIcon,
  Store as StoreIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  StarBorder as StarBorderIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';

// Import styles
import { drawerWidth, styles } from './CustomerSidebar.styles';

// Styled components
const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...styles(theme).drawer,
      '& .MuiDrawer-paper': styles(theme).drawer['& .MuiDrawer-paper'],
    }),
    ...(!open && {
      overflowX: 'hidden',
      width: `calc(${theme.spacing(9)} + 1px)`,
      [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(9)} + 1px)`,
      },
    }),
  })
);

const StyledDrawerMobile = styled(Drawer)(({ theme }) => ({
  ...styles(theme).drawerMobile,
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  ...styles(theme).toolbar,
}));

const LogoContainer = styled('div')(({ theme }) => ({
  ...styles(theme).logoContainer,
}));

const LogoIcon = styled('div')(({ theme }) => ({
  ...styles(theme).logoIcon,
}));

const LogoText = styled(Typography)(({ theme }) => ({
  ...styles(theme).logoText,
}));

const MenuSection = styled('div')(({ theme }) => ({
  ...styles(theme).menuSection,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  ...styles(theme).sectionTitle,
}));

const StyledListItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'isActive' && prop !== 'isSubItem',
})(({ theme, isActive, isSubItem }) => ({
  ...(isSubItem ? styles(theme).subMenuItem : styles(theme).menuItem),
  ...(isActive && {
    ...(isSubItem 
      ? styles(theme).subMenuItem['&.Mui-selected']
      : styles(theme).menuItem['&.Mui-selected']
    ),
  }),
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  ...styles(theme).menuItemIcon,
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  ...styles(theme).menuItemText,
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  ...styles(theme).divider,
}));

const LogoutButton = styled(ListItemButton)(({ theme }) => ({
  ...styles(theme).logoutButton,
}));

const CollapseButton = styled(ListItemButton)(({ theme }) => ({
  ...styles(theme).collapseButton,
}));

const CollapseIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isOpen',
})(({ theme, isOpen }) => ({
  ...styles(theme).collapseIcon,
  ...(isOpen && styles(theme).collapseIconOpen),
}));

// Menu items
const mainMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/customer/dashboard' },
  { text: 'Meu Perfil', icon: <ProfileIcon />, path: '/customer/profile' },
  { text: 'Meus Pedidos', icon: <OrdersIcon />, path: '/customer/orders' },
  { text: 'Endereços', icon: <AddressBookIcon />, path: '/customer/addresses' },
  { text: 'Lista de Desejos', icon: <WishlistIcon />, path: '/customer/wishlist', badge: 3 },
  { text: 'Atendimento', icon: <SupportIcon />, path: '/customer/support' },
];

const accountMenuItems = [
  { text: 'Configurações da Conta', icon: <SettingsIcon />, path: '/customer/account' },
  { text: 'Notificações', icon: <NotificationsIcon />, path: '/customer/notifications', badge: 5 },
  { text: 'Formas de Pagamento', icon: <PaymentMethodsIcon />, path: '/customer/payment-methods' },
];

const CustomerSidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [accountMenuOpen, setAccountMenuOpen] = useState(true);
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const toggleAccountMenu = () => {
    setAccountMenuOpen(!accountMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
      }}
    >
      {/* Logo and Close Button */}
      <StyledToolbar>
        <LogoContainer component="a" href="/">
          <LogoIcon>
            <StoreIcon />
          </LogoIcon>
          {open && <LogoText variant="h6">AliTools</LogoText>}
        </LogoContainer>
        {!isMobile && open && (
          <IconButton onClick={onClose} size="small">
            <ChevronLeftIcon />
          </IconButton>
        )}
      </StyledToolbar>

      {/* User Profile */}
      {open && (
        <Box sx={{ px: 2, py: 1.5, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar
              src={user?.avatar}
              alt={user?.name}
              sx={{
                width: 40,
                height: 40,
                mr: 1.5,
                bgcolor: 'primary.main',
              }}
            >
              {user?.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" noWrap>
                {user?.name || 'Usuário'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.email || 'usuario@exemplo.com'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      <Divider />

      {/* Main Menu */}
      <List sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', py: 1 }}>
        <MenuSection>
          <SectionTitle>Menu</SectionTitle>
          {mainMenuItems.map((item) => {
            const isItemActive = isActive(item.path);
            return (
              <Tooltip 
                key={item.text} 
                title={!open ? item.text : ''} 
                placement="right"
                arrow
              >
                <StyledListItem
                  isActive={isItemActive}
                  onClick={() => handleNavigation(item.path)}
                >
                  <StyledListItemIcon>{item.icon}</StyledListItemIcon>
                  <StyledListItemText primary={item.text} />
                  {item.badge && (
                    <Box
                      sx={{
                        bgcolor: isItemActive ? 'primary.contrastText' : 'primary.main',
                        color: isItemActive ? 'primary.main' : 'primary.contrastText',
                        borderRadius: 10,
                        px: 1,
                        py: 0.25,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        ml: 1,
                      }}
                    >
                      {item.badge}
                    </Box>
                  )}
                </StyledListItem>
              </Tooltip>
            );
          })}
        </MenuSection>

        <StyledDivider />

        {/* Account Settings */}
        <MenuSection>
          <CollapseButton onClick={toggleAccountMenu}>
            <StyledListItemIcon>
              <SettingsIcon />
            </StyledListItemIcon>
            {open && <StyledListItemText primary="Minha Conta" />}
            <CollapseIcon isOpen={accountMenuOpen}>
              {accountMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </CollapseIcon>
          </CollapseButton>
          
          <Collapse in={accountMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {accountMenuItems.map((item) => {
                const isItemActive = isActive(item.path);
                return (
                  <Tooltip 
                    key={item.text} 
                    title={!open ? item.text : ''} 
                    placement="right"
                    arrow
                  >
                    <StyledListItem
                      isActive={isItemActive}
                      isSubItem
                      onClick={() => handleNavigation(item.path)}
                      sx={{ pl: open ? 6 : 3 }}
                    >
                      <StyledListItemIcon>{item.icon}</StyledListItemIcon>
                      {open && <StyledListItemText primary={item.text} />}
                      {item.badge && open && (
                        <Box
                          sx={{
                            bgcolor: isItemActive ? 'primary.contrastText' : 'primary.main',
                            color: isItemActive ? 'primary.main' : 'primary.contrastText',
                            borderRadius: 10,
                            px: 1,
                            py: 0.25,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            ml: 1,
                          }}
                        >
                          {item.badge}
                        </Box>
                      )}
                    </StyledListItem>
                  </Tooltip>
                );
              })}
            </List>
          </Collapse>
        </MenuSection>
      </List>

      {/* Logout Button */}
      <Box sx={{ p: 1.5, pt: 0 }}>
        <Tooltip title={!open ? 'Sair' : ''} placement="right" arrow>
          <LogoutButton onClick={handleLogout}>
            <StyledListItemIcon>
              <LogoutIcon />
            </StyledListItemIcon>
            {open && <StyledListItemText primary="Sair" />}
          </LogoutButton>
        </Tooltip>
      </Box>
    </Box>
  );

  // Mobile Drawer
  if (isMobile) {
    return (
      <StyledDrawerMobile
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
      >
        {drawerContent}
      </StyledDrawerMobile>
    );
  }

  // Desktop Drawer
  return (
    <StyledDrawer variant="permanent" open={open}>
      {drawerContent}
    </StyledDrawer>
  );
};

export default CustomerSidebar;
