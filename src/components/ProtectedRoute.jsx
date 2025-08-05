import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Protected Route Component with enhanced role-based access
const ProtectedRoute = ({ 
  isAllowed, 
  redirectPath = '/', 
  children,
  requiredRole = null,
  requireAuth = true 
}) => {
  const { isAuthenticated, user } = useAuth();

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If specific role is required, check user role
  if (requiredRole && (!user || user.role !== requiredRole)) {
    return <Navigate to={redirectPath} replace />;
  }

  // If custom isAllowed condition is provided
  if (isAllowed !== undefined && !isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;