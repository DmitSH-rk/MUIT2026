// import { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { newsApi } from '../../api/news';

// export default function NewsDetails() {
//   const { id } = useParams();
//   const [item, setItem] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     newsApi.getNewsById(id)
//       .then(setItem)
//       .catch(() => navigate('/news'));
//   }, [id, navigate]);

//   if (!item) return <div className="container">Загрузка...</div>;

//   return (
//     <div className="container" style={{ marginTop: '2rem', maxWidth: '800px' }}>
//       <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '1rem' }}>
//         ← Назад
//       </button>
//       <article className="auth-card">
//         {item.cover_key && (
//           <img src={item.cover_key} alt="cover" style={{ width: '100%', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }} />
//         )}
//         <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{item.title}</h1>
//         <div style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
//           {item.body}
//         </div>
//       </article>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { newsApi } from '../../api/news';
import { getLogoUrlCached } from '../../api/logoUrlCache';

export default function NewsDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [coverUrl, setCoverUrl] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await newsApi.getNewsById(id);
        if (cancelled) return;

        setItem(data);

        const key = data?.cover_key;
        if (key && key !== 'string') {
          setImgLoading(true);
          const url = await getLogoUrlCached(key);
          if (!cancelled) setCoverUrl(url || null);
        } else {
          setCoverUrl(null);
        }
      } catch {
        if (!cancelled) navigate('/news');
      } finally {
        if (!cancelled) setImgLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id, navigate]);

  if (!item) return <div className="container">Загрузка...</div>;

  return (
    <div className="container" style={{ marginTop: '2rem', maxWidth: '800px' }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '1rem' }}>
        ← Назад
      </button>

      <article className="auth-card">
        {imgLoading ? (
          <div style={{ marginBottom: '1.5rem' }}>Загрузка обложки...</div>
        ) : coverUrl ? (
          <img
            src={coverUrl}
            alt="cover"
            style={{ width: '100%', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}
          />
        ) : null}

        <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{item.title}</h1>
        <div style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
          {item.body}
        </div>
      </article>
    </div>
  );
}