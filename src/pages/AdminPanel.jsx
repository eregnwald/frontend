// src/pages/AdminPanel.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminPanel() {
  const { user } = useAuth();

  if (!user || !user.roles.includes('admin')) {
    return <p>Доступ запрещён</p>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Админка</h2>
      <p>Только для администраторов</p>
    </div>
  );
}