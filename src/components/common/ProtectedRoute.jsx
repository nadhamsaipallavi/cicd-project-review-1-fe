import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, userRole, loading, checkAuthenticated } = useAuth();
  
  // While checking authentication status, show nothing
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  // Check if user is logged in
  if (!checkAuthenticated()) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.log(`User role ${userRole} not in allowed roles: ${allowedRoles}`);
    return <Navigate to="/unauthorized" replace />;
  }
  
  // If all checks pass, render the child routes
  return <Outlet />;
};

export default ProtectedRoute; 