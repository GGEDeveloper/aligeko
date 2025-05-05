import React from 'react';
import { Nav, Accordion } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminSidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
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
      roles: ['admin']
    }
  ];
  
  return (
    <div className="admin-sidebar bg-dark text-white p-3">
      <h5 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-2 mb-4 text-white">
        <span>B2B Admin</span>
      </h5>
      
      <Nav className="flex-column">
        {sidebarLinks.map((link, index) => {
          // Skip links that the user doesn't have permission for
          if (!hasRole(link.roles)) return null;
          
          // If the link has a submenu, render it as an accordion
          if (link.submenu) {
            return (
              <Accordion 
                key={index} 
                className="sidebar-accordion mb-2"
                defaultActiveKey={isActive(link.path) ? `panel-${index}` : null}
              >
                <Accordion.Item eventKey={`panel-${index}`} className="bg-dark border-0">
                  <Accordion.Header className="sidebar-accordion-header">
                    <i className={`bi ${link.icon} me-2`}></i>
                    {link.name}
                  </Accordion.Header>
                  <Accordion.Body className="p-0">
                    <Nav className="flex-column ps-3 my-2">
                      {link.submenu.map((submenu, subIndex) => (
                        <Nav.Item key={subIndex}>
                          <NavLink
                            to={submenu.path}
                            className={({ isActive }) =>
                              `nav-link py-2 ${isActive ? 'active' : ''}`
                            }
                          >
                            <i className="bi bi-arrow-right-short me-1"></i>
                            {submenu.name}
                          </NavLink>
                        </Nav.Item>
                      ))}
                    </Nav>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            );
          }
          
          // Otherwise, render a regular link
          return (
            <Nav.Item key={index} className="mb-2">
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `nav-link py-2 ${isActive ? 'active' : ''}`
                }
              >
                <i className={`bi ${link.icon} me-2`}></i>
                {link.name}
              </NavLink>
            </Nav.Item>
          );
        })}
      </Nav>
      
      <div className="mt-5 pt-3 border-top border-secondary">
        <div className="px-3 py-2 d-flex align-items-center">
          <div className="d-flex align-items-center">
            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
              <i className="bi bi-person"></i>
            </div>
            <div>
              <div className="small text-white">{user?.name || 'User'}</div>
              <div className="small text-muted">{user?.role || 'Role'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar; 