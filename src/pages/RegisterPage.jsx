import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
const API_URL = process.env.REACT_APP_API_URL;

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      await apiClient.post(`${API_URL}/users`, formData);
      navigate('/users'); 
    } catch (err) {
      setError('Ошибка при регистрации');
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Регистрация пользователя</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Имя пользователя:</label>
          <input type="text" name="username" onChange={handleChange} required />
        </div>

        <div>
          <label>Email:</label>
          <input type="email" name="email" onChange={handleChange} required />
        </div>

        <div>
          <label>Пароль:</label>
          <input type="password" name="password" onChange={handleChange} required />
        </div>

        

        <button type="submit">Зарегистрировать</button>
      </form>
    </div>
  );
};

export default RegisterPage;