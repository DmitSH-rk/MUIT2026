import { useEffect, useState } from 'react';
import { fundingApi } from '../../api/funding';
import { useAuthStore } from '../../store/useAuthStore';
import { Link } from 'react-router-dom';
import './Funding.css';

export default function FundingList() {
  const [campaigns, setCampaigns] = useState([]);
  const { role } = useAuthStore();

  useEffect(() => {
    // Используем твой метод getCampaigns
    fundingApi.getCampaigns().then(data => {
      setCampaigns(Array.isArray(data) ? data : (data.items || []));
    });
  }, []);

  return (
    <div className="container">
      <div className="funding-header">
        <h1>Сборы клубов</h1>
        {/* Кнопка создания доступна только клубам */}
        {role === 'club' && (
          <Link to="/funding/create" className="neon-btn">+ Создать кампанию</Link>
        )}
      </div>

      <div className="funding-grid">
        {campaigns.length > 0 ? campaigns.map(camp => {
          // Высчитываем процент сбора. Если бэк шлет другие названия полей - скажи!
          const current = camp.current_amount || 0;
          const target = camp.target_amount || 1; // защита от деления на 0
          const percent = Math.min(Math.round((current / target) * 100), 100);

          return (
            <div key={camp.id} className="funding-card">
              <div className="card-badge">{camp.type === 'investment' ? 'Инвестиции' : 'Донат'}</div>
              
              <h3 className="funding-title">{camp.title}</h3>
              <p className="funding-desc">{camp.description}</p>
              
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${percent}%` }}></div>
              </div>
              
              <div className="funding-stats">
                <span>{percent}% собрано</span>
                <span className="amount-target">{current} / {target} ₸</span>
              </div>

              {/* Кнопка в стиле твоей btn-outline из Competitions.css */}
              <Link to={`/funding/${camp.id}`} className="btn-outline" style={{ marginTop: '20px' }}>
                Смотреть детали и поддержать
              </Link>
            </div>
          );
        }) : (
          <div style={{ color: 'var(--text-main)', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            Активных сборов пока нет.
          </div>
        )}
      </div>
    </div>
  );
}