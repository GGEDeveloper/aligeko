import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../store/slices/authSlice';

/**
 * Protected route component that verifies if the user is authenticated
 * Redirects to login page if not authenticated
 * 
 * @param {Object} props
 * @param {boolean} props.requireAdmin - Whether the route requires admin privileges
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ requireAdmin = false }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login while preserving the original URL for redirect after login
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  // Check for admin requirement
  if (requireAdmin && user?.role !== 'admin') {
    // Redirect to customer dashboard if user doesn't have admin privileges
    return <Navigate to="/account" replace />;
  }

  // Allow access to the protected route
  return <Outlet />;
};

export default ProtectedRoute; 