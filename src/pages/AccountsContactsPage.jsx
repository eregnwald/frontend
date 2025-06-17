import React, { useState, useEffect } from 'react';
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
  Pagination,
  Button,
  Divider,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Sidebar from '../components/SideBar';
import AccountForm from '../components/AccountForm';
import ContactForm from '../components/ContactForm';
import apiClient from '../services/apiClient';

const API_URL = process.env.REACT_APP_API_URL;

const AccountsAndContactsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsRes, contactsRes] = await Promise.all([
          apiClient.get(`${API_URL}/accounts`),
          apiClient.get(`${API_URL}/contacts`)
        ]);
        setAccounts(accountsRes.data);
        setContacts(contactsRes.data);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };
    fetchData();
  }, []);

  const normalizedData = [
    ...accounts
      .filter(a => !a.is_deleted)
      .map(acc => ({
        id: acc.account_id,
        type: 'company',
        name: acc.account_name,
        email: acc.email || '-',
        phone: acc.phone || '-',
        original: acc
      })),
    ...contacts.map(c => ({
      id: c.contact_id,
      type: 'contact',
      name: `${c.first_name} ${c.last_name}`,
      email: c.email || '-',
      phone: '-',
      original: c
    }))
  ];

  const filteredData = normalizedData.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // === Handlers ===
  const handleEdit = (item) => {
    if (item.type === 'company') {
      setEditingAccount(item.original);
      setShowAccountForm(true);
    } else {
      setEditingContact(item.original);
      setShowContactForm(true);
    }
  };

  const handleDelete = async (item) => {
    if (item.type === 'company') {
      if (window.confirm('Удалить компанию?')) {
        await apiClient.delete(`${API_URL}/accounts/${item.id}/soft`);
        setAccounts(accounts.map(acc => acc.account_id === item.id ? { ...acc, is_deleted: true } : acc));
      }
    } else {
      if (window.confirm('Удалить контакт?')) {
        await apiClient.delete(`${API_URL}/contacts/${item.id}`);
        setContacts(contacts.filter(c => c.contact_id !== item.id));
      }
    }
  };

  const handleAccountSubmit = async (formData) => {
    if (editingAccount) {
      await apiClient.patch(`${API_URL}/accounts/${editingAccount.account_id}`, formData);
    } else {
      await apiClient.post(`${API_URL}/accounts`, formData);
    }
    const updated = await apiClient.get(`${API_URL}/accounts`);
    setAccounts(updated.data);
    setShowAccountForm(false);
    setEditingAccount(null);
  };

  const handleContactSubmit = async (formData) => {
    if (editingContact) {
      await apiClient.patch(`${API_URL}/contacts/${editingContact.contact_id}`, formData);
    } else {
      await apiClient.post(`${API_URL}/contacts`, formData);
    }
    const updated = await apiClient.get(`${API_URL}/contacts`);
    setContacts(updated.data);
    setShowContactForm(false);
    setEditingContact(null);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>Компании и контакты</Typography>

        <TextField
          label="Поиск"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant="contained" onClick={() => { setShowAccountForm(true); setEditingAccount(null); }}>
            Добавить компанию
          </Button>
          <Button variant="contained" onClick={() => { setShowContactForm(true); setEditingContact(null); }}>
            Добавить контакт
          </Button>
        </Box>

        <AccountForm
          account={editingAccount}
          onSubmit={handleAccountSubmit}
          onCancel={() => setShowAccountForm(false)}
          open={showAccountForm}
        />
        <ContactForm
          contact={editingContact}
          onSubmit={handleContactSubmit}
          onCancel={() => setShowContactForm(false)}
          open={showContactForm}
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Тип</TableCell>
                <TableCell>Имя</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map(item => (
                <TableRow key={`${item.type}-${item.id}`}>
                  <TableCell>
                    <Chip label={item.type === 'company' ? 'Компания' : 'Контакт'} color={item.type === 'company' ? 'primary' : 'default'} />
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell>
                    <Button startIcon={<EditIcon />} onClick={() => handleEdit(item)} size="small">Редактировать</Button>
                    <Button startIcon={<DeleteIcon />} onClick={() => handleDelete(item)} size="small" color="error">Удалить</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Pagination
          count={Math.ceil(filteredData.length / rowsPerPage)}
          page={page}
          onChange={(e, newPage) => setPage(newPage)}
          sx={{ mt: 2 }}
        />
      </Box>
    </Box>
  );
};

export default AccountsAndContactsPage;
