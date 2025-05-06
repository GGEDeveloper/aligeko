import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './components/checkout/checkout.css';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import SessionManager from './components/auth/SessionManager';

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
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import CheckoutSuccessPage from './pages/user/CheckoutSuccessPage';

// Product Pages
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ProductsManagementPage from './pages/admin/ProductsManagementPage';
import CreateProductPage from './pages/admin/CreateProductPage';
import EditProductPage from './pages/admin/EditProductPage';
import AdminProductDetailPage from './pages/admin/ProductDetailPage';
import CategoriesAndAttributesPage from './pages/admin/CategoriesAndAttributesPage';

// Customer Management Pages
import CustomersManagementPage from './pages/admin/CustomersManagementPage';
import CustomerDetailPage from './pages/admin/CustomerDetailPage';

// Order Management Pages
import OrdersManagementPage from './pages/admin/OrdersManagementPage';
import OrderDetailPage from './pages/admin/OrderDetailPage';
import OrderEditPage from './pages/admin/OrderEditPage';
import InvoicePage from './pages/admin/InvoicePage';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <SessionManager />
      
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="auth/login" element={<LoginPage />} />
          <Route path="auth/register" element={<RegisterPage />} />
          <Route path="auth/register-success" element={<RegisterSuccessPage />} />
          
          {/* Product catalog routes */}
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          
          {/* Cart route */}
          <Route path="cart" element={<CartPage />} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        
        {/* Admin login route (public) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        {/* Protected routes - User */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            {/* Checkout routes */}
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="checkout/success" element={<CheckoutSuccessPage />} />
            
            {/* User dashboard routes */}
            <Route path="user/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>
        
        {/* Protected routes - Admin Layout */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            
            {/* Admin product management routes */}
            <Route path="products" element={<ProductsManagementPage />} />
            <Route path="products/new" element={<CreateProductPage />} />
            <Route path="products/:id" element={<AdminProductDetailPage />} />
            <Route path="products/:id/edit" element={<EditProductPage />} />
            <Route path="products/categories-attributes" element={<CategoriesAndAttributesPage />} />
            
            {/* Admin customer management routes */}
            <Route path="customers" element={<CustomersManagementPage />} />
            <Route path="customers/:id" element={<CustomerDetailPage />} />
            
            {/* Admin order management routes */}
            <Route path="orders" element={<OrdersManagementPage />} />
            <Route path="orders/:orderId" element={<OrderDetailPage />} />
            <Route path="orders/:orderId/edit" element={<OrderEditPage />} />
            <Route path="orders/:orderId/invoice" element={<InvoicePage />} />
            <Route path="orders/:orderId/invoice/:invoiceId" element={<InvoicePage />} />
            
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