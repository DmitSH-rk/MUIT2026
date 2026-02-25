import { useEffect, useState } from 'react';
import { competitionsApi } from '../../api/competitions';
import { useAuthStore } from '../../store/useAuthStore';
import { Link } from 'react-router-dom';
import './Competitions.css';

export default function CompetitionsList() {
  const [competitions, setCompetitions] = useState([]);
  const { role } = useAuthStore();

  useEffect(() => {
    competitionsApi.getCompetitions().then(data => {
      setCompetitions(Array.isArray(data) ? data : (data.items || []));
    });
  }, []);

  return (
    <div className="container">
      <div className="arena-header">
        <h1>Арена Баттлов</h1>
        {role === 'club' && (
          <Link to="/competitions/create" className="neon-btn">+ Вызов</Link>
        )}
      </div>

      <div className="battles-grid">
        {competitions.map(comp => {
          const [teams] = comp.title.split('(');
          const [t1, t2] = teams.split('vs');

          return (
            <div key={comp.id} className="arena-card">
              <div className="card-badge">{comp.status}</div>
              
              <div className="match-display">
                <span className="team-text">{t1?.trim()}</span>
                <span className="vs-glow">VS</span>
                <span className="team-text">{t2?.trim()}</span>
              </div>
              
              <p className="description-text">{comp.description}</p>
              
              <Link to={`/competitions/${comp.id}`} className="btn-outline">
                Смотреть детали
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}