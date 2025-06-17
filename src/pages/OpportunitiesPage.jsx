import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiClient from '../services/apiClient';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import OpportunityForm from '../components/OpportunityForm';
import { useNavigate } from 'react-router-dom';
import { useDealStore } from '../store/useDealStore';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.REACT_APP_API_URL;
const SHARED_FUNNEL_ID = 25; 

export const OpportunitiesPage = () => {
  const { funnelStages, fetchAllData } = useDealStore();
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState([]);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('active'); // active | won | lost | all
  const [myDealsOnly, setMyDealsOnly] = useState(false); 

  const [contacts, setContacts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);

  
  const token = localStorage.getItem('token');
  let currentUser = null;
  if (token) {
    try {
      currentUser = jwtDecode(token);
    } catch (e) {
      console.error('Ошибка декодирования токена', e);
    }
  }

  const currentUserId = currentUser?.sub || null;
  const isManager = currentUser?.roles?.includes('manager');

  
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (!token) throw new Error('Токен отсутствует');
        await fetchAllData(SHARED_FUNNEL_ID);
      } catch (error) {
        console.error('Ошибка при загрузке данных', error);
      }
    };
    loadInitialData();
  }, []);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) throw new Error('Токен отсутствует');
        const [oppRes, contactsRes, accountsRes, usersRes] = await Promise.all([
          apiClient.get(`${API_URL}/opportunities`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiClient.get(`${API_URL}/contacts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiClient.get(`${API_URL}/accounts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiClient.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setOpportunities(oppRes.data || []);
        setContacts(contactsRes.data || []);
        setAccounts(accountsRes.data || []);
        setUsers(usersRes.data || []);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error.message);
        setOpportunities([]);
      }
    };
    fetchData();
  }, [token]);

  
  const getContactName = (contactId) => {
    const contact = contacts.find((c) => c.contact_id === contactId);
    return contact ? `${contact.first_name} ${contact.last_name}` : '—';
  };

 
  const getAccountName = (accountId) => {
    if (!accountId) return '—';
    const account = accounts.find((a) => a.account_id === accountId);
    return account ? account.account_name : '—';
  };

  
  const getUserName = (userId) => {
    const user = users.find((u) => u.user_id === userId);
    return user ? user.username : '—';
  };

  
  const filteredOpportunities = opportunities.filter((opp) => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = opp.opportunity_name?.toLowerCase()?.includes(searchLower) || false;
    const contactName = getContactName(opp.contact_id).toLowerCase();
    const clientMatch = contactName.includes(searchLower);
    const ownerName = getUserName(opp.owner_id).toLowerCase();
    const ownerMatch = ownerName.includes(searchLower);
    const accountName = opp.account_id
      ? getAccountName(opp.account_id)?.toLowerCase() || ''
      : '';
    const accountMatch = accountName.includes(searchLower);

    let statusMatch = true;
    if (filterStatus === 'active') {
      statusMatch = !opp.is_closed;
    } else if (filterStatus === 'won') {
      statusMatch = opp.is_closed && opp.is_won;
    } else if (filterStatus === 'lost') {
      statusMatch = opp.is_closed && !opp.is_won;
    }

    
    const myDealsMatch = myDealsOnly ? opp.owner_id === currentUserId : true;

    return statusMatch && myDealsOnly
      ? statusMatch && myDealsMatch && (nameMatch || clientMatch || ownerMatch || accountMatch)
      : statusMatch && (nameMatch || clientMatch || ownerMatch || accountMatch);
  });

 
  const handleCreate = () => {
    setEditingOpportunity(null);
    setShowForm(true);
  };

  
  const handleEdit = (opp) => {
    setEditingOpportunity(opp);
    setShowForm(true);
  };

  
  const handleCancel = () => {
    setEditingOpportunity(null);
    setShowForm(false);
  };

 
  const handleSubmit = async (formData) => {
    try {
      if (!token) throw new Error('Токен отсутствует');

      const selectedStage = funnelStages.find((stage) => stage.stage_id === formData.stage_id);
      if (!selectedStage) throw new Error('Этап не найден');

      const payload = {
        ...formData,
        funnel_id: SHARED_FUNNEL_ID,
        amount: parseFloat(formData.amount),
        stage_id: parseInt(formData.stage_id),
        is_closed: selectedStage.is_closed,
        is_won: selectedStage.is_won,
      };

      let result;
      if (editingOpportunity) {
        result = await apiClient.patch(
          `${API_URL}/opportunities/${editingOpportunity.opportunity_id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOpportunities((prev) =>
          prev.map((o) =>
            o.opportunity_id === editingOpportunity.opportunity_id ? result.data : o
          )
        );
      } else {
        result = await apiClient.post(`${API_URL}/opportunities`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOpportunities((prev) => [...prev, result.data]);
      }
    } catch (error) {
      console.error('Ошибка при сохранении сделки:', error.message);
    } finally {
      handleCancel();
    }
  };

  
  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту сделку?')) return;
    try {
      await apiClient.delete(`${API_URL}/opportunities/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOpportunities((prev) => prev.filter((opp) => opp.opportunity_id !== id));
    } catch (error) {
      console.error('Ошибка при удалении сделки:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Сделки
      </Typography>

      
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Поиск"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
        <FormControl variant="outlined" sx={{ minWidth: 180 }}>
          <InputLabel id="filter-select-label">Фильтр</InputLabel>
          <Select
            labelId="filter-select-label"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Фильтр"
          >
            <MenuItem value="all">Все сделки</MenuItem>
            <MenuItem value="active">Активные</MenuItem>
            <MenuItem value="won">Успешно завершённые</MenuItem>
            <MenuItem value="lost">Нереализованные</MenuItem>
          </Select>
        </FormControl>
        {isManager && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <input
              type="checkbox"
              checked={myDealsOnly}
              onChange={(e) => setMyDealsOnly(e.target.checked)}
              id="my-deals-checkbox"
            />
            <label htmlFor="my-deals-checkbox" style={{ marginLeft: 8 }}>
              Мои сделки
            </label>
          </Box>
        )}
      </Box>

      
      <Button variant="contained" color="primary" onClick={handleCreate} sx={{ mb: 2 }}>
        Создать сделку
      </Button>

      
      <OpportunityForm
        opportunity={editingOpportunity}
        onSubmit={handleSubmit}
        onClose={handleCancel}
        open={showForm}
        contacts={contacts}
        accounts={accounts}
        users={users}
      />

      {/* Таблица сделок */}
      <TableContainer component={Paper}>
        <Table aria-label="opportunities table">
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Дата закрытия</TableCell>
              <TableCell>Клиент</TableCell>
              <TableCell>Компания</TableCell>
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
                <TableRow
                  key={opp.opportunity_id}
                  onClick={() => navigate(`/deal/${opp.opportunity_id}`)} 
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  <TableCell>{opp.opportunity_name}</TableCell>
                  <TableCell>{Number(opp.amount).toLocaleString()} ₽</TableCell>
                  <TableCell>
                    {opp.close_date ? new Date(opp.close_date).toLocaleDateString() : 'Активна'}
                  </TableCell>
                  <TableCell>{getContactName(opp.contact_id)}</TableCell>
                  <TableCell>{getAccountName(opp.account_id)}</TableCell>
                  <TableCell>{getUserName(opp.owner_id)}</TableCell>
                  <TableCell
                    onClick={(e) => e.stopPropagation()} 
                  >
                    <Button
                    startIcon={<EditIcon />}
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleEdit(opp);
                      }}
                    >
                      Редактировать
                    </Button>
                    <Button
                    startIcon={<DeleteIcon />}
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleDelete(opp.opportunity_id);
                      }}
                      sx={{ ml: 1 }}
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