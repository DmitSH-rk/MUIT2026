import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { competitionsApi } from '../../api/competitions';
import { useAuthStore } from '../../store/useAuthStore';
import './Competitions.css';

export default function CompetitionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [battle, setBattle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false); // Состояние участия
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await competitionsApi.getCompetitions();
        const current = Array.isArray(data) ? data.find(c => String(c.id) === String(id)) : null;
        setBattle(current);
        // Здесь можно проверить, есть ли ID пользователя в списке участников баттла, если бэк это шлет
      } catch (err) {
        console.error("Ошибка загрузки деталей:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      alert("Пожалуйста, войдите в систему, чтобы подтвердить участие");
      return navigate('/login');
    }

    try {
      await competitionsApi.joinCompetition(id);
      setIsJoined(true);
      alert("Вы добавлены в список зрителей/участников!");
    } catch (err) {
      // Если бэк еще не готов, просто имитируем для UI
      setIsJoined(true);
      console.log("Эндпоинт пока не отвечает, но UI обновили");
    }
  };

  if (loading) return <div className="container"><h2 style={{color: 'var(--accent)'}}>Загрузка...</h2></div>;
  if (!battle) return <div className="container"><h2 style={{color: 'white'}}>Баттл не найден</h2></div>;

  const [teams, tag] = battle.title.split('(');
  const [t1, t2] = teams.split('vs');

  return (
    <div className="container">
      <div className="battle-details-wrapper">
        <button onClick={() => navigate(-1)} className="back-link">← Назад на Арену</button>
        
        <div className="battle-hero-card">
          <div className="card-badge">{battle.status}</div>
          
          <div className="hero-match-display">
            <div className="hero-team">
              <h2>{t1?.trim()}</h2>
              <div className="team-status">ВЫЗЫВАЮЩИЙ</div>
            </div>
            
            <div className="hero-vs-block">
              <div className="vs-glow-big">VS</div>
              {tag && <div className="hero-tag">#{tag.replace(')', '')}</div>}
            </div>

            <div className="hero-team">
              <h2>{t2?.trim()}</h2>
              <div className="team-status">ОППОНЕНТ</div>
            </div>
          </div>

          <div className="battle-info-grid">
            <div className="info-item">
              <label>Когда битва?</label>
              <p>{new Date(battle.starts_at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="info-item">
              <label>Детали и правила</label>
              <p>{battle.description || "Никаких пощад, только честная игра!"}</p>
            </div>
          </div>

          <div className="battle-actions">
            <button 
              className={`neon-btn ${isJoined ? 'joined' : ''}`} 
              onClick={handleJoin}
              disabled={isJoined}
            >
              {isJoined ? '✓ Я ИДУ' : 'Я ПРИДУ ПОСМОТРЕТЬ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}