import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FunnelDetailsPage from './FunnelDetailsPage'; 
import { useDealStore } from '../store/useDealStore';


const SharedFunnelPage = () => {
  const { fetchSharedFunnel } = useDealStore();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSharedFunnel = async () => {
      try {
        const sharedFunnelId = await fetchSharedFunnel(); 
        if (!sharedFunnelId) {
          throw new Error('Не удалось получить ID общей воронки');
        }
      } catch (e) {
        console.error('Ошибка при загрузке общей воронки:', e);
        navigate('/error'); 
      }
    };

    loadSharedFunnel();
  }, []);

  return <FunnelDetailsPage />; 
};

export default SharedFunnelPage;