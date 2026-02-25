// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { newsApi } from '../../api/news';
// import { useAuthStore } from '../../store/useAuthStore';

// export default function NewsList() {
//   const [news, setNews] = useState([]);
//   const { role } = useAuthStore(); // Достали роль

//   useEffect(() => {
//     newsApi.getNews().then(setNews);
//   }, []);

//   return (
//     <div className="container">
//       <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0' }}>
//         <h1 style={{ color: 'var(--primary)' }}>Новости платформы</h1>
        
//         {/* ИСПРАВЛЕНО: проверяем напрямую переменную role */}
//         {role === 'club' && (
//           <Link to="/news/create" className="btn-primary">
//               + Написать новость
//           </Link>
//         )}
//       </header>

//       <div style={{ display: 'grid', gap: '2rem' }}>
//         {news.map(item => (
//           <article key={item.id} className="auth-card" style={{ display: 'flex', gap: '20px', padding: '15px' }}>
//             {item.cover_key && (
//               <img src={item.cover_key} alt="cover" style={{ width: '200px', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
//             )}
//             <div style={{ flex: 1 }}>
//               <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>{item.title}</h3>
//               <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>
//                 {item.body.substring(0, 180)}...
//               </p>
//               <Link to={`/news/${item.id}`} style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
//                 Читать полностью →
//               </Link>
//             </div>
//           </article>
//         ))}
//       </div>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { newsApi } from '../../api/news';
import { useAuthStore } from '../../store/useAuthStore';
import { getLogoUrlCached } from '../../api/logoUrlCache';

export default function NewsList() {
  const [news, setNews] = useState([]);
  const [coverUrls, setCoverUrls] = useState({}); // { [newsId]: url }
  const { role } = useAuthStore();

  useEffect(() => {
    newsApi.getNews().then(setNews);
  }, []);

  // Список ключей, которые надо резолвить
  const coverKeys = useMemo(() => {
    return news
      .filter(n => n?.cover_key && n.cover_key !== 'string')
      .map(n => ({ id: n.id, key: n.cover_key }));
  }, [news]);

  useEffect(() => {
    let cancelled = false;

    async function resolveCovers() {
      if (!coverKeys.length) {
        setCoverUrls({});
        return;
      }

      try {
        const entries = await Promise.all(
          coverKeys.map(async ({ id, key }) => {
            const url = await getLogoUrlCached(key);
            return [id, url || null];
          })
        );

        if (cancelled) return;

        const next = {};
        for (const [id, url] of entries) next[id] = url;
        setCoverUrls(next);
      } catch (e) {
        console.error('Ошибка загрузки cover url:', e);
        if (!cancelled) setCoverUrls({});
      }
    }

    resolveCovers();
    return () => { cancelled = true; };
  }, [coverKeys]);

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0' }}>
        <h1 style={{ color: 'var(--primary)' }}>Новости платформы</h1>

        {role === 'club' && (
          <Link to="/news/create" className="btn-primary">
            + Написать новость
          </Link>
        )}
      </header>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {news.map(item => {
          const coverUrl = coverUrls[item.id];

          return (
            <article key={item.id} className="auth-card" style={{ display: 'flex', gap: '20px', padding: '15px' }}>
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt="cover"
                  style={{ width: '200px', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius)' }}
                />
              ) : null}

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>
                  {item.body.substring(0, 180)}...
                </p>
                <Link to={`/news/${item.id}`} style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
                  Читать полностью →
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}