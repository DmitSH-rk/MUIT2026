// import { Link } from "react-router-dom";

// export default function CampaignCard({ campaign }) {
//   // Расчет прогресса в процентах
//   const progress = Math.min(
//     Math.round((campaign.current_amount / campaign.goal_amount) * 100), 
//     100
//   );

//     const id = campaign?.id ?? campaign?._id;

//   return (
//     <div className="auth-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//       <div style={{ 
//         width: '100%', height: '180px', backgroundColor: 'var(--accent-soft)', 
//         borderRadius: 'var(--radius)', overflow: 'hidden' 
//       }}>
//         {campaign.cover_key ? (
//           <img src={campaign.cover_key} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//         ) : (
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--accent)' }}>
//             Funding Campaign
//           </div>
//         )}
//       </div>

//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//         <h3 style={{ color: 'var(--primary)', margin: 0 }}>{campaign.title}</h3>
//         <span style={{ 
//           fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', 
//           backgroundColor: campaign.status === 'active' ? '#E1F7E5' : 'var(--border)',
//           color: campaign.status === 'active' ? '#2D7A43' : 'var(--text-muted)'
//         }}>
//           {campaign.status}
//         </span>
//       </div>

//       <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', height: '3em', overflow: 'hidden' }}>
//         {campaign.description}
//       </p>

//       {/* Прогресс-бар */}
//       <div style={{ marginTop: '10px' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
//           <span>{campaign.current_amount} ₸</span>
//           <span style={{ fontWeight: 'bold' }}>{progress}%</span>
//         </div>
//         <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px' }}>
//           <div style={{ 
//             width: `${progress}%`, height: '100%', 
//             backgroundColor: 'var(--primary)', borderRadius: '4px',
//             transition: 'width 0.5s ease-out' 
//           }} />
//         </div>
//         <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '5px' }}>
//           Цель: {campaign.goal_amount} ₸
//         </div>
//       </div>

//       <Link
//         to={`/funding/${id}`}
//         className="btn-primary"   // или твой класс кнопки
//         style={{ textDecoration: "none" }}
//       >
//         Поддержать
//       </Link>
//     </div>
//   );
// }


// export default function CampaignCard({ campaign }) {
//   const id =
//     campaign?.id ??
//     campaign?._id ??
//     campaign?.campaign_id; // на всякий случай

//   // Делаем вычисление максимально устойчивым к разным названиям полей и типам (string/number)
//   const current = Number(
//     campaign?.current_amount ??
//       campaign?.collected_amount ??
//       campaign?.raised_amount ??
//       0
//   );

//   const goal = Number(
//     campaign?.goal_amount ??
//       campaign?.target_amount ??
//       campaign?.amount_goal ??
//       0
//   );

//   const percent =
//     goal > 0 ? Math.min(Math.round((current / goal) * 100), 100) : 0;

//   // Если вдруг id нет — покажем карточку без ссылки, чтобы не уводило на /funding/undefined
//   const SupportButton = id ? (
//     <Link
//       to={`/funding/${id}`}
//       className="btn-primary"
//       style={{ textDecoration: "none", flex: 1, textAlign: "center" }}
//     >
//       Поддержать
//     </Link>
//   ) : (
//     <button
//       type="button"
//       className="btn-primary"
//       disabled
//       style={{ flex: 1, opacity: 0.6 }}
//       title="Нет id у кампании (проверь ответ API)"
//     >
//       Поддержать
//     </button>
//   );

//   return (
//     <article
//       style={{
//         backgroundColor: "var(--surface)",
//         borderRadius: "var(--radius)",
//         padding: "1.5rem",
//         border: "1px solid var(--border)",
//         display: "flex",
//         flexDirection: "column",
//         gap: "0.9rem",
//         minHeight: 260,
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           gap: "1rem",
//         }}
//       >
//         <h3 style={{ margin: 0, color: "var(--primary)", fontSize: "1.15rem" }}>
//           {campaign?.title ?? "Без названия"}
//         </h3>

//         <span
//           style={{
//             fontSize: "0.75rem",
//             padding: "0.25rem 0.6rem",
//             borderRadius: 999,
//             background: "var(--surface-2, rgba(0,0,0,0.08))",
//             color: "var(--text-muted)",
//             whiteSpace: "nowrap",
//           }}
//         >
//           {campaign?.type === "investment" ? "Инвестиции" : "Сбор"}
//         </span>
//       </div>

//       <p
//         style={{
//           margin: 0,
//           color: "var(--text-muted)",
//           lineHeight: 1.5,
//           display: "-webkit-box",
//           WebkitLineClamp: 3,
//           WebkitBoxOrient: "vertical",
//           overflow: "hidden",
//         }}
//       >
//         {campaign?.description ?? ""}
//       </p>

//       {/* Progress bar */}
//       <div style={{ marginTop: "0.2rem" }}>
//         <div
//           style={{
//             height: 10,
//             borderRadius: 6,
//             overflow: "hidden",
//             background: "var(--border, rgba(255,255,255,0.12))",
//           }}
//         >
//           <div
//             style={{
//               width: `${percent}%`,
//               height: "100%",
//               background: "var(--primary)",
//               transition: "width 300ms ease",
//             }}
//           />
//         </div>

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             fontSize: "0.9rem",
//             marginTop: "0.45rem",
//             gap: "1rem",
//           }}
//         >
//           <span style={{ color: "var(--text-muted)" }}>{percent}% собрано</span>
//           <span style={{ color: "var(--text-muted)", textAlign: "right" }}>
//             <span style={{ color: "var(--primary)", fontWeight: 700 }}>
//               {Number.isFinite(current) ? current.toLocaleString() : "0"}
//             </span>
//             {" / "}
//             {goal > 0 ? goal.toLocaleString() : "—"} ₸
//           </span>
//         </div>
//       </div>

//       <div style={{ marginTop: "auto", display: "flex", gap: "0.75rem" }}>
//         {SupportButton}
//       </div>
//     </article>
//   );
// }

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fundingApi } from "../api/funding";
import { getLogoUrlCached } from "../api/logoUrlCache";

export default function CampaignCard({ campaign }) {
  const [coverUrl, setCoverUrl] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);

  const id = campaign?.id ?? campaign?._id;

  const progress = Math.min(
    Math.round(((campaign?.current_amount ?? 0) / (campaign?.goal_amount ?? 1)) * 100),
    100
  );

  useEffect(() => {
    let cancelled = false;

    async function loadCover() {
      if (!id) return;

      try {
        setImgLoading(true);

        // 1) Берём cover_key строго из /funding/campaigns/{id}
        const full = await fundingApi.getCampaignById(id);
        const coverKey = full?.cover_key;

        if (!coverKey || coverKey === "string") {
          if (!cancelled) setCoverUrl(null);
          return;
        }

        // 2) По cover_key берём реальный URL через /media/public-url
        const url = await getLogoUrlCached(coverKey);
        if (!cancelled) setCoverUrl(url || null);
      } catch (e) {
        console.error("Ошибка загрузки обложки кампании:", e);
        if (!cancelled) setCoverUrl(null);
      } finally {
        if (!cancelled) setImgLoading(false);
      }
    }

    loadCover();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="auth-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div
        style={{
          width: "100%",
          height: "180px",
          backgroundColor: "var(--accent-soft)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {imgLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <span>Загрузка...</span>
          </div>
        ) : coverUrl ? (
          <img src={coverUrl} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--accent)",
            }}
          >
            Funding Campaign
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 style={{ color: "var(--primary)", margin: 0 }}>{campaign?.title}</h3>
      </div>

      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", height: "3em", overflow: "hidden" }}>
        {campaign?.description}
      </p>

      <div style={{ marginTop: "10px" }}>
        <div style={{ width: "100%", height: "8px", backgroundColor: "var(--border)", borderRadius: "4px" }}>
          <div style={{ width: `${progress}%`, height: "100%", backgroundColor: "var(--primary)", borderRadius: "4px" }} />
        </div>
      </div>

      <Link
        to={`/funding/${id}`}
        className="btn-primary"
        style={{ textDecoration: "none", textAlign: "center", marginTop: "10px" }}
      >
        Подробнее
      </Link>
    </div>
  );
}