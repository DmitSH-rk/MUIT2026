import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';

export default function Register() {
  const [role, setRole] = useState('member'); // member, club, investor, organization
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    username: '', // для member
    name: '', city: '', category: '', // для club/org
    company_name: '' // для investor
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError('Пароли не совпадают');
    
    setLoading(true);
    setError(null);

    try {
      // Диспетчеризация запроса в зависимости от роли
      if (role === 'member') {
        await authApi.registerMember({ 
            email: formData.email, 
            password: formData.password, 
            username: formData.username 
        });
      } else if (role === 'club') {
        await authApi.registerClub({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          city: formData.city,
          category: formData.category
        });
      } else if (role === 'investor') {
        await authApi.registerInvestor({
          email: formData.email,
          password: formData.password,
          company_name: formData.company_name
        });
      } else if (role === 'organization') {
        await authApi.registerOrganization({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          city: formData.city
        });
      }

      alert('Регистрация успешна!');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '3vh' }}>
      <div className="auth-card" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 style={{ color: 'var(--primary)', textAlign: 'center' }}>Создать аккаунт</h2>
        
        {/* Выбор роли */}
        <div style={{ display: 'flex', gap: '10px', margin: '1.5rem 0', flexWrap: 'wrap' }}>
          {['member', 'club', 'investor', 'organization'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              style={{
                flex: '1 1 45%',
                padding: '8px',
                fontSize: '0.8rem',
                backgroundColor: role === r ? 'var(--primary)' : 'transparent',
                color: role === r ? 'white' : 'var(--text-main)',
                border: `1px solid ${role === r ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                cursor: 'pointer'
              }}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Общие поля */}
          <input name="email" type="email" placeholder="Email" required onChange={handleInputChange} />
          
          {/* Поля для Role: Member */}
          {role === 'member' && (
            <input name="username" type="text" placeholder="Username" required onChange={handleInputChange} />
          )}

          {/* Поля для Клуба и Организации */}
          {(role === 'club' || role === 'organization') && (
            <>
              <input name="name" type="text" placeholder="Название" required onChange={handleInputChange} />
              <input name="city" type="text" placeholder="Город" required onChange={handleInputChange} />
            </>
          )}

          {/* Поле только для Клуба */}
          {role === 'club' && (
            <input name="category" type="text" placeholder="Категория (напр. Профессиональный)" required onChange={handleInputChange} />
          )}

          {/* Поле только для Инвестора */}
          {role === 'investor' && (
            <input name="company_name" type="text" placeholder="Название компании (опц.)" onChange={handleInputChange} />
          )}

          <input name="password" type="password" placeholder="Пароль" required onChange={handleInputChange} />
          <input name="confirmPassword" type="password" placeholder="Повторите пароль" required onChange={handleInputChange} />

          {error && <p style={{ color: 'var(--support)', fontSize: '0.9rem' }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Загрузка...' : `Зарегистрироваться как ${role}`}
          </button>
        </form>
      </div>
    </div>
  );
}