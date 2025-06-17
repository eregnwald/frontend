import React, { useEffect, useState } from 'react';
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
  Box,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import RegisterForm from '../components/RegisterForm';
import apiClient from '../services/apiClient';

const API_URL = process.env.REACT_APP_API_URL;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient.get(`${API_URL}/users`);
        setUsers(res.data || []);
      } catch (err) {
        console.error('Ошибка загрузки пользователей:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);


  const filteredUsers = users.filter((user) =>
    `${user.first_name} ${user.last_name} ${user.email} ${user.user_id} ${user.username}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setOpenModal(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

 
  const handleRegisterSuccess = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
    handleCloseModal();
  };

  const handleUpdateSuccess = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.user_id === updatedUser.user_id ? updatedUser : u))
    );
    handleCloseModal();
  };


  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      await apiClient.delete(`${API_URL}/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
    } catch (err) {
      console.error('Ошибка при удалении:', err);
      alert('Не удалось удалить пользователя');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        {/* Поиск и заголовок */}
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

     
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Имя пользователя</TableCell>
                <TableCell>Логин</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Нет пользователей
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.user_id} hover>
                    <TableCell>{user.user_id}</TableCell>
                    <TableCell>{user.username || '—'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role?.role_name || 'Нет роли'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Редактировать">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenEditModal(user)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteUser(user.user_id)}
                        >
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

      
        <Box mt={2} textAlign="center">
          <Typography variant="body2" color="textSecondary">
            Всего пользователей: {filteredUsers.length}
          </Typography>
        </Box>
      </Paper>

     
      <Box mt={3} textAlign="right">
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateModal}
        >
          Добавить пользователя
        </Button>
      </Box>

      
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
        </DialogTitle>
        <DialogContent>
          <RegisterForm
            initialData={editingUser || null}
            onRegisterSuccess={handleRegisterSuccess}
            onUpdateSuccess={handleUpdateSuccess}
            onSwitchToLogin={() => {}}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}