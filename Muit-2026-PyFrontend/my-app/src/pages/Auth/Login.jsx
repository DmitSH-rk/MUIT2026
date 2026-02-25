import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/useAuthStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Запрос на логин (уходит как x-www-form-urlencoded)
      const tokenData = await authApi.login(email, password);
      
      // Сохраняем токен в localStorage для axiosInstance
      localStorage.setItem('access_token', tokenData.access_token);

      // 2. Сразу получаем данные о профиле (имя, роль и т.д.)
      const userData = await authApi.getMe();
      
      // 3. Обновляем глобальное состояние (Zustand)
      setAuth(userData, tokenData);
      
      navigate('/'); // Уходим на главную
    } catch (err) {
      // Обработка 401
      setError('Неверный email или пароль');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '10vh' }}>
      <div className="auth-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>Вход</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Пароль</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          {error && <p style={{ color: 'var(--support)', fontSize: '0.85rem' }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px' }}>
            {loading ? 'Проверка...' : 'Войти'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Нет аккаунта? <Link to="/register" className="text-accent" style={{ textDecoration: 'none', fontWeight: 'bold' }}>Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}