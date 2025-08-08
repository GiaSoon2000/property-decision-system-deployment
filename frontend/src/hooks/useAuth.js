// src/hooks/useAuth.js
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();

  const isAuthenticated = () => {
    return sessionStorage.getItem('user_id') !== null;
  };

  const getRole = () => {
    return sessionStorage.getItem('role');
  };

  const logout = () => {
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role');
    navigate('/login');
  };

  return {
    isAuthenticated,
    getRole,
    logout
  };
};