import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import 'dayjs/locale/ru';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  LabelList,
  BarChart,
  FunnelChart,
  Funnel,
  Bar,
} from 'recharts';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export const ReportsPage = () => {
  const [funnelId, setFunnelId] = useState('25');
  const [period, setPeriod] = useState('week');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [funnelData, setFunnelData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [dealTrendData, setDealTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricToShow, setMetricToShow] = useState('wonDeals');
  const [selectedOwner, setSelectedOwner] = useState('all');

 
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { funnel_id: funnelId, period };
        if (period === 'custom') {
          params['startDate'] = startDate?.toISOString();
          params['endDate'] = endDate?.toISOString();
        }
        const [
          funnelRes,
          performanceRes,
          revenueRes,
          dealTrendRes
        ] = await Promise.all([
          apiClient.get('/reports/funnel', { params }),
          apiClient.get('/reports/performance', { params }),
          apiClient.get('/reports/revenue', { params }),
          apiClient.get('/reports/deal-trend', { params })
        ]);
        setFunnelData(funnelRes.data);
        setPerformanceData(performanceRes.data);
        setRevenueData(revenueRes.data);
        setDealTrendData(dealTrendRes.data);
      } catch (err) {
        console.error('Ошибка при получении отчётов:', err.message);
        setError('Не удалось загрузить данные отчётов');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [funnelId, period, startDate, endDate]);

  
  const getPeriodLabelForFilename = () => {
    const today = new Date();
    const year = today.getFullYear();
    const monthNames = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
    const currentMonth = monthNames[today.getMonth()];
    const quarter = Math.floor(today.getMonth() / 3) + 1;
    if (period === 'custom' && startDate && endDate) {
      return `с_${startDate.toISOString().slice(0, 10)}_по_${endDate.toISOString().slice(0, 10)}`;
    }
    switch (period) {
      case 'day':
        return `день_${today.getDate()}-${today.getMonth() + 1}`;
      case 'week':
        return `неделя_${today.toISOString().slice(0, 10)}`;
      case 'month':
        return `месяц_${currentMonth}_${year}`;
      case 'quarter':
        return `квартал_Q${quarter}_${year}`;
      case 'year':
        return `год_${year}`;
      default:
        return `период_не_установлен`;
    }
  };

  
  const downloadFile = (response, prefix) => {
    const contentDisposition = response.headers['content-disposition'];
    const periodLabel = getPeriodLabelForFilename();
    const dateStr = new Date().toISOString().slice(0, 10);
    let filename = `${prefix}_${periodLabel}_${dateStr}.xlsx`;
    if (contentDisposition && contentDisposition.includes('filename=')) {
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (fileNameMatch?.length > 1) {
        filename = decodeURIComponent(fileNameMatch[1]);
      }
    }
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
  };


  const handleExportFunnel = async () => {
    const response = await apiClient.get('/reports/export/funnel', {
      params: { funnel_id: funnelId, period },
      responseType: 'blob',
    });
    downloadFile(response, 'Воронка');
  };

  const handleExportPerformance = async () => {
    const response = await apiClient.get('/reports/export/performance', {
      params: { funnel_id: funnelId, period },
      responseType: 'blob',
    });
    downloadFile(response, 'Эффективность');
  };

  const handleExportFunnelWithConversion = async () => {
    const response = await apiClient.get('/reports/export/funnel-with-conversion', {
      params: { funnel_id: funnelId, period },
      responseType: 'blob',
    });
    downloadFile(response, 'Воронка_с_конверсией');
  };

  const handleExportRevenue = async () => {
    const response = await apiClient.get('/reports/export/revenue', {
      params: { funnel_id: funnelId, period },
      responseType: 'blob',
    });
    downloadFile(response, 'Отчет_по_доходу');
  };

  const handleExportDealTrend = async () => {
    const response = await apiClient.get('/reports/export/deal-trend', {
      params: { funnel_id: funnelId, period },
      responseType: 'blob',
    });
    downloadFile(response, 'Динамика_закрытий');
  };

  if (loading) return <Box p={3}>Загрузка...</Box>;
  if (error) return <Box p={3}>{error}</Box>;

 
  let chartData = [];
  if (selectedOwner === 'all') {
    chartData =
      dealTrendData?.periods.map((p) => ({
        label: p.label,
        total: p.total,
        changeFromPrevious: p.changeFromPrevious,
      })) || [];
  } else {
    chartData =
      dealTrendData?.periods.map((p) => {
        const entry = p.byEmployee.find((e) => e.owner_name === selectedOwner);
        return {
          label: p.label,
          total: entry ? entry.count : 0,
          changeFromPrevious: p.changeFromPrevious,
        };
      }) || [];
  }

 
  const managerNames = [
    ...new Set(
      (dealTrendData?.periods || []).flatMap((p) =>
        p.byEmployee.map((e) => e.owner_name)
      )
    ),
  ];

 
  const funnelChartData = funnelData
    .filter((item) => item.stage_name !== 'Закрыта и нереализована')
    .map((item) => ({
      name: `${item.stage_name} (${item.count})`,
      deals: item.count,
      totalAmount: item.totalAmount || 0,
      conversion: item.conversion_rate !== null ? `${item.conversion_rate}%` : '-',
    }));

  return (
    <Box p={3}>
      <Box mb={4} display="flex" flexWrap="wrap" gap={2} alignItems="center">
        
        <Box mt={2} display="flex" gap={1} flexWrap="wrap">
          <Button variant="contained" color="success" onClick={handleExportPerformance}>
            Отчет по эффективности
          </Button>
          <Button variant="contained" color="info" onClick={handleExportFunnelWithConversion}>
            Воронка продаж
          </Button>
          <Button variant="contained" color="secondary" onClick={handleExportRevenue}>
            Доход
          </Button>
          <Button variant="contained" color="primary" onClick={handleExportDealTrend}>
            Динамика закрытий
          </Button>


          <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel id="period-select-label">Период</InputLabel>
          <Select
            labelId="period-select-label"
            value={period}
            label="Период"
            onChange={(e) => setPeriod(e.target.value)}
          >
            <MenuItem value="custom">Произвольный</MenuItem>
            <MenuItem value="day">Сегодня</MenuItem>
            <MenuItem value="week">Неделя</MenuItem>
            <MenuItem value="month">Месяц</MenuItem>
            <MenuItem value="quarter">Квартал</MenuItem>
            <MenuItem value="year">Год</MenuItem>
          </Select>
        </FormControl>
        {/* Поля выбора дат */}
        {period === 'custom' && (
  <LocalizationProvider dateAdapter={AdapterDayjs} adapterProps={{ locale: 'ru' }}>
    <Box display="flex" gap={2} ml={2} alignItems="center">
      <DatePicker
        label="Начальная дата"
        value={startDate}
        onChange={(newDate) => setStartDate(newDate)}
        format="DD.MM.YYYY"
        slotProps={{
          textField: { size: 'small' },
        }}
      />
      <DatePicker
        label="Конечная дата"
        value={endDate}
        onChange={(newDate) => setEndDate(newDate)}
        format="DD.MM.YYYY"
        slotProps={{
          textField: { size: 'small' },
        }}
      />
    </Box>
  </LocalizationProvider>
)}
        </Box>
      </Box>

      {/* Воронка продаж */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>Воронка продаж</Typography>
        <Grid container spacing={2}>
          {/* Таблица */}
          <Grid item xs={12} sm={6}>
            <TableContainer component={Paper} sx={{ height: 400, width: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Этап</TableCell>
                    <TableCell align="right">Сделки</TableCell>
                    <TableCell align="right">Сумма</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {funnelData.length > 0 ? (
                    funnelData.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.stage_name}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                        <TableCell align="right">{row.totalAmount} ₽</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Нет данных о воронке
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          {/* График */}
          <Grid item xs={12} sm={6}>
            <Paper elevation={3} sx={{ height: 400, width: 700 }}>
              {funnelChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <FunnelChart>
                    <RechartsTooltip />
                    <Funnel
                      dataKey="deals"
                      data={funnelChartData.map((item, index) => ({
                        ...item,
                        fill: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#C5B8F7'][index % 6],
                      }))}
                      label={<LabelList position="right" fill="#000" dataKey="name" />}
                      isAnimationActive
                    />
                  </FunnelChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="textSecondary" sx={{ p: 2 }}>Нет данных для графика</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Динамика закрытий */}
      {dealTrendData ? (
        <>
          <Typography variant="h6" gutterBottom>Динамика закрытий</Typography>
          {/* Фильтр по менеджеру */}
          <FormControl size="small" sx={{ minWidth: 180, mr: 2, mb: 2 }}>
            <InputLabel id="owner-select-label">Менеджер</InputLabel>
            <Select
              labelId="owner-select-label"
              value={selectedOwner}
              label="Менеджер"
              onChange={(e) => setSelectedOwner(e.target.value)}
            >
              <MenuItem value="all">Все менеджеры</MenuItem>
              {managerNames.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* График */}
          <Box mt={2} mb={4}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    if (isNaN(date.getTime())) return str;
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day}.${month}.${year}`;
                  }}
                />
                <YAxis allowDecimals={false} />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;

                      const date = new Date(data.label);
                      let formattedDate = data.label;
                      if (!isNaN(date.getTime())) {
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = date.getFullYear();
                        formattedDate = `${day}.${month}.${year}`;
                      }

                      return (
                        <Box sx={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '10px' }}>
                          <Typography><strong>Дата:</strong> {formattedDate}</Typography>
                          <Typography><strong>Сделок:</strong> {data.total}</Typography>
                          <Typography><strong>Изменение:</strong> {data.changeFromPrevious > 0 ? '+' : ''}{data.changeFromPrevious}%</Typography>
                        </Box>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#FFA726"
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                >
                  <LabelList dataKey="total" position="top" />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </Box>
          {/* Таблица */}
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell align="right">Сделок</TableCell>
                  <TableCell align="right">Изменение (%)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dealTrendData.periods.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.label}</TableCell>
                    <TableCell align="right">{row.total}</TableCell>
                    <TableCell align="right" style={{
                      color: row.changeFromPrevious > 0 ? 'green' : row.changeFromPrevious < 0 ? 'red' : 'black'
                    }}>
                      {row.changeFromPrevious > 0 ? '+' : ''}{row.changeFromPrevious}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Typography color="textSecondary">Нет данных о динамике закрытий</Typography>
      )}

      {/* Эффективность менеджеров */}
      <Typography variant="h6" gutterBottom>Эффективность менеджеров</Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Менеджер</TableCell>
              <TableCell align="right">Всего сделок</TableCell>
              <TableCell align="right">Выиграно</TableCell>
              <TableCell align="right">Проиграно</TableCell>
              <TableCell align="right">Конверсия</TableCell>
              
              <TableCell align="right">Средний чек</TableCell>
            
              <TableCell align="right">Доход</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {performanceData.length > 0 ? (
              performanceData.map((row, idx) => (
                <TableRow key={idx}>
                  
  <TableCell>{row.owner_name}</TableCell>
  <TableCell align="right">{row.totalDeals}</TableCell>
  <TableCell align="right">{row.wonDeals}</TableCell>
  <TableCell align="right">{row.lostDeals}</TableCell>
  <TableCell align="right">{row.winRate}%</TableCell>
  
  <TableCell align="right">{row.avgDealValue ? `${row.avgDealValue} ₽` : '-'}</TableCell>
  <TableCell align="right">{row.totalRevenue} ₽</TableCell>
</TableRow>
                
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Нет данных об эффективности
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* График эффективности */}
      <Box mt={4} mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" gutterBottom>График эффективности</Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="metric-select-label">Показатель</InputLabel>
            <Select
              labelId="metric-select-label"
              value={metricToShow}
              label="Показатель"
              onChange={(e) => setMetricToShow(e.target.value)}
            >
              <MenuItem value="wonDeals">Выигранные сделки</MenuItem>
              <MenuItem value="totalRevenue">Стоимость сделок</MenuItem>
              <MenuItem value="winRate">Конверсия (%)</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {performanceData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="owner_name" />
              <YAxis />
              <RechartsTooltip />
              <Bar
                dataKey={metricToShow}
                fill="#4ECDC4"
                name={
                  metricToShow === 'wonDeals'
                    ? 'Выиграно'
                    : metricToShow === 'totalRevenue'
                    ? 'Доход'
                    : 'Конверсия (%)'
                }
              >
                <LabelList dataKey={metricToShow} position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Typography color="textSecondary">Нет данных</Typography>
        )}
      </Box>

      {/* Доход и выручка */}
      <Typography variant="h6" gutterBottom>Доход и выручка</Typography>
      {revenueData ? (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell><strong>Общий доход</strong></TableCell>
                <TableCell align="right">{revenueData.totalRevenue} ₽</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Средний чек</strong></TableCell>
                <TableCell align="right">{revenueData.avgDealValue} ₽</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Закрыто сделок</strong></TableCell>
                <TableCell align="right">{revenueData.totalWonDeals}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Конверсия</strong></TableCell>
                <TableCell align="right">{revenueData.winRate}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography color="textSecondary">Нет данных о доходе</Typography>
      )}
    </Box>
  );
};