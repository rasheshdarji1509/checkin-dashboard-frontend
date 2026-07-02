import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';


const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (requireAuth) {
    if (!isAuthenticated) {
      // User is trying to access protected page but is not authenticated
      return <Navigate to="/" replace />;
    }
    return children ? children : <Outlet />;
  } else {
    if (isAuthenticated) {
      // User is already logged in, redirect them away from login/guest page
      return <Navigate to="/dashboard" replace />;
    }
    return children ? children : <Outlet />;
  }
};

export default ProtectedRoute;
