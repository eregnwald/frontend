import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

// Вспомогательная функция для декодирования JWT
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Ошибка при парсинге токена', e);
    return null;
  }
};

const AccountForm = ({ account = null, onSubmit, onCancel, open }) => {
  const [formData, setFormData] = useState({
    account_name: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    owner_id: '',
  });

  const [owners, setOwners] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isUserRoleUser, setIsUserRoleUser] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  // Функция авторизованного запроса с автообновлением токена
  const fetchWithAuth = async (url, options = {}) => {
    let accessToken = localStorage.getItem('token');
    let refreshToken = localStorage.getItem('refresh_token');

    const baseHeaders = {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };

    const sendRequest = (token) =>
      fetch(url, {
        ...options,
        headers: {
          ...baseHeaders,
          Authorization: `Bearer ${token}`,
        },
      });

    let response = await sendRequest(accessToken);

    if (response.status !== 401) return response;

    if (!refreshToken) throw new Error('Нет refresh_token');

    try {
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!refreshResponse.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw new Error('Не удалось обновить токен');
      }

      const { access_token } = await refreshResponse.json();
      localStorage.setItem('token', access_token);
      accessToken = access_token;

      response = await sendRequest(access_token);
      return response;
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error);
      throw error;
    }
  };

  // Получение списка пользователей
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/users`);
        const data = await response.json();
        setOwners(data);
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
      }
    };

    // Установка ответственного из токена
    const setOwnerFromToken = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const decoded = parseJwt(token);
      const userId = decoded?.sub || '';
      const roles = decoded?.roles || [];

      setCurrentUserId(userId);
      setIsUserRoleUser(roles.includes('user'));

      if (roles.includes('user')) {
        setFormData((prev) => ({
          ...prev,
          owner_id: userId,
        }));
      }
    };

    if (open) {
      fetchOwners();
      if (!account) {
        setOwnerFromToken();
      }
    }
  }, [open, account]);

  // Подгрузка данных при редактировании
  useEffect(() => {
    if (account && open) {
      setFormData({
        account_name: account.account_name || '',
        website: account.website || '',
        phone: account.phone || '',
        email: account.email || '',
        address: account.address || '',
        owner_id: account.owner_id || '',
      });
    }
  }, [account, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.account_name) {
      alert('Пожалуйста, заполните обязательные поля.');
      return;
    }
    onSubmit(formData);
  };

  // Для автокомплита
  const selectedOwner = owners.find((user) => user.user_id === formData.owner_id) || null;

  // Парсинг роли пользователя
  const token = localStorage.getItem('token');
  const decodedToken = token ? parseJwt(token) : null;
  const userRoles = decodedToken?.roles || [];
  const isUser = userRoles.includes('user');

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{account ? 'Редактировать компанию' : 'Добавить компанию'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <TextField
            label="Название компании *"
            name="account_name"
            value={formData.account_name}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            variant="outlined"
            size="small"
            autoFocus
          />

          {/* Поле "Ответственный" показывается только если НЕ role=user */}
          {!isUser && (
            <Autocomplete
              options={owners}
              getOptionLabel={(option) =>
                option.username || `${option.first_name} ${option.last_name}` || option.email || ''
              }
              value={selectedOwner}
              isOptionEqualToValue={(option, value) => option.user_id === value?.user_id}
              onChange={(event, newValue) => {
                setFormData((prev) => ({
                  ...prev,
                  owner_id: newValue ? newValue.user_id : '',
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Ответственный"
                  margin="normal"
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              )}
            />
          )}

          <TextField
            label="Телефон"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            size="small"
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            size="small"
          />
          <TextField
            label="Веб-сайт"
            name="website"
            value={formData.website}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            size="small"
          />
          <TextField
            label="Адрес"
            name="address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="secondary">
            Отмена
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AccountForm;