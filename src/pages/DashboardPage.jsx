import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Paper,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { styled } from '@mui/system';
import apiClient from '../services/apiClient';
const API_URL = process.env.REACT_APP_API_URL;


const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 8,
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));


const StatCard = ({ title, value, subtext, color = 'primary' }) => (
  <StyledCard>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="h4" color={color} fontWeight="bold">
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {subtext}
      </Typography>
    </CardContent>
  </StyledCard>
);

export const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await apiClient.get(`${API_URL}/tasks`);
        setTasks(response.data);
        setLoading(false);
      } catch (err) {
        setError('Не удалось загрузить задачи');
        console.error(err);
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading)
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Загрузка данных...</Typography>
      </Box>
    );

  if (error)
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">{error}</Typography>
        <button onClick={() => window.location.reload()}>Повторить попытку</button>
      </Box>
    );

  const today = new Date();
  const upcomingTasks = tasks.filter((task) => {
    const taskDate = new Date(task.due_date);
    const diffTime = taskDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7; 
  });

  const overdueTasks = tasks.filter((task) => {
    const taskDate = new Date(task.due_date);
    return taskDate < today; 
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
    
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Добро пожаловать в CRM
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Всего задач" value={tasks.length} subtext="за всё время" color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Срочных задач" value={tasks.filter(t => t.is_urgent).length} subtext="за неделю" color="error" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Ближайшие задачи" value={upcomingTasks.length} subtext="на 7 дней" color="info" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Просроченных задач" value={overdueTasks.length} subtext="-" color="warning" />
        </Grid>
      </Grid>

<Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
  <Box sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom fontWeight="medium">
      Ближайшие задачи
    </Typography>
  </Box>

  <TableContainer>
    <Table size="medium">
      <TableHead>
        <TableRow>
          <TableCell>Название</TableCell>
          <TableCell>Ответственный</TableCell>
          <TableCell>Срок выполнения</TableCell>
          <TableCell>Приоритет</TableCell>
          <TableCell>Статус</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {upcomingTasks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} align="center">
              Нет задач на ближайшие 7 дней
            </TableCell>
          </TableRow>
        ) : (
          upcomingTasks.map((task) => (
            <TableRow key={task.task_id} hover>
              <TableCell>{task.title}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {task.assignedUser?.avatar ? (
                    <Avatar
                      alt={task.assignedUser.username || 'User'}
                      src={task.assignedUser.avatar}
                      sx={{ width: 28, height: 28, mr: 1 }}
                    />
                  ) : (
                    <Avatar
                      alt="User"
                      src="https://via.placeholder.com/32 "
                      sx={{ width: 28, height: 28, mr: 1 }}
                    />
                  )}
                  {task.assignedUser?.username || '—'}
                </Box>
              </TableCell>
              <TableCell>
                {new Date(task.due_date).toLocaleString('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
              </TableCell>
              <TableCell>
                <Chip
                  label={task.is_urgent ? 'Высокий' : 'Обычный'}
                  color={task.is_urgent ? 'error' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={new Date(task.due_date) > new Date() ? 'Активная' : 'Просрочена'}
                  color={new Date(task.due_date) > new Date() ? 'success' : 'warning'}
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </TableContainer>
</Paper>
    </Container>
  );
};