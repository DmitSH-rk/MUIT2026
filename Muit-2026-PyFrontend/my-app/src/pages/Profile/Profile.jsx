import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/auth';
import { newsApi } from '../../api/news';
import ClubSettings from './ClubSettings';
import './Profile.css';

export default function Profile() {
  const { user, role, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [myNews, setMyNews] = useState([]);

  // 1. Загружаем данные профиля и новости клуба
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Обновляем данные пользователя
        const userData = await authApi.getMe();
        setAuth(userData, { access_token: localStorage.getItem('access_token') });

        // Если это клуб, загружаем его новости
        if (userData.role === 'club') {
          const newsData = await newsApi.getNews(50, 0);
          const allNews = Array.isArray(newsData) ? newsData : (newsData.items || []);
          // Фильтруем новости: оставляем только те, где club_id совпадает с id пользователя
          setMyNews(allNews.filter(n => n.club_id === userData.id));
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных профиля:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setAuth]);

  // 2. Функция удаления новости
  const handleDeleteNews = async (newsId) => {
    if (window.confirm('Вы точно хотите удалить эту новость?')) {
      try {
        await newsApi.deleteNews(newsId);
        // Мгновенно обновляем список на экране
        setMyNews(prev => prev.filter(n => n.id !== newsId));
      } catch (err) {
        alert("Не удалось удалить новость. Ошибка сервера.");
      }
    }
  };

  if (loading) return <div className="container" style={{ marginTop: '2rem' }}>Загрузка профиля...</div>;

  return (
    <div className="container profile-page">
      {/* Шапка профиля */}
      <div className="profile-header auth-card">
        <div className="profile-avatar">
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h1>{user?.username}</h1>
          <span className="role-badge">
            {role === 'club' ? 'Футбольный клуб' : role === 'investor' ? 'Инвестор' : 'Участник'}
          </span>
          <p className="email-text">{user?.email}</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Левая колонка: Настройки (только для клуба) */}
        <div className="profile-main-content">
          {role === 'club' ? (
            <>
              <ClubSettings />
              
              <div className="auth-card" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3>Мои публикации</h3>
                  <Link to="/news/create" className="btn-primary" style={{ fontSize: '0.8rem' }}>
                    + Создать
                  </Link>
                </div>

                <div className="my-news-list">
                  {myNews.length > 0 ? (
                    myNews.map(item => (
                      <div key={item.id} className="news-manage-item" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid var(--border)'
                      }}>
                        <span style={{ fontWeight: '500' }}>{item.title}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleDeleteNews(item.id)}
                            className="btn-danger"
                            style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>У вас пока нет новостей.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="auth-card">
              <h3>Добро пожаловать, {user?.username}!</h3>
              <p>Здесь будет ваша история активности и подписки.</p>
            </div>
          )}
        </div>

        {/* Правая колонка: Статистика */}
        <div className="profile-sidebar">
          <div className="profile-section auth-card">
            <h3>Активность</h3>
            <div className="stats-row" style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1.5rem' }}>
              <div className="stat-item" style={{ textAlign: 'center' }}>
                <span className="stat-value" style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {role === 'club' ? myNews.length : 0}
                </span>
                <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {role === 'club' ? 'Новостей' : 'Подписок'}
                </span>
              </div>
              <div className="stat-item" style={{ textAlign: 'center' }}>
                <span className="stat-value" style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>0 ₸</span>
                <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Инвестиций</span>
              </div>
            </div>
          </div>

         {role === 'club' && (
            <div className="auth-card" style={{ marginTop: '1.5rem' }}>
                <h3>Управление активностью</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
                <Link to="/competitions/create" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none' }}>
                    ⚔️ Бросить вызов (Battle)
                </Link>
                <Link to="/funding/create" className="btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>
                    💰 Создать сбор
                </Link>
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}