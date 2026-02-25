import { useEffect, useState } from 'react';
import { fundingApi } from '../../api/funding';
import CampaignCard from '../../components/CampaignCard';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fundingApi.getCampaigns(); //
        setCampaigns(data);
      } catch (err) {
        console.error("Ошибка загрузки кампаний", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0' }}>
        <div>
            <h1 style={{ color: 'var(--primary)' }}>Инвестиции и Сборы</h1>
            <p style={{ color: 'var(--text-muted)' }}>Поддержите развитие футбольных талантов</p>
        </div>
        
        {/* Кнопка видна только клубам */}
        {useAuthStore.getState().role === 'club' && (
            <Link to="/funding/create" className="btn-primary" style={{ textDecoration: 'none' }}>
            + Создать сбор
            </Link>
        )}
        </header>

      {loading ? (
        <p>Загрузка кампаний...</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '2rem',
          paddingBottom: '3rem'
        }}>
          {campaigns.map(item => (
            <CampaignCard key={item.id} campaign={item} />
          ))}
          
          {campaigns.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)' }}>
              <h3>Активных кампаний пока нет</h3>
              <p>Загляните позже или создайте свою, если вы представляете клуб.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// import { Link } from 'react-router-dom';
// import { useEffect, useMemo, useState } from 'react';
// import { fundingApi } from '../../api/funding';
// import { useAuthStore } from '../../store/useAuthStore';
// import './Funding.css';

// export default function CampaignList() {
//   const [campaigns, setCampaigns] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const role = useAuthStore((s) => s.role);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const data = await fundingApi.getCampaigns();
//         const list = Array.isArray(data)
//           ? data
//           : (data?.items || data?.results || []);
//         setCampaigns(list);
//       } catch (err) {
//         console.error("Ошибка загрузки кампаний", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadData();
//   }, []);

//   const hasCampaigns = useMemo(() => campaigns.length > 0, [campaigns.length]);

//   return (
//     <div className="container">
//       <div className="funding-header" style={{ marginTop: '2rem' }}>
//         <div>
//           <h1>Инвестиции и Сборы</h1>
//           <p style={{ color: 'var(--text-muted)', margin: '8px 0 0' }}>
//             Поддержите развитие футбольных талантов
//           </p>
//         </div>

//         {/* Кнопка видна только клубам */}
//         {role === 'club' && (
//           <Link to="/funding/create" className="btn-primary" style={{ textDecoration: 'none' }}>
//             + Создать сбор
//           </Link>
//         )}
//       </div>

//       {loading ? (
//         <p>Загрузка кампаний...</p>
//       ) : (
//         <div className="funding-grid" style={{ paddingBottom: '3rem' }}>
//           {hasCampaigns ? (
//             campaigns.map((camp) => {
//               const current = Number(camp.current_amount ?? camp.currentAmount ?? camp.collected_amount ?? 0) || 0;
//               const target = Number(
//                 camp.target_amount ??
//                   camp.goal_amount ??
//                   camp.targetAmount ??
//                   camp.goalAmount ??
//                   camp.amount_target ??
//                   1
//               ) || 1;
//               const percent = Math.min(Math.round((current / target) * 100), 100);

//               const title = camp.title ?? camp.name ?? 'Без названия';
//               const description = camp.description ?? '';
//               const type = camp.type ?? camp.kind;

//               return (
//                 <div key={camp.id} className="funding-card">
//                   <div className="card-badge">
//                     {type === 'investment' ? 'Инвестиции' : type === 'donation' ? 'Донат' : 'Сбор'}
//                   </div>

//                   <h3 className="funding-title">{title}</h3>
//                   <p className="funding-desc">{description}</p>

//                   <div className="progress-container">
//                     <div className="progress-bar" style={{ width: `${percent}%` }} />
//                   </div>

//                   <div className="funding-stats">
//                     <span>{percent}% собрано</span>
//                     <span className="amount-target">
//                       {current} / {target} ₸
//                     </span>
//                   </div>

//                   {/* ВАЖНО: именно этот Link открывает /funding/:id */}
//                   <Link to={`/funding/${camp.id}`} className="btn-outline" style={{ marginTop: '20px' }}>
//                     Смотреть детали и поддержать
//                   </Link>
//                 </div>
//               );
//             })
//           ) : (
//             <div
//               style={{
//                 gridColumn: '1/-1',
//                 textAlign: 'center',
//                 padding: '3rem',
//                 backgroundColor: 'var(--surface)',
//                 borderRadius: 'var(--radius)'
//               }}
//             >
//               <h3>Активных кампаний пока нет</h3>
//               <p>Загляните позже или создайте свою, если вы представляете клуб.</p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }