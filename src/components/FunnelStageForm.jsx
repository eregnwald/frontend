// src/components/FunnelStageForm.jsx
import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

export const FunnelStageForm = ({ initialData = {}, onSave }) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <TextField
        label="Название этапа"
        name="stage_name"
        value={formData.stage_name}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />

      <Button type="submit" variant="contained">
        {initialData.stage_id ? 'Сохранить' : 'Создать'}
      </Button>
    </Box>
  );
};