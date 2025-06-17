
import React, { useEffect } from 'react';
import { Snackbar, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTaskNotifications } from '../hooks/useTaskNotifications';

const TaskNotificationToast = () => {
  const { notifications, show, setShow, markNotificationAsRead } = useTaskNotifications();


  const audio = new Audio('/sounds/notification-sound.mp3');

  const playSound = () => {
    audio.play().catch(error => {
      console.error('Ошибка воспроизведения звука:', error);
    });
  };

  useEffect(() => {
    if (show) {
      playSound();
    }
  }, [show]);

  if (!notifications[0]) return null;

  const latest = notifications[0];

  const handleClose = () => {
    setShow(false);
    markNotificationAsRead(latest.id);
  };

  return (
    <Snackbar
      open={show}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert
        onClose={handleClose}
        severity="warning"
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ width: '100%' }}
      >
        {latest.title}: {latest.message}
      </Alert>
    </Snackbar>
  );
};

export default TaskNotificationToast;