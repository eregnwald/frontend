// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient, { cancelAllRequests } from '../services/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isLoggedOut, setIsLoggedOut] = useState(false); // Флаг для проверки выхода пользователя

  const API_URL = process.env.REACT_APP_API_URL;

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiClient.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(parseJwt(token));
      } catch (err) {
        console.error('Ошибка получения профиля:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, API_URL]);

  const login = ({ accessToken, refreshToken }) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refresh_token', refreshToken); // Исправлено
    setToken(accessToken);
    setUser(parseJwt(accessToken));
    setIsLoggedOut(false); // Сбрасываем флаг при входе
  };

  const logout = () => {
    console.log('Logout called'); // Добавляем логирование
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token'); // Исправлено
    setToken(null);
    setUser(null);
    setIsLoggedOut(true); // Устанавливаем флаг при выходе
    console.log('Local storage after logout:', localStorage.getItem('token'), localStorage.getItem('refresh_token')); // Добавляем логирование
    cancelAllRequests(); // Отменяем все запросы
    window.location.href = '/login'; // Перенаправление на страницу входа
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isLoggedOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);