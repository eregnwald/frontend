import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

export const useTaskNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      if (res.data.length > 0) {
    
        const newNotifications = res.data.filter(
          (n) => !notifications.some((not) => not.id === n.id)
        );

        if (newNotifications.length > 0) {
          setNotifications((prev) => [...newNotifications, ...prev]);
          setShow(true);
        }
      }
    } catch (e) {
      console.error('Ошибка загрузки уведомлений:', e);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await apiClient.post(`/notifications/${notificationId}/read`);
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
      setShow(false);
    } catch (error) {
      console.error('Ошибка при отметке уведомления как прочитанного:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15 * 60 * 1000); 
    return () => clearInterval(interval);
  }, []);

  return { notifications, show, setShow, markNotificationAsRead };
};