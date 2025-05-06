import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../ui/AdminSidebar';
import AdminBreadcrumbs from './AdminBreadcrumbs';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex h-screen bg-neutral-200">
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full z-40 transition-smooth ${
          sidebarOpen ? 'w-72' : 'w-0'
        } bg-primary-700 overflow-hidden shadow-lg`}
      >
        <AdminSidebar />
      </div>
      
      {/* Main Content */}
      <div 
        className={`flex-1 transition-smooth ${
          sidebarOpen ? 'ml-72' : 'ml-0'
        } min-h-screen`}
      >
        <header className="flex justify-between items-center p-4 bg-white border-b border-neutral-300 shadow-soft">
          <button 
            onClick={toggleSidebar}
            className="md:hidden btn-outline"
            aria-label="Toggle sidebar"
          >
            <i className={`bi ${sidebarOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
          </button>
          
          <button 
            onClick={toggleSidebar}
            className="hidden md:block btn-outline"
            aria-label="Toggle sidebar"
          >
            <i className={`bi ${sidebarOpen ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
          </button>
          
          <div className="flex items-center space-x-2">
            <button className="btn-outline p-2" aria-label="Notifications">
              <i className="bi bi-bell"></i>
            </button>
            <button className="btn-outline p-2" aria-label="Settings">
              <i className="bi bi-gear"></i>
            </button>
          </div>
        </header>
        
        <main className="p-6">
          {/* Add Breadcrumbs */}
          {location.pathname !== '/admin' && (
            <AdminBreadcrumbs />
          )}
          
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 