import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import './Navbar.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        <Link to="/" className="nav-logo">
          MUITS<span>2026</span>
        </Link>

        <nav className="nav-menu">
          <Link 
            to="/clubs" 
            className={`nav-link ${location.pathname === '/clubs' ? 'active' : ''}`}
          >
            Клубы
          </Link>
          
          {/* НОВАЯ ССЫЛКА НА БАТТЛЫ */}
          <Link 
            to="/competitions" 
            className={`nav-link ${location.pathname.startsWith('/competitions') ? 'active' : ''}`}
          >
            Арена Баттлов
          </Link>

          <Link 
            to="/funding" 
            className={`nav-link ${location.pathname === '/funding' ? 'active' : ''}`}
          >
            Финансирование
          </Link>
          
          <Link 
            to="/news" 
            className={`nav-link ${location.pathname === '/news' ? 'active' : ''}`}
          >
            Новости
          </Link>

          <div className="nav-divider"></div>

          {isAuthenticated ? (
            <div className="nav-user-section">
              {/* <Link to="/profile" className="nav-profile-link">
                <div className="user-avatar-mini">
                  {user?.username?.[0].toUpperCase()}
                </div>
                <span className="user-name">{user?.username}</span>
              </Link> */}

              <Link to="/profile" className="nav-profile-link" aria-label="Личный кабинет">
                

                <div className="user-avatar-mini">
                  {(user?.username?.[0] || 'U').toUpperCase()}
                </div>

                <span className="user-name">{user?.username}</span>
              </Link>
              <button onClick={logout} className="logout-button">
                Выйти
              </button>
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="login-link">Войти</Link>
              <Link to="/register" className="register-btn">Начать</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
