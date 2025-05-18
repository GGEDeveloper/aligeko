import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import DashboardPage from '../pages/customer/DashboardPage';
import ProfilePage from '../pages/customer/ProfilePage';
import OrdersPage from '../pages/customer/OrdersPage';
import AddressesPage from '../pages/customer/AddressesPage';
import WishlistPage from '../pages/customer/WishlistPage';
import SupportPage from '../pages/customer/SupportPage';
import AccountSettingsPage from '../pages/customer/AccountSettingsPage';
import NotificationsPage from '../pages/customer/NotificationsPage';
import PaymentMethodsPage from '../pages/customer/PaymentMethodsPage';

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="addresses" element={<AddressesPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="support" element={<SupportPage />} />
        
        {/* Nested account settings routes */}
        <Route path="account" element={<AccountSettingsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="payment-methods" element={<PaymentMethodsPage />} />
        
        {/* 404 route for customer area */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default CustomerRoutes;
