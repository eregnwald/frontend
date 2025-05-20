import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ContactForm from '../components/ContactForm';
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
  Pagination,
  Button,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const API_URL = 'https://5.35.86.252:3000';


export const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Загружаем контакты при монтировании
  useEffect(() => {
    const fetchContacts = async () => {
      const response = await axios.get(`${API_URL}/contacts`);
      setContacts(response.data);
    };
    fetchContacts();
  }, []);

  // Фильтрация контактов
  const filteredContacts = contacts
    .filter((contact) =>
      `${contact.first_name} ${contact.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Открытие формы с предзаполненными данными
  const handleEdit = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  // Очистка формы и скрытие
  const handleCancel = () => {
    setEditingContact(null);
    setShowForm(false);
  };

  // Обработка отправки формы
  const handleSubmit = async (formData) => {
    try {
      if (editingContact) {
        // Редактирование через PATCH
        await axios.patch(`${API_URL}/contacts/${editingContact.contact_id}`, formData);
        setContacts(
          contacts.map((c) =>
            c.contact_id === editingContact.contact_id ? { ...c, ...formData } : c
          ),
        );
      } else {
        // Создание
        const response = await axios.post(`${API_URL}/contacts`, formData);
        setContacts([...contacts, response.data]);
      }
      handleCancel(); // Скрываем форму после сохранения
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleDelete = async (contactId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот контакт?')) {
      try {
        await axios.delete(`${API_URL}/contacts/${contactId}/soft`);
        setContacts(contacts.filter((c) => c.contact_id !== contactId));
      } catch (error) {
        console.error('Ошибка при удалении контакта:', error);
      }
    }
  };

  return (
    <Box sx={{  }}>
      {/* Боковое меню */}
      <Sidebar />

      {/* Основной контент */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Все контакты
        </Typography>

        {/* Поиск */}
        <Typography variant="h6" gutterBottom>
          Поиск контактов
        </Typography>
        <TextField
          label="Поиск"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Кнопка добавления */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowForm(true)}
          sx={{ mb: 2 }}
        >
          Добавить контакт
        </Button>

        {/* Форма создания/редактирования */}
        <ContactForm
          contact={editingContact}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          open={showForm}
        />

        {/* Таблица контактов */}
        <TableContainer component={Paper}>
          <Table aria-label="contacts table">
            <TableHead>
              <TableRow>
                <TableCell>Имя</TableCell>
                <TableCell>Компания</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Должность</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.contact_id}>
                  <TableCell>{`${contact.first_name} ${contact.last_name}`}</TableCell>
                  <TableCell>{contact.company || '-'}</TableCell>
                  
                  <TableCell>{contact.phone || '-'}</TableCell>
                  <TableCell>{contact.email || '-'}</TableCell>
                  <TableCell>{contact.job_title || '-'}</TableCell>
                  <TableCell>
                    {/* Красивая кнопка редактирования */}
                    <Button
                      startIcon={<EditIcon />}
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleEdit(contact)}
                      sx={{ mr: 1 }}
                    >
                      Редактировать
                    </Button>

                    {/* Красивая кнопка удаления */}
                    <Button
                      startIcon={<DeleteIcon />}
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(contact.contact_id)}
                    >
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Пагинация */}
        <Pagination
          count={Math.ceil(filteredContacts.length / rowsPerPage)}
          page={page}
          onChange={(event, newPage) => setPage(newPage)}
          sx={{ mt: 2 }}
        />
      </Box>
    </Box>
  );
};

export default ContactsPage;