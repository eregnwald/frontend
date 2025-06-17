// src/components/DealDetailsModal.jsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Divider } from '@mui/material';

export const DealDetailsModal = ({ open, deal, onClose }) => {
  if (!deal) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Детали сделки</DialogTitle>
      <DialogContent dividers>
        <Typography><strong>Название:</strong> {deal.opportunity_name}</Typography>
        <Divider sx={{ my: 1 }} />

        <Typography><strong>Бюджет:</strong> {Number(deal.amount).toLocaleString()} ₽</Typography>
        <Divider sx={{ my: 1 }} />

        <Typography><strong>Дата закрытия:</strong> {new Date(deal.close_date).toLocaleDateString()}</Typography>
        <Divider sx={{ my: 1 }} />

        <Typography><strong>Этап:</strong> {deal.stage?.stage_name || 'Не указан'}</Typography>
        <Divider sx={{ my: 1 }} />

        <Typography>
          <strong>Ответственный:</strong> {deal.owner?.username || 'Не указан'}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography>
          <strong>Контакт:</strong>{' '}
          {deal.contact
            ? `${deal.contact.first_name} ${deal.contact.last_name}`
            : 'Нет контакта'}
        </Typography>

        <Divider sx={{ my: 1 }} />
        <Typography>
          <strong>Закрыта:</strong> {deal.is_closed ? 'Да' : 'Нет'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};