import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { 
  FaUser, 
  FaShoppingBag, 
  FaAddressCard, 
  FaShoppingCart, 
  FaBell, 
  FaLock,
  FaChevronRight,
  FaBars,
  FaTimes
} from 'react-icons/fa';

/**
 * Customer Dashboard Layout Component
 * Provides a consistent layout for all customer dashboard pages with a responsive sidebar
 */
const CustomerDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();
  
  // Extract current section from path for highlighting the active nav item
  const currentPath = location.pathname;
  
  // Navigation items for sidebar
  const navigationItems = [
    { name: 'Visão Geral', path: '/account', icon: <FaUser className="w-5 h-5" /> },
    { name: 'Meu Perfil', path: '/account/profile', icon: <FaUser className="w-5 h-5" /> },
    { name: 'Meus Pedidos', path: '/account/orders', icon: <FaShoppingBag className="w-5 h-5" /> },
    { name: 'Endereços', path: '/account/addresses', icon: <FaAddressCard className="w-5 h-5" /> },
    { name: 'Carrinhos Salvos', path: '/account/saved-carts', icon: <FaShoppingCart className="w-5 h-5" /> },
    { name: 'Notificações', path: '/account/notifications', icon: <FaBell className="w-5 h-5" /> },
    { name: 'Segurança', path: '/account/security', icon: <FaLock className="w-5 h-5" /> },
  ];
  
  // Toggle sidebar for mobile view
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = currentPath.split('/').filter(segment => segment);
    
    // Maps path segments to readable names
    const pathToNameMap = {
      'account': 'Minha Conta',
      'profile': 'Perfil',
      'orders': 'Pedidos',
      'addresses': 'Endereços',
      'saved-carts': 'Carrinhos Salvos',
      'notifications': 'Notificações',
      'security': 'Segurança',
    };
    
    return (
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <NavLink to="/" className="hover:text-gray-700">Home</NavLink>
        <FaChevronRight className="mx-2 w-3 h-3" />
        {pathSegments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;
          
          return (
            <React.Fragment key={path}>
              {index > 0 && <FaChevronRight className="mx-2 w-3 h-3" />}
              {isLast ? (
                <span className="font-medium text-gray-900">{pathToNameMap[segment] || segment}</span>
              ) : (
                <NavLink to={path} className="hover:text-gray-700">
                  {pathToNameMap[segment] || segment}
                </NavLink>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Mobile toggle button */}
      <button
        className="fixed top-24 left-4 z-50 lg:hidden bg-white p-2 rounded-md shadow-md"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
      </button>
      
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - responsive */}
        <aside
          className={`fixed lg:sticky top-0 lg:top-24 h-screen z-40 w-64 bg-white shadow-md transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
        >
          <div className="flex flex-col h-full py-6">
            {/* User info */}
            <div className="px-6 pb-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
            
            {/* Navigation links */}
            <nav className="flex-1 px-3 mt-5 space-y-1">
              {navigationItems.map((item) => {
                const isActive = currentPath === item.path || 
                  (item.path !== '/account' && currentPath.startsWith(item.path));
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => 
                      `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        isActive 
                          ? 'bg-amber-50 text-amber-900'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Breadcrumbs */}
          {generateBreadcrumbs()}
          
          {/* Page content */}
          <div className="bg-white rounded-lg shadow p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboardLayout; 