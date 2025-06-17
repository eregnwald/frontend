import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';

import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

export const LoginPage = () => {
  const [open, setOpen] = useState(true);
  const [isLogin, setIsLogin] = useState(true);

  const handleLoginSuccess = () => {
    window.location.href = '/'; 
  };

  const handleRegisterSuccess = () => {
    window.location.href = '/users'; 
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Добро пожаловать!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Войдите в аккаунт или зарегистрируйтесь
        </Typography>
      </Box>

    
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Войти
        </Button>
      </Box>

     
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{isLogin ? 'Вход' : 'Регистрация'}</DialogTitle>
        <DialogContent dividers>
          {isLogin ? (
            <LoginForm
              onSwitchToRegister={() => setIsLogin(false)}
              onLoginSuccess={handleLoginSuccess}
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={() => setIsLogin(true)}
              onRegisterSuccess={handleRegisterSuccess}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="secondary" fullWidth>
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LoginPage;