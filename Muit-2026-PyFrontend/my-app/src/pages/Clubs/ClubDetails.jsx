// import { useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { clubsApi } from '../../api/clubs';

// export default function ClubDetails() {
//   const { id } = useParams();
//   const [club, setClub] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchClub = async () => {
//       try {
//         setLoading(true);
//         const data = await clubsApi.getClubById(id);
//         setClub(data);
//       } catch (err) {
//         console.error("Ошибка при загрузке данных клуба:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchClub();
//   }, [id]);

//   if (loading) return <div className="container" style={{ marginTop: '2rem' }}><h2>Загрузка...</h2></div>;
//   if (!club) return <div className="container" style={{ marginTop: '2rem' }}><h2>Клуб не найден</h2></div>;

//   return (
//     <div className="container" style={{ marginTop: '2.5rem', paddingBottom: '5rem' }}>
      
//       {/* Кнопка "Назад" */}
//       <Link to="/clubs" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
//         &larr; Назад к списку
//       </Link>

//       <div className="auth-card" style={{ padding: '2rem' }}>
        
//         {/* Шапка профиля */}
//         <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
          
//           {/* Логотип */}
//           <div style={{ 
//             width: '150px', height: '150px', borderRadius: '20px', 
//             backgroundColor: 'var(--bg-input)', overflow: 'hidden',
//             border: '2px solid var(--primary)', flexShrink: 0
//           }}>
//             {club.logo_key ? (
//               <img src={club.logo_key} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//             ) : (
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '3rem' }}>
//                 ⚽
//               </div>
//             )}
//           </div>

//           {/* Основная информация */}
//           <div style={{ flexGrow: 1 }}>
//             <h1 style={{ color: 'var(--primary)', margin: '0 0 10px 0', fontSize: '2.5rem' }}>{club.name}</h1>
            
//             <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', marginBottom: '15px', flexWrap: 'wrap' }}>
//               <span style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '20px' }}>
//                 📍 {club.city || 'Город не указан'}
//               </span>
//               <span style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '20px' }}>
//                 🏆 {club.category === 'pro' ? 'Профессиональный' : club.category === 'amateur' ? 'Любительский' : 'Юношеский'}
//               </span>
//               <span style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '20px' }}>
//                 📧 {club.email}
//               </span>
//             </div>
            
//             {club.website && (
//               <a href={club.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
//                 🌐 Официальный сайт
//               </a>
//             )}
//           </div>
//         </div>

//         <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0' }} />

//         {/* Секция описания */}
//         <div>
//           <h3 style={{ color: 'var(--accent)', marginBottom: '15px' }}>О клубе</h3>
//           <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#ccc', whiteSpace: 'pre-wrap' }}>
//             {club.description || 'Клуб пока не добавил описание.'}
//           </p>
//         </div>

//         {/* Дополнительная секция (если нужно, можно добавить достижения, соцсети и т.д.) */}
//         {club.social_links && (
//             <div style={{ marginTop: '2rem' }}>
//               <h4 style={{ color: 'var(--accent)' }}>Социальные сети</h4>
//               {/* Рендеринг ссылок, если они есть */}
//               {Object.entries(club.social_links).map(([platform, link]) => (
//                 <a key={platform} href={link} target="_blank" rel="noopener noreferrer" style={{ marginRight: '15px', color: '#fff' }}>
//                   {platform}
//                 </a>
//               ))}
//             </div>
//         )}

//       </div>
//     </div>
//   );
// }

// src/pages/ClubDetails.jsx
// src/pages/ClubDetails.jsx
// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import { clubsApi } from "../../api/clubs"; //
// import { getLogoUrlCached } from "../../api/logoUrlCache"; // Добавлен импорт кеша

// export default function ClubDetails() {
//   const { id } = useParams();
//   const [club, setClub] = useState(null);
//   const [logoUrl, setLogoUrl] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [logoLoading, setLogoLoading] = useState(false);

//   useEffect(() => {
//     const fetchClub = async () => {
//       try {
//         setLoading(true);
//         const data = await clubsApi.getClubById(id); //
//         setClub(data);

//         if (data.logo_key && data.logo_key !== "string") {
//           setLogoLoading(true);
//           const url = await getLogoUrlCached(data.logo_key); //
//           setLogoUrl(url);
//         }
//       } catch (err) {
//         console.error("Ошибка при загрузке данных клуба:", err);
//       } finally {
//         setLoading(false);
//         setLogoLoading(false);
//       }
//     };
    
//     fetchClub();
//   }, [id]);

//   if (loading) return <div className="container" style={{ marginTop: '2rem' }}><h2>Загрузка...</h2></div>;
//   if (!club) return <div className="container" style={{ marginTop: '2rem' }}><h2>Клуб не найден</h2></div>;

//   return (
//     <div className="container" style={{ marginTop: '2.5rem', paddingBottom: '5rem' }}>
//       <Link to="/clubs" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem' }}>
//         ← К списку клубов
//       </Link>

//       <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
//         <div style={{
//           width: 280, height: 280, borderRadius: 18, overflow: "hidden",
//           border: "1px solid var(--border)", display: "flex",
//           alignItems: "center", justifyContent: "center", background: "var(--bg-input)"
//         }}>
//           {logoLoading ? (
//             <span>Загрузка...</span>
//           ) : logoUrl ? (
//             <img src={logoUrl} alt={club.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//           ) : (
//             <span style={{ fontSize: '4rem' }}>⚽</span>
//           )}
//         </div>

//         <div style={{ flex: '1', minWidth: '300px' }}>
//           <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{club.name}</h1>
//           <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>📍 {club.city} | {club.category}</p>
//           <div className="auth-card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
//             <h4>Описание</h4>
//             <p>{club.description || 'Описание отсутствует'}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { clubsApi } from "../../api/clubs";
import { getLogoUrlCached } from "../../api/logoUrlCache";

export default function ClubDetails() {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoLoading, setLogoLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchClub = async () => {
      try {
        setLoading(true);

        // 1) /clubs/{id}
        const data = await clubsApi.getClubById(id);
        if (cancelled) return;

        setClub(data);

        // 2) /media/public-url?object_key=logo_key
        const logoKey = data?.logo_key;
        if (logoKey && logoKey !== "string") {
          setLogoLoading(true);
          const url = await getLogoUrlCached(logoKey);
          if (!cancelled) setLogoUrl(url || null);
        } else {
          setLogoUrl(null);
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных клуба:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLogoLoading(false);
        }
      }
    };

    fetchClub();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="container" style={{ marginTop: '2rem' }}><h2>Загрузка...</h2></div>;
  if (!club) return <div className="container" style={{ marginTop: '2rem' }}><h2>Клуб не найден</h2></div>;

  return (
    <div className="container" style={{ marginTop: '2.5rem', paddingBottom: '5rem' }}>
      <Link to="/clubs" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem' }}>
        ← К списку клубов
      </Link>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{
          width: 280, height: 280, borderRadius: 18, overflow: "hidden",
          border: "1px solid var(--border)", display: "flex",
          alignItems: "center", justifyContent: "center", background: "var(--bg-input)"
        }}>
          {logoLoading ? (
            <span>Загрузка...</span>
          ) : logoUrl ? (
            <img src={logoUrl} alt={club.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: '4rem' }}>⚽</span>
          )}
        </div>

        <div style={{ flex: '1', minWidth: '300px' }}>
          <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{club.name}</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>📍 {club.city} | {club.category}</p>
          <div className="auth-card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
            <h4>Описание</h4>
            <p>{club.description || 'Описание отсутствует'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}