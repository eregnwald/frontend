import React from 'react';
import { Link } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
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

import { useAuth } from '../context/AuthContext'; // замените на ваш путь

const drawerWidth = 260;

const SideBar = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();

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

      <List
        sx={{
          '& a': {
            color: '#000',
            textDecoration: 'none',
          },
        }}
      >
        <ListItem component={Link} to="/" button sx={menuItemStyle(theme)}>
          <ListItemIcon sx={{ color: 'inherit' }}>
            <InboxIcon />
          </ListItemIcon>
          <ListItemText primary="Главная" />
        </ListItem>

        {user && (
          <>
            <ListItem component={Link} to="/users" button sx={menuItemStyle(theme)}>
              <ListItemIcon sx={{ color: 'inherit' }}>
                <PeopleAltIcon />
              </ListItemIcon>
              <ListItemText primary="Пользователи" />
            </ListItem>
            <ListItem component={Link} to="/profile" button sx={menuItemStyle(theme)}>
              <ListItemIcon sx={{ color: 'inherit' }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Профиль" />
            </ListItem>
            <ListItem component={Link} to="/contacts" button sx={menuItemStyle(theme)}>
              <ListItemIcon sx={{ color: 'inherit' }}>
                <BusinessIcon />
              </ListItemIcon>
              <ListItemText primary="Клиенты" />
            </ListItem>
            
            <ListItem component={Link} to="/opportunities" button sx={menuItemStyle(theme)}>
              <ListItemIcon sx={{ color: 'inherit' }}>
                <WorkIcon />
              </ListItemIcon>
              <ListItemText primary="Сделки" />
            </ListItem>
            <ListItem component={Link} to="/tasks" button sx={menuItemStyle(theme)}>
              <ListItemIcon sx={{ color: 'inherit' }}>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary="Задачи" />
            </ListItem>
            
            <ListItem button onClick={logout} sx={menuItemStyle(theme)}>
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
            <ListItem component={Link} to="/login" button sx={menuItemStyle(theme)}>
              <ListItemIcon sx={{ color: 'inherit' }}>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Войти" />
            </ListItem>
            <ListItem component={Link} to="/register" button sx={menuItemStyle(theme)}>
              <ListItemIcon sx={{ color: 'inherit' }}>
                <AppRegistrationIcon />
              </ListItemIcon>
              <ListItemText primary="Регистрация" />
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );
};

// Стили для элементов меню
const menuItemStyle = (theme) => ({
  borderRadius: '8px',
  margin: '4px 8px',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
});

export default SideBar;