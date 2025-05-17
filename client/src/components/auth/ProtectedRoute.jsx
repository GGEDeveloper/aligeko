import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

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
    // Redirect to login while preserving the original URL and its state
    return <Navigate to="/auth/login" state={{ 
      from: { 
        pathname: location.pathname,
        state: {
          isProtected: true,
          ...location.state
        }
      }
    }} replace />;
  }

  // Check for admin requirement
  if (requireAdmin && user?.role !== 'admin') {
    // Redirect to customer dashboard with preserved state
    return <Navigate to="/account" state={{
      isProtected: true,
      ...location.state
    }} replace />;
  }

  // Allow access to the protected route
  return <Outlet />;
};

export default ProtectedRoute; 