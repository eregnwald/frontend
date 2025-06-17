import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';

const ConfirmMoveModal = ({ open, onConfirm, onCancel }) => {
  // Состояние для хранения выбранной причины
  const [selectedReason, setSelectedReason] = useState('');

  // Доступные причины отказа
  const reasons = [
    { value: '', label: 'Без причины' },
    { value: 'too_expensive', label: 'Слишком дорого' },
    { value: 'need_disappeared', label: 'Пропала потребность' },
    { value: 'unacceptable_conditions', label: 'Не устроили условия' },
    { value: 'chose_others', label: 'Выбрали других' },
  ];

  // Обработчик изменения выбранной причины
  const handleReasonChange = (event) => {
    setSelectedReason(event.target.value);
  };

  // Обработчик подтверждения
  const handleConfirm = () => {
    if (selectedReason) {
      onConfirm(selectedReason); // Передаем выбранную причину в onConfirm
    }
    onCancel(); // Закрываем модалку
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      fullWidth // Модалка будет занимать всю доступную ширину
      maxWidth="sm" // Ограничиваем максимальную ширину
      sx={{
        '& .MuiPaper-root': { // Стилизация контейнера модалки
          minWidth: 400, // Минимальная ширина модалки
          maxHeight: '80vh', // Максимальная высота модалки (80% от высоты экрана)
        },
      }}
    >
      <DialogTitle>Причина отказа</DialogTitle>
      <DialogContent>
        <RadioGroup
          aria-labelledby="reason-radio-group"
          name="reason-radio-group"
          value={selectedReason}
          onChange={handleReasonChange}
          row={false} // Убираем горизонтальное расположение радиокнопок
        >
          {reasons.map((reason) => (
            <FormControlLabel
              key={reason.value}
              value={reason.value}
              control={<Radio />}
              label={reason.label}
            />
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Отменить
        </Button>
        <Button
          onClick={handleConfirm}
          color="primary"
          variant="contained"
          autoFocus
          disabled={!selectedReason}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmMoveModal;