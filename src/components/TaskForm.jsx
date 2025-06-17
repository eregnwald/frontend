import React, { useState, useEffect, forwardRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch (e) {
    console.error('Ошибка декодирования токена:', e);
    return null;
  }
}

function getCurrentUserId() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('Токен не найден');
    return null;
  }

  const decoded = decodeToken(token);
  const sub = decoded?.sub;

  if (!sub) {
    console.warn('Поле "sub" отсутствует в токене', decoded);
    return null;
  }

  return sub.toString();
}

function getUserRole() {
  const token = localStorage.getItem('token');
  if (!token) return [];

  const decoded = decodeToken(token);
  return decoded?.roles || [];
}

const TaskForm = ({
  task = null,
  users = [],
  taskTypes = [],
  opportunities = [],
  contacts = [],
  accounts = [],
  onSubmit,
  onCancel,
  open,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: new Date(),
    assigned_to: '',
    is_urgent: false,
    task_type_id: '',
    opportunity_id: '',
    related_contact: '',
    account_id: '',
  });

  const [currentUserId, setCurrentUserId] = useState(null);
  const [isUserRoleUser, setIsUserRoleUser] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const decoded = decodeToken(token);
    const roles = decoded?.roles || [];
    setIsUserRoleUser(roles.includes('user'));

    const userId = getCurrentUserId();
    setCurrentUserId(userId);
  }, []);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAutocompleteChange = (field, selectedOption) => {
    let id = '';
    if (selectedOption) {
      if (field === 'assigned_to') {
        id = selectedOption.user_id;
      } else if (field === 'related_contact') {
        id = selectedOption.contact_id;
      } else if (field === 'account_id') {
        id = selectedOption.account_id;
      } else if (field === 'opportunity_id') {
        id = selectedOption.opportunity_id;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [field]: id ? id.toString() : '',
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      due_date: date?.toDate() || null,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

  
    const submitData = {
      ...formData,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
    };

    onSubmit(submitData);
  };

  const selectedAssignedUser = users.find(u => u.user_id?.toString() === formData.assigned_to) || null;
  const selectedOpportunity = opportunities.find(o => o.opportunity_id?.toString() === formData.opportunity_id) || null;
  const selectedContact = contacts.find(c => c.contact_id?.toString() === formData.related_contact) || null;
  const selectedAccount = accounts.find(a => a.account_id?.toString() === formData.account_id) || null;

  useEffect(() => {
    if (!open) return;

    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        due_date: task.due_date ? new Date(task.due_date) : new Date(),
        assigned_to: task.assignedUser?.user_id?.toString() || '',
        is_urgent: !!task.is_urgent,
        task_type_id: task.task_type_id?.toString() || '',
        opportunity_id: task.opportunity_id?.toString() || '',
        related_contact: task.contact?.contact_id?.toString() || '',
        account_id: task.account_id?.toString() || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        due_date: new Date(),
        assigned_to: isUserRoleUser && currentUserId ? currentUserId : (users[0]?.user_id?.toString() ?? ''),
        is_urgent: false,
        task_type_id: '',
        opportunity_id: '',
        related_contact: '',
        account_id: '',
      });
    }
  }, [task, open, currentUserId, users, isUserRoleUser]);

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{task ? 'Редактировать задачу' : 'Добавить задачу'}</DialogTitle>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <TextField
              label="Название"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
              variant="outlined"
              size="small"
              autoComplete="off"
            />

            <TextField
              label="Описание"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              margin="normal"
              variant="outlined"
              size="small"
              autoComplete="off"
            />

            {!isUserRoleUser && (
              <Autocomplete
                options={users}
                getOptionLabel={(option) =>
                  option.user_id ? `${option.username} (${option.email})` : ''
                }
                value={selectedAssignedUser}
                onChange={(event, newValue) =>
                  handleAutocompleteChange('assigned_to', newValue)
                }
                isOptionEqualToValue={(option, value) => option.user_id === value.user_id}
                renderInput={(params) => (
                  <TextField {...params} label="Ответственный" margin="normal" size="small" />
                )}
                fullWidth
                sx={{ mt: 1 }}
              />
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel id="task-type-label">Тип задачи</InputLabel>
              <Select
                labelId="task-type-label"
                name="task_type_id"
                value={formData.task_type_id}
                onChange={handleChange}
                label="Тип задачи"
                size="small"
              >
                {taskTypes.map((type) => (
                  <MenuItem key={type.task_type_id} value={type.task_type_id.toString()}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <DateTimePicker
              label="Дата дедлайна"
              value={formData.due_date ? dayjs(formData.due_date) : null}
              onChange={handleDateChange}
              ampm={false}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal",
                  size: "small",
                },
              }}
            />

          
            <FormControlLabel
              control={
                <Checkbox
                  name="is_urgent"
                  checked={formData.is_urgent}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label="Срочная задача"
            />

       
            <Autocomplete
              options={contacts}
              getOptionLabel={(option) =>
                option.contact_id ? `${option.first_name} ${option.last_name}` : ''
              }
              value={selectedContact}
              onChange={(event, newValue) =>
                handleAutocompleteChange('related_contact', newValue)
              }
              isOptionEqualToValue={(option, value) => option.contact_id === value.contact_id}
              renderInput={(params) => (
                <TextField {...params} label="Контакт" margin="normal" size="small" />
              )}
              fullWidth
              sx={{ mt: 1 }}
            />

            <Autocomplete
              options={accounts}
              getOptionLabel={(option) => option.account_name || ''}
              value={selectedAccount}
              onChange={(event, newValue) =>
                handleAutocompleteChange('account_id', newValue)
              }
              isOptionEqualToValue={(option, value) => option.account_id === value.account_id}
              renderInput={(params) => (
                <TextField {...params} label="Компания" margin="normal" size="small" />
              )}
              fullWidth
              sx={{ mt: 1 }}
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
      </LocalizationProvider>
    </Dialog>
  );
};

export default TaskForm;