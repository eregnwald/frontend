import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import apiClient from '../services/apiClient';

const RegisterForm = ({
  onSwitchToLogin,
  onRegisterSuccess,
  onUpdateSuccess,
  initialData = null, 
}) => {
  const isEditMode = !!initialData; 

  const [formData, setFormData] = useState({
    username: initialData?.username || '',
    email: initialData?.email || '',
    password: '', 
    roleId: initialData?.role?.role_id || '',
  });

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_URL = process.env.REACT_APP_API_URL;

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
    }

    if (!isEditMode && (!formData.password || formData.password.length < 6)) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
      isValid = false;
    }

    if (!formData.roleId) {
      newErrors.roleId = 'Выберите роль';
      isValid = false;
    }

    if (!isValid) {
      setMessage({ type: 'error', text: 'Пожалуйста, исправьте ошибки' });
    }

    return isValid;
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await apiClient.get(`${API_URL}/roles`);
        setRoles(response.data);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || 'Не удалось загрузить роли';
        setMessage({ type: 'error', text: errorMessage });
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [API_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({});

    if (!validate()) return;

    try {
      const payload = {
        ...formData,
        role_id: parseInt(formData.roleId, 10),
      };

      let response;

      if (isEditMode) {

        const changedFields = {};

        Object.keys(payload).forEach((key) => {
          if (
            payload[key] !== initialData[key] ||
            (typeof payload[key] === 'number' && payload[key] > 0)
          ) {
            changedFields[key] = payload[key];
          }
        });

        if (!changedFields.password) delete changedFields.password;

        response = await apiClient.patch(`${API_URL}/users/${initialData.user_id}`, changedFields);
        onUpdateSuccess?.(response.data);
      } else {
        response = await apiClient.post(`${API_URL}/users`, payload);
        onRegisterSuccess?.(response.data);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        (isEditMode ? 'Ошибка обновления данных' : 'Ошибка регистрации');
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

        {!isEditMode && (
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
        )}

        <FormControl fullWidth margin="normal" variant="outlined" size="small">
          <InputLabel id="role-label">Роль</InputLabel>
          <Select
            labelId="role-label"
            id="role"
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            label="Роль"
            disabled={loadingRoles}
          >
            {loadingRoles ? (
              <MenuItem value="">
                <em>Загрузка...</em>
              </MenuItem>
            ) : roles.length === 0 ? (
              <MenuItem value="">
                <em>Нет доступных ролей</em>
              </MenuItem>
            ) : (
              roles.map((role) => (
                <MenuItem key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          {isEditMode ? 'Сохранить изменения' : 'Зарегистрироваться'}
        </Button>

        {!isEditMode && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button size="small" color="primary" onClick={onSwitchToLogin}>
              Уже есть аккаунт? Войти
            </Button>
          </Box>
        )}
      </form>
    </>
  );
};

export default RegisterForm;