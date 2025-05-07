import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminSidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [expandedMenus, setExpandedMenus] = useState({});
  
  // Check if the current route starts with the given path
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  // Check if the user has the required role
  const hasRole = (requiredRoles) => {
    if (!user || !user.role) return false;
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    
    return user.role === requiredRoles;
  };
  
  const toggleSubmenu = (index) => {
    setExpandedMenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Admin sidebar links with their required roles
  const sidebarLinks = [
    {
      name: 'Dashboard',
      icon: 'bi-speedometer2',
      path: '/dashboard',
      roles: ['admin', 'manager', 'sales']
    },
    {
      name: 'Products',
      icon: 'bi-box-seam',
      path: '/products',
      roles: ['admin', 'manager'],
      submenu: [
        {
          name: 'All Products',
          path: '/products'
        },
        {
          name: 'Add Product',
          path: '/products/add'
        },
        {
          name: 'Categories',
          path: '/categories'
        },
        {
          name: 'Producers',
          path: '/producers'
        }
      ]
    },
    {
      name: 'Customers',
      icon: 'bi-people',
      path: '/customers',
      roles: ['admin', 'manager', 'sales'],
      submenu: [
        {
          name: 'All Customers',
          path: '/customers'
        },
        {
          name: 'Add Customer',
          path: '/customers/add'
        }
      ]
    },
    {
      name: 'Orders',
      icon: 'bi-cart3',
      path: '/orders',
      roles: ['admin', 'manager', 'sales'],
      submenu: [
        {
          name: 'All Orders',
          path: '/orders'
        },
        {
          name: 'Create Order',
          path: '/orders/add'
        },
        {
          name: 'Shipments',
          path: '/shipments'
        }
      ]
    },
    {
      name: 'Reports',
      icon: 'bi-graph-up',
      path: '/reports',
      roles: ['admin', 'manager'],
      submenu: [
        {
          name: 'Sales Report',
          path: '/reports/sales'
        },
        {
          name: 'Inventory Report',
          path: '/reports/inventory'
        },
        {
          name: 'Customer Report',
          path: '/reports/customers'
        }
      ]
    },
    {
      name: 'Users',
      icon: 'bi-person-badge',
      path: '/users',
      roles: ['admin'],
      submenu: [
        {
          name: 'All Users',
          path: '/users'
        },
        {
          name: 'Add User',
          path: '/users/add'
        },
        {
          name: 'Roles',
          path: '/roles'
        }
      ]
    },
    {
      name: 'Settings',
      icon: 'bi-gear',
      path: '/settings',
      roles: ['admin'],
      submenu: [
        {
          name: 'Configurações Gerais',
          path: '/settings'
        },
        {
          name: 'Informações da Empresa',
          path: '/company-info'
        }
      ]
    }
  ];
  
  return (
    <div className="h-full flex flex-col p-4 text-white">
      <div className="flex items-center justify-center mb-6 pt-2">
        <h1 className="text-xl font-bold text-white">AliTools B2B</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {sidebarLinks.map((link, index) => {
            // Skip links that the user doesn't have permission for
            if (!hasRole(link.roles)) return null;
            
            // Check if the link is active
            const active = isActive(link.path);
            
            // Set the expanded state based on active state
            if (active && !expandedMenus[index]) {
              expandedMenus[index] = true;
            }
            
            // If the link has a submenu, render it as a collapsible menu
            if (link.submenu) {
              return (
                <li key={index}>
                  <button
                    className={`w-full flex items-center justify-between p-2 rounded-md transition-smooth ${
                      active ? 'bg-primary-600 text-white' : 'text-neutral-100 hover:bg-primary-600/50'
                    }`}
                    onClick={() => toggleSubmenu(index)}
                  >
                    <div className="flex items-center">
                      <i className={`bi ${link.icon} mr-3 text-lg`}></i>
                      <span>{link.name}</span>
                    </div>
                    <i className={`bi ${expandedMenus[index] ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                  </button>
                  
                  {expandedMenus[index] && (
                    <ul className="pl-6 mt-2 space-y-1">
                      {link.submenu.map((submenu, subIndex) => (
                        <li key={subIndex}>
                          <NavLink
                            to={submenu.path}
                            className={({ isActive }) =>
                              `block p-2 rounded-md transition-smooth ${
                                isActive 
                                  ? 'bg-primary-500/30 text-white' 
                                  : 'text-neutral-300 hover:bg-primary-500/20 hover:text-white'
                              }`
                            }
                          >
                            <div className="flex items-center">
                              <i className="bi bi-arrow-right-short mr-2"></i>
                              <span>{submenu.name}</span>
                            </div>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }
            
            // Otherwise, render a regular link
            return (
              <li key={index}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-md transition-smooth ${
                      isActive 
                        ? 'bg-primary-600 text-white' 
                        : 'text-neutral-100 hover:bg-primary-600/50'
                    }`
                  }
                >
                  <i className={`bi ${link.icon} mr-3 text-lg`}></i>
                  <span>{link.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="mt-auto pt-4 border-t border-primary-600">
        <div className="flex items-center p-2">
          <div className="flex-shrink-0 mr-3 bg-secondary-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
            <i className="bi bi-person"></i>
          </div>
          <div>
            <div className="text-sm font-medium text-white">{user?.name || 'User'}</div>
            <div className="text-xs text-primary-300">{user?.role || 'Role'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar; 