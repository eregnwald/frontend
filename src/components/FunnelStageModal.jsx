import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

export const FunnelStageModal = ({ open, onClose, onSave, initialData = {} }) => {
  const [formData, setFormData] = useState({
    stage_name: initialData.stage_name || '',
    is_closed: initialData.is_closed || false,
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Редактировать этап</DialogTitle>
      <DialogContent>
        <TextField
          label="Название этапа"
          name="stage_name"
          value={formData.stage_name}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Button onClick={handleSubmit} variant="contained">
          Сохранить
        </Button>
      </DialogContent>
    </Dialog>
  );
};