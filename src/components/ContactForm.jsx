import React from 'react';
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

const ContactForm = ({ contact = null, onSubmit, onCancel, open }) => {
  const [formData, setFormData] = React.useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    is_primary: false,
  });

  // Обновляем formData при изменении contact или открытии окна
  React.useEffect(() => {
    if (contact && open) {
      setFormData({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        job_title: contact.job_title || '',
        is_primary: contact.is_primary || false,
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        job_title: '',
        is_primary: false,
      });
    }
  }, [contact, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email) {
      alert('Пожалуйста, заполните обязательные поля.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{contact ? 'Редактировать контакт' : 'Добавить контакт'}</DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          {/* Имя */}
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

          {/* Фамилия */}
          <TextField
            label="Фамилия"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            variant="outlined"
            size="small"
          />

          {/* Email */}
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
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

          {/* Основной контакт */}
          <FormControlLabel
            control={
              <Checkbox
                name="is_primary"
                checked={formData.is_primary}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Основной контакт"
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onCancel} color="secondary">
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