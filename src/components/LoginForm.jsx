// src/components/LoginForm.jsx
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Alert,
} from '@mui/material';
import axios from 'axios'; 
import Box from '@mui/material/Box'; 

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
      isValid = false;
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
      isValid = false;
    }

    if (!isValid) {
      setMessage({ type: 'error', text: 'Пожалуйста, исправьте ошибки' });
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({});

    if (!validate()) return;

    try {
      const response = await axios.post('http://localhost:3000/auth/login', formData);
      localStorage.setItem('token', response.data.access_token); // сохраняем токен
      onLoginSuccess();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Неверный логин или пароль';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  return (
    <>
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
          size="small"
          required
        />

        <TextField
          label="Пароль"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
          size="small"
          required
        />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Войти
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button size="small" color="secondary" onClick={onSwitchToRegister}>
            Нет аккаунта? Зарегистрироваться
          </Button>
        </Box>
      </form>
    </>
  );
};

export default LoginForm;