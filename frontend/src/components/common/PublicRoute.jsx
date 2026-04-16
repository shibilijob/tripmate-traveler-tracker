import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("user"); 

  if (isAuthenticated) {
    // If logged in, redirect them to the home page (or dashboard)
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;