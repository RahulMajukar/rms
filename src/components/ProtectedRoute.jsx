import React from 'react';
import { Navigate } from 'react-router-dom';

// Protected Route Component
const ProtectedRoute = ({ isAllowed, redirectPath = '/', children }) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

export default ProtectedRoute;