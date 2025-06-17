import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AiFillEdit, AiFillDelete } from 'react-icons/ai';
import apiClient from '../services/apiClient';

const API_URL = process.env.REACT_APP_API_URL;

const AccountsList = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await apiClient.get(`${API_URL}/accounts`);
        setAccounts(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке компаний:', error);
      }
    };
    fetchAccounts();
  }, []);

  const handleEdit = (accountId) => {
    window.location.href = `/accounts/edit/${accountId}`;
  };

  const handleDelete = async (accountId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту компанию?')) {
      try {
        await apiClient.delete(`${API_URL}/accounts/${accountId}`);
        setAccounts(accounts.filter((a) => a.account_id !== accountId));
      } catch (error) {
        console.error('Ошибка при удалении компании:', error);
      }
    }
  };

  return (
    <div>
      <h2>Список компаний</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Название</th>
            <th>Email</th>
            <th>Телефон</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr key={account.account_id}>
              <td>{account.account_name}</td>
              <td>{account.email || '-'}</td>
              <td>{account.phone || '-'}</td>
              <td>
                <button onClick={() => handleEdit(account.account_id)}>
                  <AiFillEdit /> Редактировать
                </button>
                <button onClick={() => handleDelete(account.account_id)}>
                  <AiFillDelete /> Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccountsList;