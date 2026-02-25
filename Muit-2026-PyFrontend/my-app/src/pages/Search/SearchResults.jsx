import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axiosInstance';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      api.get(`/search?q=${query}`) //
        .then(res => setResults(res.data.items))
        .finally(() => setLoading(false));
    }
  }, [query]);

  return (
    <div className="container">
      <h2 style={{ margin: '2rem 0' }}>Результаты по запросу: "{query}"</h2>
      
      {loading ? <p>Ищем...</p> : (
        <div className="results-list">
          {results.length > 0 ? results.map((hit, index) => (
            <div key={index} className="auth-card" style={{ marginBottom: '1rem' }}>
              <span className={`badge ${hit.type}`}>{hit.type === 'news' ? 'Новость' : 'Клуб'}</span>
              <h3>{hit.title}</h3>
              <p>{hit.snippet}</p>
              <Link to={hit.url} className="text-accent">Перейти →</Link>
            </div>
          )) : <p>Ничего не найдено</p>}
        </div>
      )}
    </div>
  );
}