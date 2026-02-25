// export default function ClubCard({ club }) {
//   return (
//     <div className="auth-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//       {/* Логотип или заглушка */}
//       <div style={{ 
//         width: '100%', height: '150px', backgroundColor: 'var(--accent-soft)', 
//         borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
//       }}>
//         {club.logo_key ? <img src={club.logo_key} alt="logo" /> : <span style={{color: 'var(--accent)'}}>No Logo</span>}
//       </div>

//       <h3 style={{ color: 'var(--primary)' }}>{club.name}</h3>
//       <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>📍 {club.city} | {club.category}</p>
//       <p style={{ fontSize: '0.85rem', flexGrow: 1 }}>{club.description?.substring(0, 100)}...</p>
      
//       <button className="btn-primary" style={{ padding: '8px' }}>Подробнее</button>
//     </div>
//   );
// }

// src/components/ClubCard.jsx
// src/components/ClubCard.jsx
// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { getLogoUrlCached } from "../api/logoUrlCache"; // Проверьте правильность пути

// export default function ClubCard({ club }) {
//   const [logoUrl, setLogoUrl] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const clubId = club.id || club._id;

//   useEffect(() => {
//     async function loadLogo() {
//       if (!club.logo_key || club.logo_key === "string") return; // Игнорируем заглушки бэкенда
//       try {
//         setLoading(true);
//         const url = await getLogoUrlCached(club.logo_key); // Превращаем ключ в ссылку
//         setLogoUrl(url);
//       } catch (err) {
//         console.error("Ошибка загрузки лого:", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadLogo();
//   }, [club.logo_key]);

//   return (
//     <div className="auth-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//       <div style={{ 
//         width: '100%', height: '150px', backgroundColor: 'var(--accent-soft)', 
//         borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center',
//         overflow: 'hidden'
//       }}>
//         {loading ? (
//           <span>...</span>
//         ) : logoUrl ? (
//           <img src={logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//         ) : (
//           <span style={{color: 'var(--accent)'}}>⚽ No Logo</span>
//         )}
//       </div>

//       <h3 style={{ color: 'var(--primary)', margin: '10px 0 0 0' }}>{club.name}</h3>
//       <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>📍 {club.city} | {club.category}</p>
      
//       <Link to={`/clubs/${clubId}`} className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none', padding: '10px' }}>
//         Подробнее
//       </Link>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { clubsApi } from "../api/clubs";
import { getLogoUrlCached } from "../api/logoUrlCache";

export default function ClubCard({ club }) {
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const clubId = club.id || club._id;

  useEffect(() => {
    let cancelled = false;

    async function loadLogo() {
      if (!clubId) return;

      try {
        setLoading(true);

        // 1) Берем logo_key ТОЛЬКО из /clubs/{id} (строго как ты сказал)
        const full = await clubsApi.getClubById(clubId);
        const logoKey = full?.logo_key;

        if (!logoKey || logoKey === "string") {
          if (!cancelled) setLogoUrl(null);
          return;
        }

        // 2) Получаем url через /media/public-url
        const url = await getLogoUrlCached(logoKey);

        if (!cancelled) setLogoUrl(url || null);
      } catch (err) {
        console.error("Ошибка загрузки лого:", err);
        if (!cancelled) setLogoUrl(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLogo();
    return () => { cancelled = true; };
  }, [clubId]);

  return (
    <div className="auth-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{
        width: '100%', height: '150px', backgroundColor: 'var(--accent-soft)',
        borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {loading ? (
          <span>...</span>
        ) : logoUrl ? (
          <img src={logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: 'var(--accent)' }}>⚽ No Logo</span>
        )}
      </div>

      <h3 style={{ color: 'var(--primary)', margin: '10px 0 0 0' }}>{club.name}</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>📍 {club.city} | {club.category}</p>

      <Link
        to={`/clubs/${clubId}`}
        className="btn-primary"
        style={{ textAlign: 'center', textDecoration: 'none', padding: '10px' }}
      >
        Подробнее
      </Link>
    </div>
  );
}