// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { PrivateRoute } from './components/PrivateRoute';
import { PublicRoute } from './components/PublicRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPanel from './pages/AdminPanel';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import ContactsPage from './pages/ContactsPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import TasksPage from './pages/TasksPage';
import { DashboardPage } from './pages/DashboardPage';
import SideBar from './components/SideBar'; // ✅ Подключаем Sidebar

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <SideBar />

        {/* Основной контент */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar /> {/* Для отступа под AppBar */}
          <Routes>
            {/* Публичные страницы */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* Приватные страницы */}
            {/* 🔥 Главная страница теперь ведёт на Dashboard */}
            <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

            <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminPanel /></PrivateRoute>} />
            <Route path="/contacts" element={<PrivateRoute><ContactsPage /></PrivateRoute>} />
            <Route path="/opportunities" element={<PrivateRoute><OpportunitiesPage /></PrivateRoute>} />
            <Route path="/tasks" element={<PrivateRoute><TasksPage /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;