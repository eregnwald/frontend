import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiClient from '../services/apiClient';
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
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Flame } from 'lucide-react'; 
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.REACT_APP_API_URL;

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [selectedTask, setSelectedTask] = useState(null); 
  const [resultText, setResultText] = useState(''); 
  const [filterStatus, setFilterStatus] = useState('active'); // all, active, completed
  const [myTasksOnly, setMyTasksOnly] = useState(false); 

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

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksRes = await apiClient.get(`${API_URL}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(tasksRes.data);
        const usersRes = await apiClient.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersRes.data);
        const taskTypesRes = await apiClient.get(`${API_URL}/task-types`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTaskTypes(taskTypesRes.data);
        const opportunitiesRes = await apiClient.get(`${API_URL}/opportunities`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOpportunities(opportunitiesRes.data);
        const contactsRes = await apiClient.get(`${API_URL}/contacts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContacts(contactsRes.data);
        const accountsRes = await apiClient.get(`${API_URL}/accounts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAccounts(accountsRes.data);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };
    fetchData();
  }, [token]);

  
  const getUserName = (userId) => {
    const user = users.find((u) => u.user_id === userId);
    return user ? user.username : '—';
  };

  const getTaskTypeName = (taskTypeId) => {
    const type = taskTypes.find((t) => t.task_type_id === taskTypeId);
    return type ? type.name : '—';
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingTask(null);
    setShowForm(false);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту задачу?')) return;
    try {
      await apiClient.delete(`${API_URL}/tasks/${taskId}/soft`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((task) => task.task_id !== taskId));
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
      alert('Не удалось удалить задачу');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingTask) {
        const response = await apiClient.patch(`${API_URL}/tasks/${editingTask.task_id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks((prev) =>
          prev.map((t) => (t.task_id === editingTask.task_id ? response.data : t))
        );
      } else {
        const response = await apiClient.post(`${API_URL}/tasks`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks((prev) => [...prev, response.data]);
      }
      handleCancel();
    } catch (error) {
      console.error('Ошибка при сохранении задачи:', error);
    }
  };

  
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = new Date(a.due_date);
    const dateB = new Date(b.due_date);
    return dateA - dateB;
  });


  const filteredTasks = sortedTasks.filter((task) => {
    const searchLower = searchTerm.toLowerCase();
    const taskTitle = task.title?.toLowerCase() || '';
    const assigneeName = getUserName(task.assignedUser?.user_id).toLowerCase();
    const taskDescription = task.description?.toLowerCase() || '';
    let statusMatch = true;
    if (filterStatus === 'active') {
      statusMatch = !task.is_closed;
    } else if (filterStatus === 'completed') {
      statusMatch = task.is_closed;
    }
    const myTasksMatch = myTasksOnly ? task.assignedUser?.user_id === currentUserId : true;
    const searchMatch =
      taskTitle.includes(searchLower) ||
      assigneeName.includes(searchLower) ||
      taskDescription.includes(searchLower);
    return statusMatch && myTasksMatch && searchMatch;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Задачи
      </Typography>
  
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Поиск по названию или ответственному"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
          <InputLabel id="filter-select-label">Фильтр</InputLabel>
          <Select
            labelId="filter-select-label"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Фильтр"
          >
            <MenuItem value="all">Все</MenuItem>
            <MenuItem value="active">Активные</MenuItem>
            <MenuItem value="completed">Выполненные</MenuItem>
          </Select>
        </FormControl>
       
        {isManager && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <input
              type="checkbox"
              checked={myTasksOnly}
              onChange={(e) => setMyTasksOnly(e.target.checked)}
              id="my-tasks-checkbox"
            />
            <label htmlFor="my-tasks-checkbox" style={{ marginLeft: 8 }}>
              Мои задачи
            </label>
          </Box>
        )}
      </Box>
     
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowForm(true)}
        sx={{ mb: 2 }}
      >
        Добавить задачу
      </Button>
    
      <TaskForm
        task={editingTask}
        users={users}
        taskTypes={taskTypes}
        opportunities={opportunities}
        contacts={contacts}
        accounts={accounts}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        open={showForm}
      />
    
      <TableContainer component={Paper}>
        <Table aria-label="tasks table">
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Крайний срок</TableCell>
              <TableCell>Ответственный</TableCell>
              <TableCell>Тип задачи</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell>Результат</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Нет задач
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => {
                const isOverdue = !task.is_closed && new Date(task.due_date) < new Date();
                return (
                  <TableRow
                    key={task.task_id}
                    sx={{
                      ...(isOverdue
                        ? {
                            backgroundColor: '#ffebee',
                            color: '#d32f2f',
                            '& .MuiTableCell-root': {
                              color: '#d32f2f',
                              borderColor: '#ef5350',
                            },
                          }
                        : {}),
                      ...(task.is_closed
                        ? {
                            backgroundColor: '#e8f5e9',
                            color: '#2e7d32',
                            '& .MuiTableCell-root': {
                              color: '#2e7d32',
                              borderColor: '#4caf50',
                            },
                          }
                        : {}),
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedTask(task)}
                  >
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
                    <TableCell>
                      {new Date(task.due_date).toLocaleDateString()}{' '}
                      {new Date(task.due_date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>{getUserName(task.assignedUser?.user_id)}</TableCell>
                    <TableCell>{getTaskTypeName(task.task_type_id)}</TableCell>
                    <TableCell>{task.description || '—'}</TableCell>
                    <TableCell>
                      {task.is_closed ? task.result || '—' : 'В работе'}
                    </TableCell>
                    <TableCell>
                      <Button
                        startIcon={<EditIcon />}
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleEdit(task);
                        }}
                        sx={{ mr: 1 }}
                      >
                        Редактировать
                      </Button>
                      <Button
                        startIcon={<DeleteIcon />}
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(task.task_id);
                        }}
                      >
                        Удалить
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    
      <Modal
        open={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        aria-labelledby="modal-title"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
            Результат задачи "{selectedTask?.title}"
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={resultText}
            onChange={(e) => setResultText(e.target.value)}
            placeholder="Введите результат..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              try {
                await apiClient.patch(
                  `${API_URL}/tasks/${selectedTask.task_id}`,
                  {
                    result: resultText,
                    is_closed: true,
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                setTasks((prev) =>
                  prev.map((t) =>
                    t.task_id === selectedTask.task_id
                      ? { ...t, is_closed: true, result: resultText }
                      : t
                  )
                );
                setSelectedTask(null);
                setResultText('');
              } catch (error) {
                console.error('Ошибка при выполнении задачи:', error);
                alert('Не удалось выполнить задачу');
              }
            }}
          >
            Выполнить
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setSelectedTask(null)}
            sx={{ ml: 1 }}
          >
            Отмена
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default TasksPage;