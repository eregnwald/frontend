import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import apiClient from '../services/apiClient';
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

const API_URL = process.env.REACT_APP_API_URL;

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);

  const userId = user?.sub;

 
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await apiClient.get(`${API_URL}/users/${userId}`);
        const data = response.data;
        setUserData(data);
        setFormData({
          username: data.username || '',
          email: data.email || '',
        });
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        setFormData({
          username: user.username || '', 
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
      const response = await apiClient.patch(`${API_URL}/users/${userId}`, formData);
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

  const rolesList =
    displayData.userRoles?.map((ur) => ur.role?.role_name).filter(Boolean) || [];

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card elevation={6} sx={{ borderRadius: 2, overflow: 'hidden', backgroundColor: '#f9f9f9' }}>
        <CardContent>
          <Box textAlign="center" mb={3}>
            
            <Typography variant="h5" component="div">
              {displayData.first_name && displayData.last_name
                ? `${displayData.first_name} ${displayData.last_name}`
                : displayData.username || '—'}
            </Typography>
          </Box>

          <List disablePadding>
            {/* Email */}
            <ListItem>
              <ListItemText
                primary="Login"
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
                    displayData.email || '—'
                  )
                }
              />
            </ListItem>
            <Divider />

            {/* Username */}
            <ListItem>
              <ListItemText
                primary="Имя  "
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
};