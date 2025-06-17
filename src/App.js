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
import SideBar from './components/SideBar'; 
import DealsPage from './pages/DealsPage';
import FunnelDetailsPage from './pages/FunnelDetailsPage';
import { FunnelSettingsPage } from './pages/FunnelSettingsPage';
import DealDetailsPage from './pages/DealDetailsPage';
import { AccountsPage } from './pages/AccountsPage';
import AccountsAndContactsPage from './pages/AccountsContactsPage';
import TaskNotificationToast from './components/NotificationToast';
import NotificationsPage from './pages/NotificationsPage';
import SharedFunnelPage from './pages/SharedFunnelPage';
import {ReportsPage} from './pages/ReportPage';
function App() {
  return (
    <Router>
       <TaskNotificationToast />
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <SideBar />

      
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          
          <Routes>
           
            
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            

          
            <Route path="/" element={<PrivateRoute><SharedFunnelPage /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
            <Route path="/deals" element={<PrivateRoute><DealsPage /></PrivateRoute>} />
            <Route path="/funnels/:id" element={<PrivateRoute><FunnelDetailsPage /></PrivateRoute>} />
            <Route path="/funnels/shared" element={<PrivateRoute> <SharedFunnelPage/> </PrivateRoute> } />
            <Route path="/deal/:id" element={<PrivateRoute><DealDetailsPage /></PrivateRoute>} />
            <Route path="/accounts" element={<PrivateRoute>< AccountsPage /></PrivateRoute>} />
            <Route path="/report" element={<PrivateRoute roles={['manager']}>< ReportsPage /></PrivateRoute>} />
            <Route path="/funnels/:id/settings" element={<PrivateRoute> <FunnelSettingsPage /> </PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute roles ={['admin']}> <UsersPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute roles={['manager']}><AdminPanel /></PrivateRoute>} />
            <Route path="/contacts" element={<PrivateRoute><ContactsPage /></PrivateRoute>} />
            <Route path="/accountscontacts" element={<PrivateRoute><AccountsAndContactsPage /></PrivateRoute>} />
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