import React, { useState, useEffect } from 'react';
import ContactForm from '../components/ContactForm';
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
import {jwtDecode} from 'jwt-decode';

const API_URL = process.env.REACT_APP_API_URL;

export const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [myContactsOnly, setMyContactsOnly] = useState(false);

  const token = localStorage.getItem('token');
  const currentUser = token ? jwtDecode(token) : null;
  const currentUserId = currentUser?.sub || null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsRes, usersRes, accountsRes] = await Promise.all([
          apiClient.get(`${API_URL}/contacts`),
          apiClient.get(`${API_URL}/users`),
          apiClient.get(`${API_URL}/accounts`)
        ]);
        setContacts(contactsRes.data);
        setUsers(usersRes.data);
        setAccounts(accountsRes.data);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };
    fetchData();
  }, []);

  const getUserName = (userId) => {
    const user = users.find(u => u.user_id === userId);
    return user ? user.username : '-';
  };

  const filteredContacts = contacts.filter(contact => {
    const searchMatch = [
      contact.first_name,
      contact.last_name,
      contact.email,
      contact.phone,
      contact.account?.account_name,
      getUserName(contact.owner_id)
    ].some(val =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const ownerMatch = myContactsOnly ? contact.owner_id === currentUserId : true;

    return searchMatch && ownerMatch;
  });

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingContact(null);
    setShowForm(false);
  };

  const handleSubmit = async (formData) => {
    try {
      const cleanData = { ...formData };
      ['account_id', 'contact_id', 'opportunity_id', 'email'].forEach(field => {
        if (typeof cleanData[field] === 'string' && cleanData[field].trim() === '') {
          cleanData[field] = null;
        }
      });

      let response;
      if (editingContact) {
        response = await apiClient.patch(`${API_URL}/contacts/${editingContact.contact_id}`, cleanData);
        setContacts(prev => prev.map(c => c.contact_id === editingContact.contact_id ? { ...c, ...response.data } : c));
      } else {
        response = await apiClient.post(`${API_URL}/contacts`, cleanData);
        setContacts(prev => [...prev, response.data]);
      }

      handleCancel();
    } catch (error) {
      console.error('Ошибка сохранения контакта:', error);
      alert('Не удалось сохранить контакт');
    }
  };

  const handleDelete = async (contactId) => {
    if (window.confirm('Удалить контакт?')) {
      try {
        await apiClient.delete(`${API_URL}/contacts/${contactId}/soft`);
        setContacts(prev => prev.filter(c => c.contact_id !== contactId));
      } catch (error) {
        console.error('Ошибка удаления контакта:', error);
      }
    }
  };

  return (
    <Box>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>Все контакты</Typography>

        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Поиск"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />
          <FormControlLabel
            control={<Checkbox checked={myContactsOnly} onChange={(e) => setMyContactsOnly(e.target.checked)} />}
            label="Мои контакты"
          />
        </Box>

        
        <Button variant="contained" color="primary" onClick={() => setShowForm(true)} sx={{ mb: 2 }}>
          Добавить контакт
        </Button>

        
        <ContactForm
          contact={editingContact}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          open={showForm}
          users={users}
          accounts={accounts}
          currentUserId={currentUserId}
        />

      
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Имя</TableCell>
                <TableCell>Ответственный</TableCell>
                <TableCell>Компания</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Должность</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContacts.map(contact => (
                <TableRow key={contact.contact_id}>
                  <TableCell>{`${contact.first_name} ${contact.last_name}`}</TableCell>
                  <TableCell>{getUserName(contact.owner_id)}</TableCell>
                  <TableCell>{contact.account?.account_name || '-'}</TableCell>
                  <TableCell>{contact.phone || '-'}</TableCell>
                  <TableCell>{contact.email || '-'}</TableCell>
                  <TableCell>{contact.job_title || '-'}</TableCell>
                  <TableCell>
                    <Button sx={{mr:1}} startIcon={<EditIcon />} onClick={() => handleEdit(contact)} size="small" variant="outlined">Редактировать</Button>
                    <Button startIcon={<DeleteIcon />} color="error" onClick={() => handleDelete(contact.contact_id)} size="small" variant="outlined">Удалить</Button>
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

export default ContactsPage;