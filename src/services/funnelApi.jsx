import axios from 'axios';
import apiClient from '../apiClient';
const API_URL = process.env.REACT_APP_API_URL;

export const getCurrentUserFunnels = async (token) => {
  const res = await apiClient.get(`${API_URL}/funnels/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};


export const getStagesForFunnel = async (funnelId, token) => {
  const res = await apiClient.get(`${API_URL}/funnels/${funnelId}/stages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};