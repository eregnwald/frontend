// src/components/PublicRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Загрузка...</p>;
  if (user) return <Navigate to="/" />;
  return children;
};
