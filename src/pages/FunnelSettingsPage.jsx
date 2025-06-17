import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Divider,
  Container,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { SalesFunnel } from '../components/SalesFunnel';
import { useDealStore } from '../store/useDealStore';

export const FunnelSettingsPage = () => {
  const { id: funnelId } = useParams();
  const navigate = useNavigate();
  const {
    fetchAllData,
    funnelData,
    addStage,
    saveStageChanges,
    removeStage,
    onMove 
  } = useDealStore();


  useEffect(() => {
    if (funnelId) {
      fetchAllData(funnelId);
    }
  }, [funnelId]);


  const handleAddStage = async () => {
    try {
      await addStage(funnelId, {
        stage_name: 'Новый этап',
        is_closed: false,
      });
    } catch (e) {
      console.error('Ошибка при добавлении этапа:', e.message);
    }
  };

  const handleSaveChanges = async () => {
    try {
      await saveStageChanges(funnelId, funnelData);
    } catch (e) {
      console.error('Не удалось сохранить изменения:', e.message);
    }
  };

  const handleRemoveStage = async (stageId) => {
    try {
      await removeStage(funnelId, stageId);
    } catch (e) {
      console.error('Ошибка при удалении этапа:', e.message);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
     

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
          <Grid item>
            <Typography variant="h5" fontWeight="bold">
              Этапы воронки
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              href={`/funnels/${funnelId}`}
              sx={{ mr: 2 }} 
            >
              Просмотр воронки
            </Button>

            <Button variant="contained" color="primary" onClick={handleAddStage}>
              + Новый этап
            </Button>
            <Button  color="primary" variant="outlined" onClick={handleSaveChanges} sx={{ ml: 2 }}>
               Сохранить изменения
            </Button>
          </Grid>
        </Grid>
      </Paper>

     
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <SalesFunnel
          funnelData={funnelData}
          mode="settings"
          onMove={onMove} 
          onRemoveStage={handleRemoveStage}
        />
      </Paper>
     
    </Container>
  );
};