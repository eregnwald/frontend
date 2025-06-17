import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import apiClient from '../services/apiClient';
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
import Autocomplete from '@mui/material/Autocomplete';

const SHARED_FUNNEL_ID = 25;

export default function OpportunityForm({ opportunity = null, open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    opportunity_name: '',
    amount: '',
    close_date: new Date(),
    contact_id: '',
    owner_id: '',
    stage_id: '',
    account_id: '',
    funnel_id: SHARED_FUNNEL_ID,
    is_closed: false,
  });
  const [stages, setStages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!open) return;
    const loadSharedStages = async () => {
      try {
        if (!token) throw new Error('Токен отсутствует');
        const stagesRes = await apiClient.get(`${API_URL}/funnels/${SHARED_FUNNEL_ID}/stages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sharedStages = stagesRes.data || [];
        setStages(sharedStages);
      } catch (err) {
        console.error('Не удалось загрузить этапы общей воронки:', err);
        setStages([]);
      }
    };
    loadSharedStages();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Токен отсутствует');

        const [contactsRes, usersRes, accountsRes] = await Promise.all([
          apiClient.get(`${API_URL}/contacts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiClient.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiClient.get(`${API_URL}/accounts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setContacts(contactsRes.data || []);
        setUsers(usersRes.data || []);
        setAccounts(accountsRes.data || []);

        const decoded = parseJwt(token);
        const userId = decoded?.sub;
        const userRoles = decoded?.roles || [];
        const isUserRoleUser = userRoles.includes('user');

        if (userId && !opportunity) {
          setFormData((prev) => ({
            ...prev,
            owner_id: isUserRoleUser ? userId : prev.owner_id,
          }));
        }

        if (opportunity) {
          setFormData({
            opportunity_name: opportunity.opportunity_name || '',
            amount: opportunity.amount ? parseFloat(opportunity.amount).toFixed(0) : '',
            close_date: opportunity.close_date ? new Date(opportunity.close_date) : new Date(),
            contact_id: opportunity.contact_id || '',
            owner_id: opportunity.owner_id || '',
            stage_id: opportunity.stage_id || '',
            account_id: opportunity.account_id || '',
            funnel_id: SHARED_FUNNEL_ID,
            is_closed: opportunity.is_closed || false,
          });
        }
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      }
    };
    fetchData();
  }, [open, opportunity]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'amount' ? value.replace(/[^0-9]/g, '') : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      stage_id: parseInt(formData.stage_id),
      contact_id: formData.contact_id || null,
      owner_id: parseInt(formData.owner_id),
      account_id: formData.account_id || null,
      funnel_id: SHARED_FUNNEL_ID,
    };

    try {
      let res;
      if (opportunity && opportunity.opportunity_id) {
        res = await apiClient.patch(
          `${API_URL}/opportunities/${opportunity.opportunity_id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        res = await apiClient.post(`${API_URL}/opportunities`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      onSubmit(res.data);

    } catch (error) {
      console.error('Ошибка при сохранении сделки:', error.response?.data || error.message);
    } finally {
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      opportunity_name: '',
      amount: '',
      close_date: new Date(),
      contact_id: '',
      owner_id: '',
      stage_id: '',
      account_id: '',
      funnel_id: SHARED_FUNNEL_ID,
      is_closed: false,
    });
    onClose();
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Ошибка при парсинге токена', e);
      return null;
    }
  };

  const decodedToken = parseJwt(token);
  const userRoles = decodedToken?.roles || [];
  const isUserRoleUser = userRoles.includes('user');

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{opportunity ? 'Редактировать сделку' : 'Создать сделку'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
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
          {!isUserRoleUser && (
            <Autocomplete
              options={users}
              getOptionLabel={(option) =>
                option.username || `${option.first_name} ${option.last_name}` || ''
              }
              value={users.find((u) => u.user_id === formData.owner_id) || null}
              isOptionEqualToValue={(option, value) => option.user_id === value?.user_id}
              onChange={(event, newValue) => {
                const ownerId = newValue ? newValue.user_id : '';
                setFormData((prev) => ({ ...prev, owner_id: ownerId }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Ответственный"
                  margin="normal"
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              )}
            />
          )}
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
          <Autocomplete
            options={contacts}
            getOptionLabel={(option) =>
              `${option.first_name || ''} ${option.last_name || ''}`.trim() || 'Без имени'
            }
            isOptionEqualToValue={(option, value) => option.contact_id === value?.contact_id}
            value={contacts.find((c) => c.contact_id === formData.contact_id) || null}
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                contact_id: newValue ? newValue.contact_id : '',
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Контакт"
                variant="outlined"
                size="small"
                fullWidth
                margin="normal"
              />
            )}
          />
          <Autocomplete
            options={accounts}
            getOptionLabel={(option) => option.account_name || 'Без названия'}
            isOptionEqualToValue={(option, value) => option.account_id === value?.account_id}
            value={accounts.find((a) => a.account_id === formData.account_id) || null}
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                account_id: newValue ? newValue.account_id : '',
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Компания"
                variant="outlined"
                size="small"
                fullWidth
                margin="normal"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Отмена
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {opportunity ? 'Сохранить изменения' : 'Создать'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}