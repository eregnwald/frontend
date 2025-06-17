// NotificationsPage.tsx

import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    apiClient.get('/notifications').then(res => {
      setNotifications(res.data);
    });
  }, []);

  return (
    <div>
      <h2>Ваши уведомления</h2>
      {notifications.length === 0 && <p>Нет уведомлений</p>}
      <ul>
        {notifications.map(n => (
          <li key={n.id}>
            <strong>{n.title}</strong>
            <p>{n.message}</p>
            <small>{new Date(n.due_date).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}