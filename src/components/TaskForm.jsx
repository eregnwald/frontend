import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TaskForm = ({ task = null, users = [], onSubmit, onCancel, open }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: new Date(),
    assigned_to: '',
    is_urgent: false,
  });

  useEffect(() => {
    if (open && task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        due_date: task.due_date ? new Date(task.due_date) : new Date(),
        assigned_to: task.assigned_to || (users[0]?.user_id ?? ''),
        is_urgent: task.is_urgent || false,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        due_date: new Date(),
        assigned_to: users[0]?.user_id ?? '',
        is_urgent: false,
      });
    }
  }, [open, task, users]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'assigned_to' ? Number(value) : value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      due_date: date,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{task ? 'Редактировать задачу' : 'Добавить задачу'}</DialogTitle>
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
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="assigned-to-label">Ответственный</InputLabel>
            <Select
              labelId="assigned-to-label"
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              label="Ответственный"
              size="small"
            >
              {users.map((user) => (
                <MenuItem key={user.user_id} value={user.user_id}>
                  {user.username} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div style={{ marginTop: '16px', marginBottom: '8px' }}>
            <DatePicker
              selected={formData.due_date}
              onChange={handleDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="yyyy-MM-dd HH:mm"
              placeholderText="Выберите дату и время"
              className="form-control"
              timeCaption="Время"
              customInput={
                <TextField
                  label="Дата дедлайна"
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              }
            />
          </div>

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

export default TaskForm;