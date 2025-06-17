import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PeopleIcon from '@mui/icons-material/People';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import '../Navbar.css';
import InboxIcon from '@mui/icons-material/Inbox';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';

import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

const drawerWidth = 260;


const badgeStyle = {
  marginLeft: 'auto',
  padding: '4px 8px',
  borderRadius: '50%',
  backgroundColor: '#d32f2f',
  color: '#fff',
  fontSize: '0.75rem',
  fontWeight: 'bold',
};


const menuItemStyle = (theme, active = false) => ({
  borderRadius: '8px',
  margin: '4px 8px',
  backgroundColor: active
    ? theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.1)'
      : 'rgba(0,0,0,0.08)'
    : 'transparent',
  color: active ? theme.palette.primary.main : 'inherit',
  fontWeight: active ? 'bold' : 'normal',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.1)'
      : 'rgba(0,0,0,0.05)',
  },
});

const SideBar = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation(); 

  const [overdueCount, setOverdueCount] = useState(0);
  const [isManagerRole, setIsManagerRole] = useState(false);
  const [isAdminRole, setIsAdminRole] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isPathActive = (basePath) => location.pathname.startsWith(basePath); 

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decoded = jwtDecode(token);
        const roles = decoded?.roles || [];

        setIsManagerRole(roles.includes('manager'));
        setIsAdminRole(roles.includes('admin'));

        const response = await apiClient.get(`${process.env.REACT_APP_API_URL}/tasks/overdue/count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOverdueCount(response.data.count || 0);

      } catch (error) {
        console.error('Ошибка загрузки данных:', error.message);
      }
    };

    fetchInitialData();

    const intervalId = setInterval(fetchInitialData, 10 * 1000);
    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.mode === 'dark' ? '#1e1e2f' : '#ffffff',
          color: theme.palette.mode === 'dark' ? '#fff' : '#000',
          borderRight: 'none',
          boxShadow: '1px 0 4px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box
        sx={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '1.5rem',
          letterSpacing: '0.05em',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #2c2c3d, #1a1a27)'
            : 'linear-gradient(135deg, #1976d2, #1565c0)',
          color: '#fff',
        }}
      >
        CRM
      </Box>

      <Divider
        sx={{
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }}
      />


      <List>
       

        {user && (
          <>
            {isAdminRole && (
              <ListItem
                component={Link}
                to="/users"
                button
                sx={(theme) => menuItemStyle(theme, isActive('/users'))}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <PeopleAltIcon />
                </ListItemIcon>
                <ListItemText primary="Пользователи" />
              </ListItem>
            )}

            <ListItem
              component={Link}
              to="/profile"
              button
              sx={(theme) => menuItemStyle(theme, isActive('/profile'))}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Профиль" />
            </ListItem>

            <ListItem
              component={Link}
              to="/contacts"
              button
              sx={(theme) => menuItemStyle(theme, isActive('/contacts'))}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Клиенты" />
            </ListItem>

            <ListItem
              component={Link}
              to="/accounts"
              button
              sx={(theme) => menuItemStyle(theme, isActive('/accounts'))}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <BusinessIcon />
              </ListItemIcon>
              <ListItemText primary="Компании" />
            </ListItem>

            <ListItem
              component={Link}
              to="/funnels/shared"
              button
              sx={(theme) => menuItemStyle(theme, isPathActive('/funnels'))}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <FilterAltIcon />
              </ListItemIcon>
              <ListItemText primary="Воронка продаж" />
            </ListItem>

            {isManagerRole && (
              <ListItem
                component={Link}
                to="/report"
                button
                sx={(theme) => menuItemStyle(theme, isActive('/report'))}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <AnalyticsIcon />
                </ListItemIcon>
                <ListItemText primary="Аналитика" />
              </ListItem>
            )}

            <ListItem
              component={Link}
              to="/opportunities"
              button
              sx={(theme) => menuItemStyle(theme, isActive('/opportunities'))}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <WorkIcon />
              </ListItemIcon>
              <ListItemText primary="Сделки" />
            </ListItem>

            <ListItem
              component={Link}
              to="/tasks"
              button
              sx={(theme) => menuItemStyle(theme, isActive('/tasks'))}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary="Задачи" />
              {overdueCount > 0 && <span style={badgeStyle}>{overdueCount}</span>}
            </ListItem>

            <ListItem
              button
              onClick={logout}
              sx={(theme) => menuItemStyle(theme, false)}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Выйти" />
            </ListItem>
          </>
        )}

        {!user && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem
              component={Link}
              to="/login"
              button
              sx={(theme) => menuItemStyle(theme, isActive('/login'))}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Войти" />
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );
};

export default SideBar;