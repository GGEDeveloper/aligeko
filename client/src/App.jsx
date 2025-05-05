import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// Authentication
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RegisterSuccessPage from './pages/auth/RegisterSuccessPage';
import TwoFactorSettingsPage from './pages/auth/TwoFactorSettingsPage';

// User
import DashboardPage from './pages/user/DashboardPage';

// Product Pages
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="register-success" element={<RegisterSuccessPage />} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        
        {/* Protected routes - Admin Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* Product routes */}
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            
            {/* Account routes */}
            <Route path="account/two-factor" element={<TwoFactorSettingsPage />} />
            
            {/* More admin routes can be added here */}
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App; 