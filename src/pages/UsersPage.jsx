// src/pages/UsersPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Box,
  Button,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const API_URL = 'https://5.35.86.252:3000';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Загрузка пользователей
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/users`);
        setUsers(response.data || []);
      } catch (err) {
        console.error('Ошибка загрузки пользователей:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Фильтрация по имени, фамилии, email или ID
  const filteredUsers = users.filter((user) =>
    `${user.first_name} ${user.last_name} ${user.email} ${user.user_id} ${user.username}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container>
        <Box py={4}>
          <Typography align="center">Загрузка пользователей...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        {/* Заголовок и поиск */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight="bold">
            Пользователи
          </Typography>

          <TextField
            label="Поиск по имени, email или ID"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              endAdornment: <SearchIcon color="action" />,
            }}
            sx={{ width: 300 }}
          />
        </Box>

        {/* Таблица пользователей */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Фото</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Имя</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Нет пользователей
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.user_id} hover>
                    <TableCell>
                      <Avatar
                        alt={`${user.first_name} ${user.last_name}`}
                        src={`https://placehold.co/100x100/gray/white?text= ${user.first_name?.[0] || 'U'}`}
                        sx={{ bgcolor: 'primary.main' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography>{user.user_id}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">
                        {user.first_name} {user.last_name}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username || '—'}</TableCell>
                    <TableCell>
                      {user.userRoles?.map((ur) => ur.role?.role_name).filter(Boolean).join(', ') || 'Нет роли'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Редактировать">
                        <IconButton color="primary" onClick={() => alert('Редактирование не реализовано')}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton color="error" onClick={() => alert('Удаление не реализовано')}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Статистика */}
        <Box mt={2} textAlign="center">
          <Typography variant="body2" color="textSecondary">
            Всего пользователей: {filteredUsers.length}
          </Typography>
        </Box>
      </Paper>

      {/* Кнопка "Добавить" — если нужно */}
      <Box mt={3} textAlign="right">
        <Button variant="contained" color="primary" disabled>
          Добавить пользователя
        </Button>
      </Box>
    </Container>
  );
}