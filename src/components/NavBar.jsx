// src/components/NavBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavBar.css';

export const NavBar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        <div className="navbar-logo">CRM</div>

        <ul className="navbar-list">
          <li>
            <Link to="/" className="navbar-link" title="Главная">
              🏠
            </Link>
          </li>
          {user && (
            <>
              <li>
                <Link to="/users" className="navbar-link" title="Пользователи">
                  👥
                </Link>
              </li>
              <li>
                <Link to="/profile" className="navbar-link" title="Профиль">
                  👤
                </Link>
              </li>
              <li>
                <Link to="/contacts" className="navbar-link" title="Клиенты">
                  📞
                </Link>
              </li>
              <li>
                <Link to="/accounts" classname="navbar-link" title="Компании">
                </Link>
              </li>
              {user.roles?.includes('admin') && (
                <li>
                  <Link to="/admin" className="navbar-link" title="Админка">
                    ⚙️
                  </Link>
                </li>
              )}
              <li>
                <Link to="/opportunities" className="navbar-link" title="Сделки">
                  💼
                </Link>
              </li>
              <li>
                <Link to="/tasks" className="navbar-link" title="Задачи">
                  ✅
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="navbar-link" title="Дашборд">
                  📊
                </Link>
              </li>
              <li>
                <button onClick={logout} className="navbar-logout" title="Выйти">
                  🔐
                </button>
              </li>
            </>
          )}

          {!user && (
            <>
              <li>
                <Link to="/login" className="navbar-link" title="Войти">
                  🔑
                </Link>
              </li>
              <li>
                <Link to="/register" className="navbar-link" title="Регистрация">
                  📝
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};