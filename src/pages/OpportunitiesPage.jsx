import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TextField,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { OpportunityForm } from '../components/OpportunityForm';

const API_URL = 'https://5.35.86.252:3000';

export const OpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Загрузка сделок
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await axios.get(`${API_URL}/opportunities`);
        setOpportunities(response.data || []);
      } catch (error) {
        console.error('Ошибка загрузки сделок:', error);
        setOpportunities([]);
      }
    };

    fetchOpportunities();
  }, []);

  // Фильтрация по названию или имени клиента
  const filteredOpportunities = opportunities.filter((opp) => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = opp.opportunity_name?.toLowerCase().includes(searchLower) || false;
    const clientName = `${opp.contact?.first_name || ''} ${opp.contact?.last_name || ''}`
      .toLowerCase();
    const clientMatch = clientName.includes(searchLower);

    return nameMatch || clientMatch;
  });

  // Открытие формы редактирования
  const handleEdit = (opp) => {
    setEditingOpportunity(opp);
    setShowForm(true);
  };

  // Закрытие формы
  const handleCancel = () => {
    setEditingOpportunity(null);
    setShowForm(false);
  };

  // Сохранение формы
  const handleSubmit = async (formData) => {
    try {
      if (editingOpportunity) {
        await axios.patch(
          `${API_URL}/opportunities/${editingOpportunity.opportunity_id}`,
          formData
        );
        setOpportunities((prev) =>
          prev.map((o) =>
            o.opportunity_id === editingOpportunity.opportunity_id ? { ...o, ...formData } : o
          )
        );
      } else {
        const response = await axios.post(`${API_URL}/opportunities`, formData);
        setOpportunities((prev) => [...prev, response.data]);
      }

      handleCancel();
    } catch (error) {
      console.error('Ошибка при сохранении сделки:', error);
    }
  };

  // Удаление
  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту сделку?')) return;

    try {
      await axios.delete(`${API_URL}/opportunities/${id}`);
      setOpportunities((prev) =>
        prev.filter((opp) => opp.opportunity_id !== id)
      );
    } catch (error) {
      console.error('Ошибка при удалении сделки:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Сделки
      </Typography>

      {/* Поиск */}
      <Typography variant="h6" gutterBottom>
        Поиск сделок
      </Typography>
      <TextField
        label="Поиск по названию или клиенту"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Кнопка добавления */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowForm(true)}
        sx={{ mb: 2 }}
      >
        Добавить сделку
      </Button>

      {/* Форма создания/редактирования как модальное окно */}
      <OpportunityForm
        opportunity={editingOpportunity}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        open={showForm}
      />

      {/* Таблица сделок */}
      <TableContainer component={Paper}>
        <Table aria-label="opportunities table">
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Дата закрытия</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Клиент</TableCell>
              <TableCell>Ответственный</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOpportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Нет сделок
                </TableCell>
              </TableRow>
            ) : (
              filteredOpportunities.map((opp) => (
                <TableRow key={opp.opportunity_id}>
                  <TableCell>{opp.opportunity_name}</TableCell>
                  <TableCell>{Number(opp.amount).toLocaleString()} ₽</TableCell>
                  <TableCell>{new Date(opp.close_date).toLocaleDateString()}</TableCell>
                  <TableCell>{opp.is_closed ? 'Закрыта 🔒' : 'Активна'}</TableCell>
                  <TableCell>
                    {opp.contact ? `${opp.contact.first_name} ${opp.contact.last_name}` : '—'}
                  </TableCell>
                  <TableCell>{opp.owner?.username || '—'}</TableCell>
                  <TableCell>
                    <Button
                      startIcon={<EditIcon />}
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleEdit(opp)}
                      sx={{ mr: 1 }}
                    >
                      Редактировать
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(opp.opportunity_id)}
                    >
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OpportunitiesPage;