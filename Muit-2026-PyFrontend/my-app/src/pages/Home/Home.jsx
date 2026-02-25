// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { newsApi } from '../../api/news';
// import './Home.css';

// export default function Home() {
//   const [latestNews, setLatestNews] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     newsApi.getNews(3, 0)
//       .then(data => {
//         console.log("Данные с бэка:", data);
//         // Проверяем: если бэк вернул массив напрямую — используем его, 
//         // если объект с полем items — берем items.
//         const newsArray = Array.isArray(data) ? data : (data.items || []);
//         setLatestNews(newsArray);
//       })
//       .catch(err => {
//         console.error("Ошибка при загрузке новостей на главной:", err);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   return (
//     <div className="container" style={{ marginTop: '2rem' }}>
//       <section className="hero" style={{ textAlign: 'center', marginBottom: '3rem' }}>
//         <h1 style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>MUIT 2026</h1>
//         <p style={{ color: 'var(--text-muted)' }}>Добро пожаловать на платформу развития футбола</p>
//       </section>

//       <section className="news-preview">
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
//           <h2 style={{ color: 'var(--text-main)' }}>Последние новости</h2>
//           <Link to="/news" className="view-all" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>
//             Все новости →
//           </Link>
//         </div>

//         {loading ? (
//           <p>Загрузка новостей...</p>
//         ) : (
//           <div className="news-grid-home">
//             {latestNews && latestNews.length > 0 ? (
//               latestNews.map(item => (
//                 <article key={item.id} className="news-card-mini">
//                   <div className="news-image-wrapper">
//                     <img 
//                       src={item.cover_key} 
//                       alt={item.title} 
//                     />
//                   </div>
//                   <div className="news-content">
//                     <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.title}</h3>
//                     <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
//                       {item.body ? `${item.body.substring(0, 100)}...` : 'Нет описания'}
//                     </p>
//                     <Link to={`/news/${item.id}`} className="read-more">
//                       Читать полностью
//                     </Link>
//                   </div>
//                 </article>
//               ))
//             ) : (
//               <div className="auth-card" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
//                 <p>Новостей пока нет. Будьте первым, кто опубликует!</p>
//               </div>
//             )}
//           </div>
//         )}
//       </section>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { newsApi } from '../../api/news';
import { getLogoUrlCached } from '../../api/logoUrlCache'; // Подключаем кэш картинок
import './Home.css';

// Мини-компонент для карточки новости с логикой загрузки изображения
function NewsCardMini({ item }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);

  useEffect(() => {
    if (item.cover_key) {
      setImgLoading(true);
      // Получаем реальную ссылку по ключу через кэш
      getLogoUrlCached(item.cover_key)
        .then(url => setImageUrl(url))
        .catch(() => setImageUrl(null))
        .finally(() => setImgLoading(false));
    }
  }, [item.cover_key]);

  return (
    <article className="news-card-mini">
      <div className="news-image-wrapper" style={{ background: 'var(--bg-input)', height: '180px', position: 'relative', overflow: 'hidden' }}>
        {imgLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Загрузка...</span>
          </div>
        ) : imageUrl ? (
          <img 
            src={imageUrl} 
            alt={item.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '2rem' }}>
            ⚽
          </div>
        )}
      </div>
      <div className="news-content">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{item.title}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
          {item.body ? `${item.body.substring(0, 100)}...` : 'Нет описания'}
        </p>
        <Link to={`/news/${item.id}`} className="read-more" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
          Читать полностью
        </Link>
      </div>
    </article>
  );
}

export default function Home() {
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsApi.getNews(3, 0)
      .then(data => {
        console.log("Данные новостей:", data);
        const newsArray = Array.isArray(data) ? data : (data.items || []);
        setLatestNews(newsArray);
      })
      .catch(err => {
        console.error("Ошибка при загрузке новостей на главной:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="container" style={{ marginTop: '2rem', paddingBottom: '5rem' }}>
       <section className="hero" style={{ textAlign: 'center', marginBottom: '3rem' }}>
       <h1 style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>MUIT 2026</h1>
         <p style={{ color: 'var(--text-muted)' }}>Добро пожаловать на платформу развития футбола</p>
       </section>

      <section className="news-preview">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.8rem' }}>Последние новости</h2>
          <Link to="/news" className="view-all" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem' }}>
            Все новости →
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p color="var(--text-muted)">Загрузка свежих новостей...</p>
          </div>
        ) : (
          <div className="news-grid-home" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {latestNews && latestNews.length > 0 ? (
              latestNews.map(item => (
                <NewsCardMini key={item.id} item={item} />
              ))
            ) : (
              <div className="auth-card" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>Новостей пока нет. Будьте первым, кто опубликует!</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}