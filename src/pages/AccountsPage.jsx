import React, { useState, useEffect } from 'react';
import AccountForm from '../components/AccountForm';
import apiClient from '../services/apiClient';
import Sidebar from '../components/SideBar';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { jwtDecode } from 'jwt-decode'; 

const API_URL = process.env.REACT_APP_API_URL;

export const AccountsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [myAccountsOnly, setMyAccountsOnly] = useState(false); 
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]); 

  const token = localStorage.getItem('token');
  const currentUser = token ? jwtDecode(token) : null;
  const currentUserId = currentUser?.sub || null;


  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await apiClient.get(`${API_URL}/accounts`);
        console.log('Ответ от API (компании):', res.data);
        setAccounts(res.data);
      } catch (err) {
        console.error('Ошибка при загрузке компаний', err);
        setAccounts([]);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await apiClient.get(`${API_URL}/users`);
        console.log('Ответ от API (пользователи):', res.data);
        setUsers(res.data);
      } catch (err) {
        console.error('Ошибка при загрузке пользователей', err);
        setUsers([]);
      }
    };

    fetchAccounts();
    fetchUsers();
  }, []);


  const getUserName = (userId) => {
    if (!userId) return '—';
    const user = users.find((u) => u.user_id === userId);
    return user ? user.username : '—';
  };


  const filteredAccounts = accounts
    .filter((acc) => !acc.is_deleted)
    .filter((acc) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        acc.account_name.toLowerCase().includes(lowerSearchTerm) ||
        acc.email.toLowerCase().includes(lowerSearchTerm) ||
        acc.phone.toLowerCase().includes(lowerSearchTerm) ||
        (acc.annual_revenue?.toString() || '').toLowerCase().includes(lowerSearchTerm) ||
        acc.website.toLowerCase().includes(lowerSearchTerm)
      );
    })
    .filter((acc) => !myAccountsOnly || acc.owner_id === currentUserId);

  const handleOpenForm = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setShowForm(true);
  };


  const handleDelete = async (accountId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту компанию?')) {
      try {
        await apiClient.delete(`${API_URL}/accounts/${accountId}/soft`);

        setAccounts(
          accounts.map((acc) =>
            acc.account_id === accountId ? { ...acc, is_deleted: true } : acc
          )
        );
      } catch (error) {
        console.error('Ошибка при удалении компании:', error);
      }
    }
  };


  const handleSubmit = async (formData) => {
    try {
      let result;
      if (editingAccount) {
        result = await apiClient.patch(
          `${API_URL}/accounts/${editingAccount.account_id}`,
          formData
        );
      } else {
        result = await apiClient.post(`${API_URL}/accounts`, formData);
      }

      const updatedAccounts = await apiClient.get(API_URL + '/accounts');
      setAccounts(updatedAccounts.data);
      handleCloseForm();
    } catch (error) {
      console.error('Ошибка при сохранении компании', error);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
  
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Все компании
        </Typography>

        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Поиск по любым данным"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />
          <FormControlLabel
            control={<Checkbox checked={myAccountsOnly} onChange={(e) => setMyAccountsOnly(e.target.checked)} />}
            label="Мои компании"
          />
        </Box>

      
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenForm}
          sx={{ mb: 2 }}
        >
          Добавить компанию
        </Button>

       
        <AccountForm
          account={editingAccount}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          open={showForm}
          users={users} 
        />

     
        <TableContainer component={Paper}>
          <Table aria-label="companies table">
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Ответственный</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.account_id}>
                  <TableCell>{account.account_name || '-'}</TableCell>
                  <TableCell>{account.email || '-'}</TableCell>
                  <TableCell>{account.phone || '-'}</TableCell>
                  <TableCell>{getUserName(account.owner_id)}</TableCell>
                  <TableCell>
                
                    <Button
                      startIcon={<EditIcon />}
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleEdit(account)}
                      sx={{ mr: 1 }}
                    >
                      Редактировать
                    </Button>

        
                    <Button
                      startIcon={<DeleteIcon />}
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(account.account_id)}
                    >
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default AccountsPage;