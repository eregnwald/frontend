import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Button,
} from '@mui/material';

const API_URL = 'https://5.35.86.252:3000';

export const OpportunityForm = ({ opportunity = null, onSubmit, onCancel, open }) => {
  const [formData, setFormData] = useState({
    opportunity_name: '',
    amount: '',
    close_date: new Date(),
    contact_id: '',
    owner_id: '',
    is_closed: false,
  });

  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}/contacts`),
          axios.get(`${API_URL}/users`),
        ]);

        setContacts(contactsRes.data || []);
        setUsers(usersRes.data || []);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      }
    };

    fetchData();
  }, []);

  // Предзаполнение формы при редактировании
  useEffect(() => {
    if (opportunity && open) {
      setFormData({
        opportunity_name: opportunity.opportunity_name || '',
        amount: opportunity.amount?.toString() || '',
        close_date: opportunity.close_date ? new Date(opportunity.close_date) : new Date(),
        contact_id: opportunity.contact?.contact_id || '',
        owner_id: opportunity.owner?.user_id || '',
        is_closed: opportunity.is_closed || false,
      });
    } else {
      setFormData({
        opportunity_name: '',
        amount: '',
        close_date: new Date(),
        contact_id: '',
        owner_id: '',
        is_closed: false,
      });
    }
  }, [opportunity, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'amount' ? value.replace(/[^0-9.]/g, '') : value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, close_date: date }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      close_date: formData.close_date.toISOString().split('T')[0],
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{opportunity ? 'Редактировать сделку' : 'Добавить сделку'}</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {/* Название сделки */}
          <TextField
            label="Название сделки"
            name="opportunity_name"
            value={formData.opportunity_name}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            variant="outlined"
            size="small"
            autoFocus
          />

          {/* Сумма */}
          <TextField
            label="Сумма"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            size="small"
            placeholder="Введите сумму"
          />

          {/* Дата закрытия */}
          <div style={{ marginTop: '16px', marginBottom: '8px' }}>
            <InputLabel shrink>Дата закрытия</InputLabel>
            <DatePicker
              selected={formData.close_date}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              customInput={
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={formData.close_date.toLocaleDateString()}
                  inputProps={{ readOnly: true }} // Добавляем readOnly
                />
              }
            />
          </div>

          {/* Контакт */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="contact-label">Контакт</InputLabel>
            <Select
              labelId="contact-label"
              name="contact_id"
              value={formData.contact_id || ''}
              onChange={handleChange}
              label="Контакт"
              size="small"
            >
              <MenuItem value="">— Выберите контакт —</MenuItem>
              {contacts.map((contact) => (
                <MenuItem key={contact.contact_id} value={contact.contact_id}>
                  {`${contact.first_name} ${contact.last_name}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Ответственный */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="owner-label">Ответственный</InputLabel>
            <Select
              labelId="owner-label"
              name="owner_id"
              value={formData.owner_id || ''}
              onChange={handleChange}
              label="Ответственный"
              size="small"
            >
              <MenuItem value="">— Выберите ответственного —</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.user_id} value={user.user_id}>
                  {user.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Чекбокс: is_closed */}
          <FormControlLabel
            control={
              <Checkbox
                name="is_closed"
                checked={formData.is_closed}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Сделка закрыта"
            sx={{ mt: 2 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onCancel} color="secondary">
            Отмена
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {opportunity ? 'Обновить' : 'Создать'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};