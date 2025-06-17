import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Ошибка при парсинге токена', e);
    return null;
  }
}

const ContactForm = ({
  contact = null,
  onSubmit,
  onCancel,
  open,
  users = [],
  accounts = [],
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    is_primary: false,
    account_id: '',
    owner_id: '',
  });


  const [currentUserId, setCurrentUserId] = useState(null);
  const [isUserRoleUser, setIsUserRoleUser] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const decoded = parseJwt(token);
    const roles = decoded?.roles || [];
    const userId = decoded?.sub;

    setIsUserRoleUser(roles.includes('user'));
    setCurrentUserId(userId ? userId.toString() : null);
  }, []);


  useEffect(() => {
    if (!open) return;

    if (contact) {
    
      setFormData({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        job_title: contact.job_title || '',
        is_primary: !!contact.is_primary,
        account_id: contact.account_id || '',
        owner_id: contact.owner_id || '',
      });
    } else if (!contact && currentUserId) {
      
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        job_title: '',
        is_primary: false,
        account_id: '',
        owner_id: isUserRoleUser ? currentUserId : '', 
      });
    }
  }, [contact, open, currentUserId, isUserRoleUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAutocompleteChange = (field, selectedOption) => {
    console.log('Field:', field);
  console.log('Selected option:', selectedOption);
    setFormData((prev) => ({
      ...prev,
      [field]: selectedOption ? selectedOption[field === 'owner_id' ? 'user_id' : 'account_id']?.toString() : '',
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.first_name.trim()) {
      alert('Имя обязательно');
      return;
    }
    console.log('FormData before submit:', formData); 
    onSubmit(formData);
  };

  // Для автокомплита
  const selectedOwner = users.find(u => u.user_id?.toString() === formData.owner_id) || null;
  const selectedAccount = accounts.find(a => a.account_id?.toString() === formData.account_id) || null;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{contact ? 'Редактировать контакт' : 'Добавить контакт'}</DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
         
          <TextField
            label="Имя"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            variant="outlined"
            size="small"
            autoFocus
          />

         
          <TextField
            label="Фамилия"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            size="small"
          />

          {!isUserRoleUser && (
            <Autocomplete
              options={users}
              getOptionLabel={(option) =>
                option.username ||
                `${option.first_name} ${option.last_name}` ||
                option.email ||
                ''
              }
              value={selectedOwner}
              onChange={(event, newValue) =>
                handleAutocompleteChange('owner_id', newValue)
              }
              renderInput={(params) => (
                <TextField {...params} label="Ответственный" margin="normal" size="small" />
              )}
              isOptionEqualToValue={(option, value) =>
                option.user_id === value?.user_id
              }
              sx={{ mt: 1 }}
              fullWidth
            />
          )}

          {/* Email */}
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            size="small"
          />

          {/* Телефон */}
          <TextField
            label="Телефон"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            size="small"
          />

          {/* Должность */}
          <TextField
            label="Должность"
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            size="small"
          />

          {/* Компания */}
          <Autocomplete
            options={accounts}
            getOptionLabel={(option) => option.account_name || ''}
            value={selectedAccount}
            onChange={(event, newValue) =>
              handleAutocompleteChange('account_id', newValue)
            }
            renderInput={(params) => (
              <TextField {...params} label="Компания" margin="normal" size="small" />
            )}
            isOptionEqualToValue={(option, value) =>
              option.account_id === value?.account_id
            }
            sx={{ mt: 1 }}
            fullWidth
          />

          
        </DialogContent>

        <DialogActions>
          <Button onClick={onCancel} color="primary">
            Отмена
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContactForm;