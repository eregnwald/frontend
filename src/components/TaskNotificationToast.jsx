import React, { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import apiClient from '../services/apiClient';

const TaskNotificationToast = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchSoonTasks = async () => {
    try {
      const res = await apiClient.get('/tasks/soon');
      if (res.data.length > 0) {
        setNotifications(res.data);
        setOpen(false); 
        setTimeout(() => setOpen(true), 100);
      } else {
        setNotifications([]);
      }
    } catch (e) {
      console.error('Ошибка загрузки уведомлений:', e);
    }
  };

  useEffect(() => {
    fetchSoonTasks();
    const interval = setInterval(fetchSoonTasks, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  if (notifications.length === 0) return null;

  const task = notifications[0];

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity="warning" sx={{ width: '100%' }}>
        Задача "{task.title}" скоро будет просрочена!
      </Alert>
    </Snackbar>
  );
};

export default TaskNotificationToast;