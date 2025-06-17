const ResultForm = ({ task, onClose, onSubmit }) => {
  const [result, setResult] = useState('');

  const handleSubmit = async () => {
    try {
      await apiClient.patch(`${API_URL}/tasks/${task.task_id}`, { result, is_closed: true });
      onClose(); 
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.task_id === task.task_id ? { ...t, is_closed: true } : t))
      );
    } catch (error) {
      console.error('Ошибка при сохранении результата:', error);
      alert('Не удалось выполнить задачу');
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Результат для задачи "{task.title}"
      </Typography>
      <TextField
        label="Добавить результат"
        variant="outlined"
        fullWidth
        value={result}
        onChange={(e) => setResult(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
      >
        Выполнить
      </Button>
      <Button
        variant="outlined"
        color="primary"
        onClick={onClose}
        sx={{ ml: 2 }}
      >
        Отмена
      </Button>
    </Box>
  );
};