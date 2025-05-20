import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  Box,
  Link as MuiLink,
} from '@mui/material';

const API_URL = 'https://5.35.86.252:3000';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);

  const userId = user?.sub;

  // Загрузка данных
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/${userId}`);
        setUserData(response.data);
        setFormData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          username: response.data.username || '',
          email: response.data.email || '',
        });
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        setUserData(user);
        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          username: user.username || '', // если есть в токене
          email: user.email || '',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    setEditing(!editing);
  };

  const handleSave = async () => {
    try {
      const response = await axios.patch(`${API_URL}/users/${userId}`, formData);
      setUserData(response.data);
      setEditing(false);
    } catch (error) {
      console.error('Ошибка сохранения профиля:', error);
      alert('Не удалось сохранить изменения');
    }
  };

  if (!user) {
    return (
      <Typography variant="h5" align="center" style={{ padding: '2rem' }}>
        Вы не авторизованы
      </Typography>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Typography align="center">Загрузка профиля...</Typography>
      </Container>
    );
  }

  const displayData = userData || user;

  // Получаем список ролей
  const rolesList =
    displayData.userRoles?.map((ur) => ur.role?.role_name).filter(Boolean) || [];

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card elevation={6} sx={{ borderRadius: 2, overflow: 'hidden', backgroundColor: '#f9f9f9' }}>
        <CardContent>
          <Box textAlign="center" mb={3}>
            <Avatar
              alt={`${displayData.first_name} ${displayData.last_name}`}
              src={`https://placehold.co/100x100 `}
              sx={{ width: 100, height: 100, margin: 'auto', mb: 2 }}
            />
            <Typography variant="h5" component="div">
              {editing ? (
                <>
                  <TextField
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    size="small"
                    fullWidth
                    label="Имя"
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    size="small"
                    fullWidth
                    label="Фамилия"
                    sx={{ mb: 1 }}
                  />
                </>
              ) : (
                `${displayData.first_name || ''} ${displayData.last_name || ''}`.trim() ||
                '—'
              )}
            </Typography>
          </Box>

          <List disablePadding>
            {/* Email */}
            <ListItem>
              <ListItemText
                primary="Email"
                secondary={
                  editing ? (
                    <TextField
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    displayData.email
                  )
                }
              />
            </ListItem>
            <Divider />

            {/* Username */}
            <ListItem>
              <ListItemText
                primary="Username"
                secondary={
                  editing ? (
                    <TextField
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    displayData.username || '—'
                  )
                }
              />
            </ListItem>
            <Divider />

            {/* Роли */}
            <ListItem>
              <ListItemText
                primary="Роль"
                secondary={rolesList.length > 0 ? rolesList.join(', ') : 'Нет назначения'}
              />
            </ListItem>
            <Divider />

            {/* ID пользователя */}
            <ListItem>
              <ListItemText primary="ID пользователя" secondary={userId} />
            </ListItem>
          </List>

          {/* Кнопки */}
          <Box mt={2}>
            {editing ? (
              <>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  sx={{ mb: 1 }}
                >
                  Сохранить
                </Button>
                <Button fullWidth variant="outlined" onClick={handleEditToggle}>
                  Отмена
                </Button>
              </>
            ) : (
              <Button fullWidth variant="contained" onClick={handleEditToggle}>
                Редактировать
              </Button>
            )}
          </Box>

          <MuiLink
            component={RouterLink}
            to="/"
            underline="hover"
            color="inherit"
            sx={{ mt: 2, display: 'block', textAlign: 'center' }}
          >
            ← На главную
          </MuiLink>
        </CardContent>
      </Card>
    </Container>
  );
}