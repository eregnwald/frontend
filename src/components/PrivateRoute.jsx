// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PrivateRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Загрузка...</p>;
  if (!user) return <Navigate to="/login" />;
  
  if (roles.length && !roles.some(role => user.roles.includes(role))) {
    return <Navigate to="/" />;
  }

  return children;
};