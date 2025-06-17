import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem } from '@mui/material';
import { useState } from 'react';

const reasons = [
  'Нет бюджета',
  'Выбрали конкурента',
  'Нет интереса',
  'Неверный контакт',
  'Другое'
];

export default function LostReasonModal({ open, onClose, onSubmit }) {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (reason) {
      onSubmit(reason);
      setReason('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Укажите причину отказа</DialogTitle>
      <DialogContent>
        <Select fullWidth value={reason} onChange={(e) => setReason(e.target.value)}>
          {reasons.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit} disabled={!reason}>Подтвердить</Button>
      </DialogActions>
    </Dialog>
  );
}
