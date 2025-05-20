import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from '../components/TaskForm';
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
import { Flame } from 'lucide-react'; // Импорт иконки огонька из Lucide

const API_URL = 'https://5.35.86.252:3000';

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Состояние поиска

  // Загружаем задачи
  useEffect(() => {
    console.log('API_URL:', process.env.REACT_APP_API_URL);
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${API_URL}/tasks`);
        setTasks(response.data);
      } catch (error) {
        console.error('Ошибка загрузки задач:', error);
      }
    };
    fetchTasks();
  }, []);

  // Загружаем пользователей
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/users`);
        setUsers(response.data);
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
      }
    };
    fetchUsers();
  }, []);

  // Функция для поиска имени пользователя
  const getUserName = (userId) => {
    const user = users.find((u) => u.user_id === userId);
    return user ? user.username : '—';
  };

  // Открытие формы с данными задачи
  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // Закрытие формы
  const handleCancel = () => {
    setEditingTask(null);
    setShowForm(false);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту задачу?')) return;

    try {
      await axios.delete(`${API_URL}/tasks/${taskId}/soft`);

      // Убираем задачу из списка
      setTasks((prev) => prev.filter((task) => task.task_id !== taskId));
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
      alert('Не удалось удалить задачу');
    }
  };

  // Сохранение задачи
  const handleSubmit = async (formData) => {
    try {
      if (editingTask) {
        // Редактирование
        const response = await axios.patch(`${API_URL}/tasks/${editingTask.task_id}`, formData);
        setTasks((prev) =>
          prev.map((t) =>
            t.task_id === editingTask.task_id ? response.data : t
          )
        );
      } else {
        // Создание
        const response = await axios.post(`${API_URL}/tasks`, formData);
        setTasks((prev) => [...prev, response.data]);
      }
      handleCancel();
    } catch (error) {
      console.error('Ошибка при сохранении задачи:', error);
    }
  };

  // Фильтрация задач по поисковому запросу
  const filteredTasks = tasks.filter((task) => {
    const searchLower = searchTerm.toLowerCase();
    const taskTitle = task.title?.toLowerCase() || '';
    const assigneeName = getUserName(task.assigned_to).toLowerCase();

    return taskTitle.includes(searchLower) || assigneeName.includes(searchLower);
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Задачи
      </Typography>

      {/* Поиск */}
      <Typography variant="h6" gutterBottom>
        Поиск задач
      </Typography>
      <TextField
        label="Поиск по названию или ответственному"
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
        Добавить задачу
      </Button>

      {/* Форма создания/редактирования */}
      <TaskForm
        task={editingTask}
        users={users}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        open={showForm}
      />

      {/* Таблица задач */}
      <TableContainer component={Paper}>
        <Table aria-label="tasks table">
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Крайний срок </TableCell>
              <TableCell>Ответственный</TableCell>
              <TableCell>Срочная?</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Нет задач
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task.task_id}>
                  <TableCell>
  {task.title ? task.title : '—'}
  {task.is_urgent && (
    <Flame
      size={18}
      strokeWidth={3}
      color="#f19009"
      style={{ marginLeft: 8, verticalAlign: 'middle' }}
    />
  )}
</TableCell>
                    
                  
                  <TableCell>{new Date(task.due_date).toLocaleString()}</TableCell>
                  <TableCell>{task.assignedUser?.username || '—'}</TableCell>
                  <TableCell>{task.is_urgent ? 'Да' : 'Нет'}</TableCell>
                  <TableCell>
                    <Button
                      startIcon={<EditIcon />}
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleEdit(task)}
                      sx={{ mr: 1 }}
                    >
                      Редактировать
                    </Button>

                    <Button
                      startIcon={<DeleteIcon />}
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(task.task_id)}
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

export default TasksPage;