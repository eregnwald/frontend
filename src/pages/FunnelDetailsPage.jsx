import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Paper,
  Grid,
} from '@mui/material';
import { SalesFunnel } from '../components/SalesFunnel';
import OpportunityForm from '../components/OpportunityForm';
import ConfirmMoveModal from '../components/ConfirmMoveModal';
import { useDealStore } from '../store/useDealStore';
import { jwtDecode } from 'jwt-decode';
import apiClient from '../services/apiClient';

const SHARED_FUNNEL_ID = 25;

export const FunnelDetailsPage = () => {
  const { id: funnelId } = useParams(); 
  const { fetchAllData, funnelData, loading, moveDeal } = useDealStore();

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [pendingMove, setPendingMove] = useState(null);
  const [filter, setFilter] = useState('active');
  const [selectedUserId, setSelectedUserId] = useState(null); 
  const [usersList, setUsersList] = useState([]);

  const token = localStorage.getItem('token');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdminOrManager, setIsAdminOrManager] = useState(false);


  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded);
        setCurrentUserId(decoded.sub);
        setIsAdminOrManager(decoded.roles?.includes('admin') || decoded.roles?.includes('manager'));
      } catch (e) {
        console.error('Ошибка декодирования токена', e);
      }
    }
  }, [token]);

  
  useEffect(() => {
    const loadUsers = async () => {
      if (!isAdminOrManager) return;

      try {
        const res = await apiClient.get(`${process.env.REACT_APP_API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsersList(res.data || []);
      } catch (err) {
        console.error('Не удалось загрузить список пользователей', err);
      }
    };

    loadUsers();
  }, [isAdminOrManager]);

  useEffect(() => {
    fetchAllData(SHARED_FUNNEL_ID);
  }, []);

  const isStageClosedAndLost = (stageId) => {
    const stage = funnelData.find(s => s.stage_id === stageId);
    return stage?.is_closed && !stage?.is_won;
  };

  const handleMove = async (opportunityId, newStageId) => {
    if (isStageClosedAndLost(newStageId)) {
      setPendingMove({ opportunityId, newStageId });
      setOpenConfirmModal(true);
    } else {
      try {
        await moveDeal(opportunityId, newStageId);
      } catch (error) {
        console.error('Не удалось переместить сделку:', error.message);
      }
    }
  };

  const confirmMove = async () => {
    if (!pendingMove) return;

    try {
      await moveDeal(pendingMove.opportunityId, pendingMove.newStageId, selectedReason);
    } catch (error) {
      console.error('Ошибка при перемещении сделки:', error.message);
    } finally {
      setOpenConfirmModal(false);
      setPendingMove(null);
      setSelectedReason('');
    }
  };

  const cancelMove = () => {
    setOpenConfirmModal(false);
    setPendingMove(null);
  };


  const getFilteredData = () => {
    let filteredStages = [...funnelData];

   
    if (filter !== 'all') {
      filteredStages = filteredStages.map(stage => ({
        ...stage,
        deals: filter === 'active'
          ? stage.deals.filter(d => !stage.is_closed)
          : stage.deals.filter(d => stage.is_closed),
      }));
    }

   
    const ownerIdToFilter = isAdminOrManager ? selectedUserId : currentUserId;

    
    if (ownerIdToFilter) {
      filteredStages = filteredStages.map(stage => ({
        ...stage,
        deals: stage.deals.filter(deal => deal.owner_id === ownerIdToFilter),
      }));
    }

   
    return filteredStages.map(stage => {
      const deals = stage.deals || [];
      return {
        ...stage,
        deals,
        count: deals.length,
        totalAmount: deals.reduce((sum, d) => sum + d.amount, 0),
      };
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, mt: '40px' }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
          <Grid item>
            <Typography variant="h5" fontWeight="bold">
              Воронка
            </Typography>
          </Grid>

          <Grid item display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              color="primary"
              size="medium"
              onClick={() => setOpenCreateModal(true)}
            >
              + НОВАЯ СДЕЛКА
            </Button>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="view-filter-label">Вид</InputLabel>
              <Select
                labelId="view-filter-label"
                value={filter}
                label="Вид"
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="all">Все</MenuItem>
                <MenuItem value="active">Активные</MenuItem>
                <MenuItem value="closed">Закрытые</MenuItem>
              </Select>
            </FormControl>

            {isAdminOrManager && (
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="user-select-label">Пользователь</InputLabel>
                <Select
                  labelId="user-select-label"
                  value={selectedUserId || ''}
                  label="Пользователь"
                  onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
                >
                  <MenuItem value="">— Все —</MenuItem>
                  {usersList.map(user => (
                    <MenuItem key={user.user_id} value={user.user_id}>
                      {user.username || `${user.first_name} ${user.last_name}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {isAdminOrManager && (
            <Button
              variant="outlined"
              color="primary"
              href={`/funnels/${SHARED_FUNNEL_ID}/settings`}
            >
              Настроить воронку
            </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Typography>Загрузка...</Typography>
      ) : (
        <>
          <Box sx={{ mt: 2 }}>
            <SalesFunnel
              funnelData={getFilteredData()}
              mode="view"
              onMove={handleMove}
              onRemoveStage={() => {}}
            />
          </Box>

          <OpportunityForm
            open={openCreateModal}
            onClose={() => setOpenCreateModal(false)}
            onSubmit={() => {
              fetchAllData(SHARED_FUNNEL_ID); 
            }}
            funnelId={SHARED_FUNNEL_ID}
            ownerId={selectedUserId || currentUserId}
          />

          <ConfirmMoveModal
            open={openConfirmModal}
            onConfirm={confirmMove}
            onCancel={cancelMove}
            selectedReason={selectedReason}
            onReasonChange={(e) => setSelectedReason(e.target.value)}
          />
        </>
      )}
    </Container>
  );
};

export default FunnelDetailsPage;