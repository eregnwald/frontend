import axios from 'axios';
import apiClient from '../services/apiClient';
const API_URL = process.env.REACT_APP_API_URL;

export const fetchOpportunitiesByFunnelId = async (funnelId, token) => {
  const res = await apiClient.get(`${API_URL}/opportunities/funnel/${funnelId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log('Fetched deals:', res.data); 

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

export const createOpportunity = async (payload) => {
  const token = localStorage.getItem('token');
  const res = await apiClient.post(`${API_URL}/opportunities`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};


export const getSharedStages = async (token) => {
  const res = await apiClient.get(`${process.env.REACT_APP_API_URL}/funnels/shared/stages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};