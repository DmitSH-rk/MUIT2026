import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { competitionsApi } from '../../api/competitions';
import { clubsApi } from '../../api/clubs';
import { useAuthStore } from '../../store/useAuthStore';
import './Competitions.css';

export default function CreateCompetition() {
  const { user } = useAuthStore();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tag: '',
    description: '',
    starts_at: '',
    ends_at: '',
    opponent_id: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await clubsApi.getClubs({ limit: 100 });
        let rawList = Array.isArray(response) ? response : (response?.items || []);
        const filtered = rawList.filter(c => String(c.id) !== String(user?.id));
        setClubs(filtered);
      } catch (err) {
        console.error("Ошибка загрузки клубов:", err);
      }
    };
    fetchClubs();
  }, [user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.opponent_id) return alert("Выберите соперника!");
    setLoading(true);

    try {
      const opponent = clubs.find(c => String(c.id) === String(formData.opponent_id));
      const myName = user?.username || "Мой Клуб";
      const oppName = opponent?.title || opponent?.name || opponent?.username || "Соперник";
      
      const payload = {
        title: `${myName} vs ${oppName} (${formData.tag || 'Баттл'})`,
        description: formData.description,
        starts_at: new Date(formData.starts_at).toISOString(),
        ends_at: new Date(formData.ends_at).toISOString()
      };

      await competitionsApi.createCompetition(payload);
      alert('Вызов брошен!');
      navigate('/competitions');
    } catch (err) {
      alert('Ошибка при создании');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="battle-form-container">
        <h2 className="form-title">⚔️ Новый Вызов</h2>
        <form className="battle-form" onSubmit={handleSubmit}>
          
          <div className="input-group">
            <label htmlFor="battleTag">Тип баттла</label>
            <input
              id="battleTag"
              name="tag"
              type="text"
              placeholder="Напр: Городское Дерби"
              required
              value={formData.tag}
              onChange={e => setFormData({ ...formData, tag: e.target.value })}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="opponent">Ваш противник</label>
            <select 
              id="opponent"
              name="opponent_id"
              required 
              value={formData.opponent_id}
              onChange={e => setFormData({...formData, opponent_id: e.target.value})}
            >
              <option value="">-- Выберите клуб --</option>
              {clubs.map(club => (
                <option key={club.id} value={club.id}>
                  {club.title || club.name || club.username}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="battleDescription">Условия баттла</label>
            <textarea
              id="battleDescription"
              name="description"
              rows="4"
              placeholder="Опишите правила..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          
          <div className="date-grid">
            <div className="input-group">
              <label htmlFor="startsAt">Начало</label>
              <input
                id="startsAt"
                name="starts_at"
                type="datetime-local"
                required
                value={formData.starts_at}
                onChange={e => setFormData({ ...formData, starts_at: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label htmlFor="endsAt">Конец</label>
              <input
                id="endsAt"
                name="ends_at"
                type="datetime-local"
                required
                value={formData.ends_at}
                onChange={e => setFormData({ ...formData, ends_at: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="neon-btn full-width" disabled={loading}>
            {loading ? 'Отправка...' : 'Бросить вызов'}
          </button>
        </form>
      </div>
    </div>
  );
}