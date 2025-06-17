// DealModal.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiClient from '../services/apiClient';
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
// Autocomplete
import Autocomplete from '@mui/material/Autocomplete';

// JWT decode
import {jwtDecode} from 'jwt-decode'; // Убедись, что установлен: npm install jwt-decode

const API_URL = process.env.REACT_APP_API_URL;

const DealModal = ({ open, onClose, onSubmit, funnelId }) => {
  const [formData, setFormData] = useState({
    opportunity_name: '',
    amount: '',
    close_date: new Date(),
    contact_id: null,
    owner_id: null,
    account_id: null,
    is_closed: false,
    stage_id: '',
  });

  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [stages, setStages] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // ← для хранения текущего пользователя

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const decodedToken = token ? jwtDecode(token) : null;
        if (decodedToken) {
          setCurrentUser(decodedToken);
        }

        const [contactsRes, usersRes, stagesRes, accountsRes] = await Promise.all([
          apiClient.get(`${API_URL}/contacts`, { headers: { Authorization: `Bearer ${token}` } }),
          apiClient.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
          apiClient.get(`${API_URL}/funnels/${funnelId}/stages`, { headers: { Authorization: `Bearer ${token}` } }),
          apiClient.get(`${API_URL}/accounts`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setContacts(contactsRes.data || []);
        setUsers(usersRes.data || []);
        setStages(stagesRes.data || []);
        setAccounts(accountsRes.data || []);

        // Автоустановка владельца по user_id из токена
        if (decodedToken?.sub && usersRes.data.length > 0) {
          const defaultOwner = usersRes.data.find((u) => u.user_id === decodedToken.sub);
          if (defaultOwner) {
            setFormData((prev) => ({
              ...prev,
              owner_id: defaultOwner.user_id,
            }));
          }
        }
        if (stagesRes.data.length > 0) {
  const firstStage = stagesRes.data[0]; // Получаем первый этап
  setFormData((prev) => ({
    ...prev,
    stage_id: firstStage.stage_id, // Устанавливаем его ID в форму
  }));
}
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, funnelId]);

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

  const handleContactChange = (event, value) => {
    setFormData((prev) => ({
      ...prev,
      contact_id: value?.contact_id || null,
    }));
  };

  const handleAccountChange = (event, value) => {
    setFormData((prev) => ({
      ...prev,
      account_id: value?.account_id || null,
    }));
  };

  const handleOwnerChange = (event, value) => {
    setFormData((prev) => ({
      ...prev,
      owner_id: value?.user_id || null,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Добавить сделку</DialogTitle>
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

          {/* Этап */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="stage-label">Этап</InputLabel>
            <Select
              labelId="stage-label"
              name="stage_id"
              value={formData.stage_id || ''}
              onChange={handleChange}
              label="Этап"
              size="small"
              required
            >
              <MenuItem value="">— Выберите этап —</MenuItem>
              {stages.map((stage) => (
                <MenuItem key={stage.stage_id} value={stage.stage_id}>
                  {stage.stage_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
                  inputProps={{ readOnly: true }}
                />
              }
            />
          </div>

          {/* Контакт с Autocomplete */}
          <Autocomplete
            options={contacts}
            getOptionLabel={(option) =>
              option.contact_id ? `${option.first_name} ${option.last_name}` : ''
            }
            value={
              contacts.find((c) => c.contact_id === formData.contact_id) || null
            }
            onChange={handleContactChange}
            renderInput={(params) => (
              <TextField {...params} label="Контакт" margin="normal" fullWidth size="small" />
            )}
          />

          {/* Компания с Autocomplete */}
          <Autocomplete
            options={accounts}
            getOptionLabel={(option) =>
              option.account_id ? option.account_name : ''
            }
            value={
              accounts.find((a) => a.account_id === formData.account_id) || null
            }
            onChange={handleAccountChange}
            renderInput={(params) => (
              <TextField {...params} label="Компания" margin="normal" fullWidth size="small" />
            )}
          />

          {/* Ответственный с Autocomplete */}
          <Autocomplete
            options={users}
            getOptionLabel={(option) =>
              option.user_id ? `${option.username}` : ''
            }
            value={
              users.find((u) => u.user_id === formData.owner_id) || null
            }
            onChange={handleOwnerChange}
            renderInput={(params) => (
              <TextField {...params} label="Ответственный" margin="normal" fullWidth size="small" />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Отмена
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Создать
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DealModal;