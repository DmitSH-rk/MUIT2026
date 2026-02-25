import { useEffect, useState } from 'react';
import { clubsApi } from '../../api/clubs';
import ClubCard from '../../components/ClubCard';

export default function ClubList() {
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Эффект для поиска с задержкой (Debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadClubs(searchTerm);
    }, 500); // Ждем 500мс после последнего нажатия клавиши

    return () => clearTimeout(delayDebounceFn); // Очистка таймера (RAII)
  }, [searchTerm]);

  const loadClubs = async (query) => {
    setLoading(true);
    try {
      // Отправляем запрос с параметром search
      const data = await clubsApi.getClubs({ search: query }); 
      setClubs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0' }}>
        <h1 style={{ color: 'var(--primary)' }}>Клубы</h1>
        <input 
          type="text" 
          placeholder="Поиск по названию или городу..." 
          style={{ width: '300px' }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <p>Синхронизация с базой...</p>}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '2rem' 
      }}>
        {clubs.length > 0 ? (
          clubs.map(club => <ClubCard key={club.id} club={club} />)
        ) : (
          !loading && <p>Клубы не найдены. Попробуйте другой запрос.</p>
        )}
      </div>
    </div>
  );
}