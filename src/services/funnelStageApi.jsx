import axios from 'axios';
import apiClient from '../apiClient';
const API_URL = process.env.REACT_APP_API_URL;

export const fetchStagesByFunnelId = async (funnelId, token) => {
  const res = await apiClient.get(`${API_URL}/funnels/${funnelId}/stages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createStage = async (funnelId, payload) => {
  const token = localStorage.getItem('token');
  const res = await apiClient.post(
    `${API_URL}/funnels/${funnelId}/stages`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

export const updateStage = async (stageId, payload) => {
  const token = localStorage.getItem('token');
  const res = await apiClient.patch(`${API_URL}/funnels/stages/${stageId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteStage = async (stageId) => {
  const token = localStorage.getItem('token');
  await apiClient.delete(`${API_URL}/funnels/stages/${stageId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};