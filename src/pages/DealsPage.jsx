import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiClient from '../services/apiClient';
const DealsPage = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Токен отсутствует');
          navigate('/login');
          return;
        }

        
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub;

      
        const res = await apiClient.get(`${API_URL}/funnels/me`, {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });

        const funnels = res.data;

        
        const userFunnel = funnels.find(funnel => funnel.owner_id === userId);

        if (userFunnel && userFunnel.funnel_id) {
          navigate(`/funnels/${userFunnel.funnel_id}`);
        } else {
          navigate('/funnel/settings');
        }
      } catch (error) {
        console.error('Не удалось загрузить воронку:', error.message);
        navigate('/funnel/settings');
      }
    };

    load();
  }, []);

  return null; 
};

export default DealsPage;