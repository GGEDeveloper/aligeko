import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../../store/slices/authSlice';
import {
  FaUser,
  FaShoppingBag,
  FaAddressCard,
  FaShoppingCart,
  FaBell,
  FaLock,
  FaChevronRight,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaCog,
  FaChevronDown,
  FaHome,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../ui/Footer';

const CustomerDashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadNotifications] = useState(3); // Mock de notificações não lidas
  const currentPath = location.pathname;
  const profileRef = useRef(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Navigation items for sidebar
  const navigationItems = [
    {
      name: 'Visão Geral',
      path: '/account',
      icon: <FaUser className="w-5 h-5" />,
    },
    {
      name: 'Meu Perfil',
      path: '/account/profile',
      icon: <FaUser className="w-5 h-5" />,
    },
    {
      name: 'Meus Pedidos',
      path: '/account/orders',
      icon: <FaShoppingBag className="w-5 h-5" />,
    },
    {
      name: 'Endereços',
      path: '/account/addresses',
      icon: <FaAddressCard className="w-5 h-5" />,
    },
    {
      name: 'Carrinhos Salvos',
      path: '/account/saved-carts',
      icon: <FaShoppingCart className="w-5 h-5" />,
    },
    {
      name: 'Notificações',
      path: '/account/notifications',
      icon: <FaBell className="w-5 h-5" />,
      badge: 3, // Exemplo de notificações não lidas
    },
    {
      name: 'Segurança',
      path: '/account/security',
      icon: <FaLock className="w-5 h-5" />,
    },
  ];

  // Toggle sidebar
  const toggleSidebar = (e) => {
    if (e) e.stopPropagation();
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Add click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isSidebarOpen) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(e.target)) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = currentPath.split('/').filter(segment => segment);
    
    // Maps path segments to readable names
    const pathToNameMap = {
      account: 'Minha Conta',
      profile: 'Perfil',
      orders: 'Pedidos',
      addresses: 'Endereços',
      'saved-carts': 'Carrinhos Salvos',
      notifications: 'Notificações',
      security: 'Segurança',
    };
    
    return (
      <nav
        aria-label="Navegação"
        className="flex items-center text-sm text-gray-500 mb-4 px-4 lg:px-0"
      >
        <NavLink to="/" className="text-amber-600 hover:text-amber-800" aria-label="Página inicial">
          Home
        </NavLink>
        <FaChevronRight className="mx-2 w-3 h-3" />
        {pathSegments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;
          
          return (
            <React.Fragment key={path}>
              <span className="mx-2">/</span>
              {isLast ? (
                <span className="text-gray-700">{pathToNameMap[segment] || segment}</span>
              ) : (
                <NavLink 
                  to={path}
                  className="text-amber-600 hover:text-amber-800"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {pathToNameMap[segment] || segment}
                </NavLink>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  };
  
  // Render the profile dropdown
  const renderProfileDropdown = () => (
    <div className="relative ml-4" ref={profileRef}>
      <button
        type="button"
        className="flex items-center max-w-xs rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        id="user-menu-button"
        aria-expanded={isProfileOpen}
        aria-haspopup="true"
        onClick={() => setIsProfileOpen(!isProfileOpen)}
      >
        <span className="sr-only">Abrir menu do usuário</span>
        <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-medium">
          {user?.firstName?.charAt(0) || 'U'}
        </div>
        <span className="ml-2 hidden md:inline text-sm font-medium text-gray-700">
          {user?.firstName || 'Usuário'}
        </span>
        <FaChevronDown className="ml-1 h-3 w-3 text-gray-400" />
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
            tabIndex="-1"
          >
            <div className="px-4 py-3">
              <p className="text-sm text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm font-medium text-gray-500 truncate">{user?.email}</p>
            </div>
            <div className="border-t border-gray-100">
              <NavLink
                to="/account/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                tabIndex="-1"
              >
                <FaUser className="mr-3 h-5 w-5 text-gray-400" />
                Meu Perfil
              </NavLink>
              <NavLink
                to="/account/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                tabIndex="-1"
              >
                <FaCog className="mr-3 h-5 w-5 text-gray-400" />
                Configurações
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                tabIndex="-1"
              >
                <FaSignOutAlt className="mr-3 h-5 w-5 text-gray-400" />
                Sair
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Render notifications button
  const renderNotifications = () => (
    <div className="relative">
      <button
        type="button"
        className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 relative"
        aria-label="Notificações"
      >
        <FaBell className="h-6 w-6" />
        {unreadNotifications > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white">
            <span className="sr-only">{unreadNotifications} notificações não lidas</span>
          </span>
        )}
      </button>
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
          onKeyDown={e => e.key === 'Escape' && toggleSidebar()}
          role="button"
          tabIndex={0}
          aria-label="Fechar menu"
        />
      )}
      
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden mr-2 p-2 rounded-md text-gray-700"
                onClick={toggleSidebar}
                aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={isSidebarOpen}
              >
                {isSidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
              </button>
              <NavLink to="/" className="flex-shrink-0">
                <span className="text-xl font-bold text-amber-600">AliTools</span>
              </NavLink>
            </div>
            
            <div className="flex items-center space-x-4">
              <NavLink 
                to="/" 
                className="hidden md:flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-amber-600"
              >
                <FaHome className="mr-2" /> Voltar para a Loja
              </NavLink>
              {renderNotifications()}
              {renderProfileDropdown()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          id="sidebar"
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-200 ease-in-out`}
        >
          <div className="h-full flex flex-col">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-amber-50">
              <span className="text-xl font-bold text-amber-600">Minha Conta</span>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 px-3 mt-5 space-y-1">
              {navigationItems.map(item => {
                const isActive = currentPath === item.path || 
                  (item.path !== '/account' && currentPath.startsWith(item.path));
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-amber-50 text-amber-700 border-l-4 border-amber-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="flex-shrink-0 w-6 h-6 text-amber-600">
                      {item.icon}
                    </span>
                    <span className="ml-3">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:pl-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {generateBreadcrumbs()}
            <div className="bg-white shadow rounded-lg p-6">
              <Outlet />
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboardLayout;
