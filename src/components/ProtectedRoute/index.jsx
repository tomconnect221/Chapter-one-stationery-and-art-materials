import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * ProtectedRoute - Ensures users can only access authorized routes based on their role
 * @param {ReactNode} children - The component to render if access is granted
 * @param {string[]} allowedRoles - Array of roles that can access this route
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // Get user from Redux state
  const { user, isAuthenticated } = useSelector(state => state.auth);

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    // For admin/dispatch routes, redirect to admin login
    // For customer routes, this component shouldn't be used (use different protection)
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // User doesn't have permission - redirect based on their actual role
    switch (user.role) {
      case 'customer':
        // Customers trying to access admin areas - redirect to home
        return <Navigate to="/" replace />;
      case 'rider':
      case 'dispatch':
        // Riders trying to access admin areas - redirect to dispatch dashboard
        return <Navigate to="/dispatch/dashboard" replace />;
      case 'admin':
      case 'subadmin':
        // Admins trying to access dispatch areas - redirect to admin dashboard
        return <Navigate to="/admin/dashboard" replace />;
      default:
        // Unknown role - redirect to home
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;