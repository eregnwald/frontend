// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
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
      await axios.post('http://localhost:3000/users', formData);
      navigate('/users'); // перейти к списку пользователей
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

        <div>
          <label>Имя:</label>
          <input type="text" name="first_name" onChange={handleChange} />
        </div>

        <div>
          <label>Фамилия:</label>
          <input type="text" name="last_name" onChange={handleChange} />
        </div>

        <button type="submit">Зарегистрировать</button>
      </form>
    </div>
  );
};

export default RegisterPage;