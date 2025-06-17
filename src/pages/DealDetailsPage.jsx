  import React, { useEffect, useState } from 'react';
  import {
    Box,
    Typography,
    Paper,
    Button,
    Divider,
    Tabs,
    Tab,
    Autocomplete,
    TextField,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton
  } from '@mui/material';
  import apiClient from '../services/apiClient';
  import { useParams } from 'react-router-dom';
  import TaskForm from '../components/TaskForm';
  import Modal from '@mui/material/Modal';

  const DealDetailsPage = () => {
    const { id: opportunity_id } = useParams();
    const [deal, setDeal] = useState(null);
    const [temporaryDeal, setTemporaryDeal] = useState(null);
    const [tabValue, setTabValue] = useState(1); 
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [sortOrder, setSortOrder] = useState('asc');
    const [taskFilter, setTaskFilter] = useState('active');
    const [taskTypes, setTaskTypes] = useState([]);
    const [taskTypeMap, setTaskTypeMap] = useState({});
    const [selectedTask, setSelectedTask] = useState(null);
    const [resultText, setResultText] = useState('');
    const [isContactEditOpen, setContactEditOpen] = useState(false);
    const [isCompanyEditOpen, setCompanyEditOpen] = useState(false);
    const [usersForTasks, setUsersForTasks] = useState({});
    const [auditLog, setAuditLog] = useState([]);
    const [previousStage, setPreviousStage] = useState(deal?.stage?.stage_name || '');
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

    const getDeadlineInfo = (dueDate) => {
      const today = new Date();
      const due = new Date(dueDate);
      const diffTime = due - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        return `Просрочено на ${Math.abs(diffDays)} ${getPlural(diffDays, ['день', 'дня', 'дней'])}`;
      } else if (diffDays === 0) {
        return 'Сегодня';
      } else {
        return `Через ${diffDays} ${getPlural(diffDays, ['день', 'дня', 'дней'])}`;
      }
    };

    const getPlural = (n, words) => {
      const num = Math.abs(n);
      if (num % 100 >= 11 && num % 100 <= 19) {
        return words[2];
      }
      switch (num % 10) {
        case 1:
          return words[0];
        case 2:
        case 3:
        case 4:
          return words[1];
        default:
          return words[2];
      }
    };

    useEffect(() => {
      if (deal?.stage?.stage_name && deal.stage.stage_name !== previousStage) {
        const timestamp = new Date().toLocaleString();
        const oldStage = previousStage;
        const newStage = deal.stage.stage_name;
        setPreviousStage(newStage);
        setAuditLog((prev) => [
          {
            timestamp,
            action: `Этап изменён с "${oldStage}" на "${newStage}"`,
          },
          ...prev,
        ]);
      }
    }, [deal?.stage?.stage_name]);

    const fetchDeal = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await apiClient.get(`/opportunities/${opportunity_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDeal(res.data);
        setTemporaryDeal(res.data);
      } catch (e) {
        console.error('Ошибка загрузки сделки:', e.message);
      }
    };

    useEffect(() => {
      if (opportunity_id) fetchDeal();
    }, [opportunity_id]);

    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [usersRes, contactsRes, accountsRes] = await Promise.all([
          apiClient.get('/users', { headers: { Authorization: `Bearer ${token}` } }),
          apiClient.get('/contacts', { headers: { Authorization: `Bearer ${token}` } }),
          apiClient.get('/accounts', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUsers(usersRes.data);
        setContacts(contactsRes.data);
        setAccounts(accountsRes.data);
      } catch (e) {
        console.error('Ошибка загрузки данных:', e.message);
      }
    };

    useEffect(() => {
      fetchData();
    }, []);

    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await apiClient.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (e) {
        console.error('Ошибка загрузки пользователей:', e.message);
      }
    };

    useEffect(() => {
      fetchUsers();
    }, []);

    useEffect(() => {
      const mapUsers = () => {
        const userMap = {};
        users.forEach((user) => {
          userMap[user.user_id] = user.username;
        });
        setUsersForTasks(userMap);
      };
      mapUsers();
    }, [users]);

    const fetchTaskTypes = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await apiClient.get('/task-types', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTaskTypes(res.data);
        const map = {};
        res.data.forEach((type) => {
          map[type.task_type_id] = type.name;
        });
        setTaskTypeMap(map);
      } catch (e) {
        console.error('Ошибка загрузки типов задач:', e.message);
      }
    };

    useEffect(() => {
      fetchTaskTypes();
    }, []);

    const fetchTasks = async () => {
      const token = localStorage.getItem('token');
      setLoadingTasks(true);
      try {
        const res = await apiClient.get(`/opportunities/${opportunity_id}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data);
      } catch (e) {
        console.error('Ошибка загрузки задач:', e.message);
        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };

    useEffect(() => {
      if (opportunity_id) fetchTasks();
    }, [opportunity_id]);

    const fetchNotes = async () => {
      const token = localStorage.getItem('token');
      setLoadingNotes(true);
      try {
        const res = await apiClient.get(`/notes/opportunity/${opportunity_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(res.data);
      } catch (e) {
        console.error('Ошибка загрузки заметок:', e.message);
        setNotes([]);
      } finally {
        setLoadingNotes(false);
      }
    };

    useEffect(() => {
      if (opportunity_id) fetchNotes();
    }, [opportunity_id]);

    const patchOpportunity = async (patchData) => {
      const token = localStorage.getItem('token');
      try {
        const res = await apiClient.patch(`/opportunities/${opportunity_id}`, patchData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDeal(res.data);
        setTemporaryDeal(res.data);
      } catch (e) {
        console.error('Ошибка обновления сделки:', e.message);
       
        setTemporaryDeal(deal);
      }
    };

    // Заметки
    const [notes, setNotes] = useState([]);
    const [noteContent, setNoteContent] = useState('');
    const [loadingNotes, setLoadingNotes] = useState(false);

    const addNote = async () => {
      if (!noteContent.trim()) return;
      const token = localStorage.getItem('token');
      try {
        const res = await apiClient.post(
          '/notes',
          {
            content: noteContent,
            opportunity_id: Number(opportunity_id),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotes([res.data, ...notes]);
        setNoteContent('');
      } catch (e) {
        console.error('Ошибка добавления заметки:', e.message);
      }
    };

    if (!deal)
      return <Typography>Загрузка данных...</Typography>;

   
    const filteredTasks = tasks.filter((task) => {
      const now = new Date();
      const dueDate = new Date(task.due_date);
      const isOverdue = dueDate < now && !task.is_closed;
      switch (taskFilter) {
        case 'completed':
          return task.is_closed;
        case 'active':
          return !task.is_closed;
        case 'overdue':
          return !task.is_closed && isOverdue;
        default:
          return true; 
      }
    });

    const sortedTasks = [...filteredTasks].sort((a, b) => {
      const dateA = new Date(a.due_date).getTime();
      const dateB = new Date(b.due_date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    const getTaskTypeName = (task_type_id) => {
      return taskTypeMap[task_type_id] || '—';
    };

    return (
      <Box sx={{ display: 'flex', height: '95vh' }}>
     
        <Paper elevation={3} sx={{ width: 350, p: 2, mr: 2, display: 'flex', flexDirection: 'column' }}>
      
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{deal.opportunity_name}</Typography>
          </Box>
          <Box mt={2}>
            <Typography variant="subtitle1" textAlign="center">{deal.stage?.stage_name || '—'}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box mb={2}>
            <Typography variant="caption" gutterBottom >
              Ответственный
            </Typography>
            <Typography variant="body2" >
              {deal.owner?.username || users.find(u => u.user_id === deal.owner_id)?.username || '—'}
            </Typography>
          </Box>
          {/* Карточка контакта */}
          <Box mb={2} p={1.5} bgcolor="background.default" borderRadius={1} boxShadow={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">Контакт</Typography>
              <Button size="small" color="primary" onClick={() => setContactEditOpen(true)}>
                Редактировать
              </Button>
            </Box>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={0.5}>
              <Autocomplete
                disableClearable
                options={contacts}
                getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
                isOptionEqualToValue={(o, v) => o.contact_id === v?.contact_id}
                value={contacts.find(c => c.contact_id === temporaryDeal?.contact_id) || null}
                onChange={(e, newValue) => {
                  if (newValue) {
                    setTemporaryDeal((prev) => ({
                      ...prev,
                      contact_id: newValue.contact_id,
                      contact: newValue,
                    }));
                    patchOpportunity({ contact_id: newValue.contact_id });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    sx={{ input: { fontSize: '1rem' }, border: 'none', p: 0, m: 0, width: '150%', '& .MuiAutocomplete-popupIndicator': { display: 'none' }, } }
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true,
                      style: { border: 'none' },
                    }}
                  />
                )}
              />
              <Typography variant="caption" color="textSecondary"></Typography>
              <Typography variant="caption" color="textSecondary">Телефон</Typography>
              <Typography variant="caption">{temporaryDeal?.contact?.phone || '—'}</Typography>
              <Typography variant="caption" color="textSecondary">Email</Typography>
              <Typography variant="caption">{temporaryDeal?.contact?.email || '—'}</Typography>
              <Typography variant="caption" color="textSecondary">Должность</Typography>
              <Typography variant="caption">{temporaryDeal?.contact?.position || '—'}</Typography>
            </Box>
           
            <Modal open={isContactEditOpen} onClose={() => setContactEditOpen(false)}>
  <Box sx={modalStyle}>
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h6">Выберите контакт</Typography>

      <IconButton
        onClick={() => {
          // Очищаем контакт
          setTemporaryDeal((prev) => ({
            ...prev,
            contact_id: null,
            contact: null,
          }));
          patchOpportunity({ contact_id: null });
          setContactEditOpen(false);
        }}
        color="black"
      >
        <Typography fontSize="1.5rem">×</Typography>
      </IconButton>
    </Box>

    <Autocomplete
      options={contacts}
      getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
      isOptionEqualToValue={(o, v) => o.contact_id === v?.contact_id}
      value={contacts.find(c => c.contact_id === temporaryDeal?.contact_id) || null}
      onChange={(e, newValue) => {
        if (newValue) {
          setTemporaryDeal((prev) => ({
            ...prev,
            contact_id: newValue.contact_id,
            contact: newValue,
          }));
          patchOpportunity({ contact_id: newValue.contact_id });
          setContactEditOpen(false);
        }
      }}
      renderInput={(params) => <TextField {...params} label="Контакт" fullWidth />}
    />
  </Box>
</Modal>
          </Box>
    
          <Box mb={2} p={1.5} bgcolor="background.default" borderRadius={1} boxShadow={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">Компания</Typography>
              <Button size="small" color="primary" onClick={() => setCompanyEditOpen(true)}>
                Редактировать
              </Button>
            </Box>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={0.5}>
              <Autocomplete
                disableClearable
                options={accounts}
                getOptionLabel={(option) => option.account_name}
                isOptionEqualToValue={(o, v) => o.account_id === v?.account_id}
                value={accounts.find(a => a.account_id === temporaryDeal?.account_id) || null}
                onChange={(e, newValue) => {
                  if (newValue) {
                    setTemporaryDeal((prev) => ({
                      ...prev,
                      account_id: newValue.account_id,
                      account: newValue,
                    }));
                    patchOpportunity({ account_id: newValue.account_id });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    sx={{ input: { fontSize: '1rem' }, border: 'none', p: 0, m: 0, width: '150%', '& .MuiAutocomplete-popupIndicator': { display: 'none' } }}
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true,
                      style: { border: 'none' },
                    }}
                  />
                )}
              />
              <Typography variant="caption" color="textSecondary"></Typography>
              <Typography variant="caption" color="textSecondary">Телефон</Typography>
              <Typography variant="caption">{temporaryDeal?.account?.phone || '—'}</Typography>
              <Typography variant="caption" color="textSecondary">Email</Typography>
              <Typography variant="caption">{temporaryDeal?.account?.email || '—'}</Typography>
              <Typography variant="caption" color="textSecondary">Web</Typography>
              <Typography variant="caption">{temporaryDeal?.account?.website || '—'}</Typography>
              <Typography variant="caption" color="textSecondary">Адрес</Typography>
              <Typography variant="caption">{temporaryDeal?.account?.address || '—'}</Typography>
            </Box>

            <Modal open={isCompanyEditOpen} onClose={() => setCompanyEditOpen(false)}>
  <Box sx={modalStyle}>
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h6">Выберите компанию</Typography>
    
      <IconButton
        onClick={() => {
        
          setTemporaryDeal((prev) => ({
            ...prev,
            account_id: null,
            account: null,
          }));
          patchOpportunity({ account_id: null });
          setCompanyEditOpen(false);
        }}
        color="black"
      >
        <Typography fontSize="1.5rem">×</Typography>
      </IconButton>
    </Box>

    <Autocomplete
      options={accounts}
      getOptionLabel={(option) => option.account_name}
      isOptionEqualToValue={(o, v) => o.account_id === v?.account_id}
      value={accounts.find(a => a.account_id === temporaryDeal?.account_id) || null}
      onChange={(e, newValue) => {
        if (newValue) {
          setTemporaryDeal((prev) => ({
            ...prev,
            account_id: newValue.account_id,
            account: newValue,
          }));
          patchOpportunity({ account_id: newValue.account_id });
          setCompanyEditOpen(false);
        }
      }}
      renderInput={(params) => <TextField {...params} label="Компания" fullWidth />}
    />
  </Box>
</Modal>
          </Box>
        </Paper>
       
        <Paper sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
         
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" gap={1} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="filter-tasks-label">Фильтр</InputLabel>
                <Select
                  labelId="filter-tasks-label"
                  value={taskFilter}
                  label="Фильтр"
                  onChange={(e) => setTaskFilter(e.target.value)}
                >
                  <MenuItem value="all">Все</MenuItem>
                  <MenuItem value="completed">Завершённые</MenuItem>
                  <MenuItem value="active">Активные</MenuItem>
                  <MenuItem value="overdue">Просроченные</MenuItem>
                </Select>
              </FormControl>
            </Box>
          
            <Tabs
              value={tabValue === 1 || tabValue === 2 ? tabValue : 1}
              onChange={(e, v) => setTabValue(v)}
              indicatorColor="primary"
              textColor="primary"
              aria-label="Tasks or Notes"
            >
              <Tab label="Задачи" value={1} />
              <Tab label="Заметки" value={2} />
            </Tabs>
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2">
              {tabValue === 1 ? 'Задачи по сделке' : 'Заметки по сделке'}
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="sort-order-label">Сортировка</InputLabel>
              <Select
                labelId="sort-order-label"
                value={sortOrder}
                label="Сортировка"
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <MenuItem value="asc">По возрастанию</MenuItem>
                <MenuItem value="desc">По убыванию</MenuItem>
              </Select>
            </FormControl>
          </Box>
         
          <Box flexGrow={1} overflow="auto" mb={2}>
            {/* Задачи */}
            {tabValue === 1 && (
  <>
    {loadingTasks ? (
      <Typography>Загрузка задач...</Typography>
    ) : sortedTasks.length > 0 ? (
      <List dense>
        {sortedTasks.map((task) => {
          const userId = task.assignedUser?.user_id || task.assigned_to;
          const username = usersForTasks[userId] || '—';
          const typeName = task.taskType?.name || getTaskTypeName(task.task_type_id);
          const description = task.description || '';
          const contactName = task.contact ? `${task.contact.first_name} ${task.contact.last_name}` : '';
          const accountName = task.account ? task.account.account_name : '';

          return (
            <ListItem
              key={task.task_id}
              divider
              button
              onClick={() => {
                if (!task.is_closed) {
                  setSelectedTask(task);
                  setResultText(task.result || '');
                }
              }}
              sx={{
                cursor: task.is_closed ? 'default' : 'pointer',
                opacity: task.is_closed ? 0.6 : 1,
                border: !task.is_closed && new Date(task.due_date) < new Date()
                  ? '1px solid red'
                  : 'none',
                borderRadius: 1,
                mb: 0.5,
              }}
            >
              <ListItemText
                primary={
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Typography variant="body2" color="textSecondary">
                      {new Date(task.due_date).toLocaleDateString()}{' '}
                      <span style={{ fontSize: '0.8em', color: 'gray' }}>
                        ({getDeadlineInfo(task.due_date)})
                      </span>
                    </Typography>
                    <Typography variant="body2" color="primary">
                      Для: {username}
                    </Typography>
                    <Typography variant="body2">Тип: {typeName}</Typography>
                    {description && (
                      <Typography variant="body2" color="textPrimary">
                        - {description}
                      </Typography>
                    )}
                    {task.is_closed && task.result && (
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                        Результат: {task.result}
                      </Typography>
                    )}
                    {contactName && (
                      <Typography variant="body2" color="textSecondary">
                        Контакт: {contactName}
                      </Typography>
                    )}
                    {accountName && (
                      <Typography variant="body2" color="textSecondary">
                        Компания: {accountName}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>
    ) : (
      <Typography variant="body2" color="textSecondary">
        Нет задач
      </Typography>
                )}
              </>
            )}
           
            {tabValue === 2 && (
              <>
                {loadingNotes ? (
                  <Typography>Загрузка заметок...</Typography>
                ) : notes.length > 0 ? (
                  <List dense>
                   
                    {notes
                      .slice()
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((note) => (
                        <ListItem key={note.note_id} divider>
                          <ListItemText
                            primary={note.content}
                            secondary={`${new Date(note.created_at).toLocaleString()}`}
                          />
                        </ListItem>
                      ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Нет заметок
                  </Typography>
                )}
              </>
            )}
          </Box>
        
          {tabValue === 1 && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsTaskFormOpen(true)}
                sx={{ mt: 2, width: '100%' }}
              >
                Создать задачу
              </Button>
              
              <TaskForm
                open={isTaskFormOpen}
                onCancel={() => setIsTaskFormOpen(false)}
                onSubmit={async (formData) => {
                  try {
                    const response = await apiClient.post(
                      '/tasks',
                      {
                        ...formData,
                        due_date: formData.due_date.toISOString(),
                        opportunity_id: deal.opportunity_id,
                        task_type_id: parseInt(formData.task_type_id, 10),
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                      }
                    );
                    setTasks((prev) => [...prev, response.data]);
                    setIsTaskFormOpen(false);
                  } catch (error) {
                    console.error('Ошибка создания задачи:', error);
                  }
                }}
                task={null}
                users={users}
                taskTypes={taskTypes}
                opportunities={[deal]}
                contacts={contacts}
                accounts={accounts}
              />
            </>
          )}
          {/* Поле ввода заметок (если выбрана вкладка "Заметки") */}
          {tabValue === 2 && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Новая заметка"
                multiline
                rows={2}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Введите текст заметки..."
                variant="outlined"
                fullWidth
              />
              <Button
                variant="contained"
                color="primary"
                onClick={addNote}
                disabled={!noteContent.trim()}
                sx={{ mt: 2 }}
              >
                Добавить заметку
              </Button>
            </Box>
          )}
        </Paper>
        {/* Модальное окно для результата задачи */}
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
    if (!resultText.trim()) return; // 🔒 Выходим, если текст пустой

    try {
      await apiClient.patch(`/tasks/${selectedTask.task_id}`, {
        result: resultText,
        is_closed: true,
      });
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
  disabled={!resultText.trim()}
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

  export default DealDetailsPage;