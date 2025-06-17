import axios from 'axios';
import apiClient from '../services/apiClient';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Получить все этапы
export const fetchAllStages = async () => {
  const res = await apiClient.get(`${API_URL}/stages`);
  return res.data;
};