import { alpha } from '@mui/material/styles';

export const drawerWidth = 280;

export const styles = (theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    '& .MuiDrawer-paper': {
      width: drawerWidth,
      backgroundColor: theme.palette.background.paper,
      borderRight: 'none',
      boxShadow: theme.shadows[3],
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    '& .MuiDrawer-paperAnchorDockedLeft': {
      borderRight: 'none',
    },
  },
  
  drawerMobile: {
    '& .MuiDrawer-paper': {
      width: drawerWidth,
      backgroundColor: theme.palette.background.paper,
    },
  },
  
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 2),
    minHeight: '64px !important',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2, 3, 1.5, 3),
    marginBottom: theme.spacing(1),
    textDecoration: 'none',
    color: 'inherit',
  },
  
  logoText: {
    marginLeft: theme.spacing(1.5),
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  
  logoIcon: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '& svg': {
      fontSize: '1.25rem',
    },
  },
  
  menuSection: {
    marginTop: theme.spacing(3),
    '&:first-of-type': {
      marginTop: 0,
    },
  },
  
  sectionTitle: {
    padding: theme.spacing(0.5, 3, 0.5, 4),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(0.5),
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  
  menuItem: {
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0, 1.5, 0.5, 1.5),
    padding: theme.spacing(0.75, 2),
    minHeight: 44,
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.15),
      },
      '& .MuiListItemIcon-root': {
        color: theme.palette.primary.main,
      },
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  
  menuItemIcon: {
    minWidth: 40,
    color: 'inherit',
    '& svg': {
      fontSize: '1.25rem',
    },
  },
  
  menuItemText: {
    '& span': {
      fontWeight: 500,
    },
  },
  
  subMenuItem: {
    paddingLeft: theme.spacing(5),
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  },
  
  divider: {
    margin: theme.spacing(2, 0),
    borderColor: theme.palette.divider,
  },
  
  logoutButton: {
    marginTop: 'auto',
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1, 2),
    color: theme.palette.error.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.error.main, 0.08),
    },
  },
  
  collapseButton: {
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0, 1.5, 0.5, 1.5),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  
  collapseIcon: {
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  
  collapseIconOpen: {
    transform: 'rotate(180deg)',
  },
});
