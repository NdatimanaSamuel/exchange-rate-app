// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const location = useLocation();

  // 1. Check if the user is logged in (has a token)
  if (!token) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back after they log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check if the logged-in user has the required role
  if (!user || !allowedRoles.includes(user.role)) {
    // User is logged in but doesn't have permission.
    // Redirect them to a "not authorized" page or back to login.
    // For simplicity, we send them to the login page.
    // You could also create a dedicated /unauthorized page.
    return <Navigate to="/login" replace />;
  }

  // 3. If everything is fine, render the component they were trying to access
  return children;
};

export default ProtectedRoute;