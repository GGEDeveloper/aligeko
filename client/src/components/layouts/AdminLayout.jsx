import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import AdminSidebar from '../ui/AdminSidebar';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="admin-layout d-flex vh-100">
      {/* Sidebar */}
      <div 
        className={`sidebar-wrapper ${sidebarOpen ? 'open' : 'closed'}`} 
        style={{ 
          width: sidebarOpen ? '280px' : '0',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 1000,
          backgroundColor: '#343a40'
        }}
      >
        <AdminSidebar />
      </div>
      
      {/* Main Content */}
      <div 
        className="main-content flex-grow-1 bg-light"
        style={{ 
          marginLeft: sidebarOpen ? '280px' : '0',
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh'
        }}
      >
        <div className="p-3 border-bottom bg-white d-flex justify-content-between align-items-center shadow-sm">
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={toggleSidebar}
            className="d-md-none"
          >
            <i className={`bi ${sidebarOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
          </Button>
          
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={toggleSidebar}
            className="d-none d-md-block"
          >
            <i className={`bi ${sidebarOpen ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
          </Button>
          
          <div className="d-flex align-items-center">
            <Button variant="outline-secondary" size="sm" className="me-2">
              <i className="bi bi-bell"></i>
            </Button>
            <Button variant="outline-secondary" size="sm">
              <i className="bi bi-gear"></i>
            </Button>
          </div>
        </div>
        
        <Container fluid className="py-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default AdminLayout; 