// src/components/ProtectedRoute.js
import { Navigate } from 'react-router-dom';

export const ProtectedAdminRoute = ({ children }) => {
  const role = sessionStorage.getItem('role');
  
  if (!role || role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return children;
};

export const ProtectedRENRoute = ({ children }) => {
  const role = sessionStorage.getItem('role');
  
  if (!role || role !== 'REN') {
    return <Navigate to="/login" />;
  }

  return children;
};