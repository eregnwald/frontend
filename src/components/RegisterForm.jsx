// src/components/RegisterForm.jsx
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Alert,
} from '@mui/material';

import axios from 'axios';
import Box from '@mui/material/Box'; 

const RegisterForm = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });

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

    if (!formData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно';
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'Минимум 3 символа';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
      isValid = false;
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
      isValid = false;
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Имя обязательно';
      isValid = false;
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Фамилия обязательна';
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
      const response = await axios.post('http://localhost:3000/users', formData);
      onRegisterSuccess(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Ошибка регистрации. Попробуйте снова.';
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
          label="Имя пользователя"
          name="username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
          size="small"
          required
        />

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

        <TextField
          label="Имя"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
          size="small"
        />

        <TextField
          label="Фамилия"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
          size="small"
        />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Зарегистрироваться
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button size="small" color="secondary" onClick={onSwitchToLogin}>
            Уже есть аккаунт? Войти
          </Button>
        </Box>
      </form>
    </>
  );
};

export default RegisterForm;