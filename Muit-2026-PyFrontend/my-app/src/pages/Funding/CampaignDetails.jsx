// import { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { fundingApi } from '../../api/funding';

// export default function CampaignDetails() {
//   const { id } = useParams();
//   const [campaign, setCampaign] = useState(null);
//   const [amount, setAmount] = useState('');
//   const [type, setType] = useState('donation');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchDetails = async () => {
//       const data = await fundingApi.getCampaignById(id); // GET /funding/campaigns/{id}/
//       setCampaign(data);
//     };
//     fetchDetails();
//   }, [id]);

//   const handleInvest = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       // Отправляем запрос согласно спецификации InvestmentCreate
//       await fundingApi.createInvestment({
//         campaign_id: parseInt(id),
//         amount: parseFloat(amount),
//         type: type
//       });
//       alert('Инвестиция создана! Перенаправляем на оплату...');
//       // В реальном проекте тут был бы переход на /payments/initiate
//     } catch (err) {
//       alert('Ошибка: ' + err.response?.data?.detail);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!campaign) return <div>Загрузка...</div>;

//   return (
//     <div className="container" style={{ marginTop: '2rem' }}>
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
//         {/* Описание кампании */}
//         <section>
//           <h1 style={{ color: 'var(--primary)' }}>{campaign.title}</h1>
//           <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{campaign.description}</p>
//         </section>

//         {/* Виджет оплаты */}
//         <aside className="auth-card" style={{ height: 'fit-content' }}>
//           <h3>Поддержать проект</h3>
//           <form onSubmit={handleInvest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//             <div>
//               <label>Сумма (₸)</label>
//               <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="100" />
//             </div>
//             <div>
//               <label>Тип поддержки</label>
//               <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: '10px' }}>
//                 <option value="donation">Пожертвование</option>
//                 <option value="investment">Инвестиция</option>
//                 <option value="sponsorship">Спонсорство</option>
//               </select>
//             </div>
//             <button className="btn-primary" disabled={loading}>
//               {loading ? 'Обработка...' : 'Поддержать'}
//             </button>
//           </form>
//         </aside>
//       </div>
//     </div>
//   );
// }
// import { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { fundingApi } from '../../api/funding'; // Проверь путь к api
// import { useAuthStore } from '../../store/useAuthStore';
// import './Funding.css'; 

// export default function CampaignDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { isAuthenticated } = useAuthStore();
  
//   const [campaign, setCampaign] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [amount, setAmount] = useState('');
//   const [type, setType] = useState('donation');

//   useEffect(() => {
//     const fetchCampaign = async () => {
//       try {
//         setLoading(true);
//         // Твой метод из funding.js возвращает список. Ищем нужный ID.
//         const data = await fundingApi.getCampaigns();
//         const list = Array.isArray(data) ? data : (data.items || []);
//         const found = list.find(c => String(c.id) === String(id));
//         setCampaign(found);
//       } catch (err) {
//         console.error("Ошибка загрузки:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCampaign();
//   }, [id]);

//   const handleSupport = async (e) => {
//     e.preventDefault();
//     if (!isAuthenticated) return navigate('/login');

//     try {
//       // Используем твой метод createInvestment
//       await fundingApi.createInvestment({
//         campaign_id: parseInt(id),
//         amount: parseFloat(amount),
//         type: type
//       });
//       alert('Успешно! Спасибо за поддержку.');
//       navigate('/funding');
//     } catch (err) {
//       alert('Ошибка: ' + (err.response?.data?.detail || 'Не удалось отправить'));
//     }
//   };

//   if (loading) return <div className="container"><h2>Загрузка...</h2></div>;
//   if (!campaign) return <div className="container"><h2>Кампания не найдена</h2></div>;

//   return (
//     <div className="container">
//       <div className="arena-card" style={{ marginTop: '2rem', padding: '30px' }}>
//         <h1 style={{ color: 'var(--accent)' }}>{campaign.title}</h1>
//         <p style={{ color: '#fff', fontSize: '1.1rem' }}>{campaign.description}</p>
        
//         <div style={{ background: '#333', height: '10px', borderRadius: '5px', margin: '20px 0' }}>
//           <div style={{ 
//             width: `${Math.min((campaign.current_amount / campaign.goal_amount) * 100, 100)}%`, 
//             height: '100%', 
//             background: 'var(--accent)',
//             boxShadow: '0 0 10px var(--accent)'
//           }}></div>
//         </div>

//         <div className="battle-form-container" style={{ maxWidth: '400px', marginTop: '30px' }}>
//           <h3>Поддержать</h3>
//           <form onSubmit={handleSupport} className="battle-form">
//             <div className="input-group">
//               <label>Сумма (₸)</label>
//               <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
//             </div>
//             <div className="input-group">
//               <label>Тип</label>
//               <select className="battle-select-dark" value={type} onChange={e => setType(e.target.value)}>
//                 <option value="donation" className="opt-dark">Донат</option>
//                 <option value="investment" className="opt-dark">Инвестиция</option>
//               </select>
//             </div>
//             <button type="submit" className="neon-btn">Отправить</button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { fundingApi } from "../../api/funding";
// import { useAuthStore } from "../../store/useAuthStore";

// export default function CampaignDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { isAuthenticated } = useAuthStore();

//   const [campaign, setCampaign] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [amount, setAmount] = useState("");
//   const [type, setType] = useState("donation");

//   useEffect(() => {
//     const fetchCampaign = async () => {
//       try {
//         setLoading(true);

//         // Если у тебя есть getCampaignById — лучше так. Если нет, fallback на getCampaigns.
//         if (typeof fundingApi.getCampaignById === "function") {
//           const data = await fundingApi.getCampaignById(id);
//           setCampaign(data);
//           return;
//         }

//         const data = await fundingApi.getCampaigns();
//         const list = Array.isArray(data) ? data : data?.items || [];
//         const found = list.find((c) => String(c.id) === String(id));
//         setCampaign(found || null);
//       } catch (err) {
//         console.error("Ошибка загрузки:", err);
//         setCampaign(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCampaign();
//   }, [id]);

//   // const handleSupport = async (e) => {
//   //   e.preventDefault();
//   //   if (!isAuthenticated) {
//   //     navigate("/login");
//   //     return;
//   //   }

//   //   const parsed = Number(amount);
//   //   if (!Number.isFinite(parsed) || parsed <= 0) {
//   //     alert("Введите корректную сумму");
//   //     return;
//   //   }

//   //   try {
//   //     await fundingApi.createInvestment({
//   //       campaign_id: parseInt(id, 10),
//   //       amount: parsed,
//   //       type,
//   //     });

//   //     alert("Успешно! Спасибо за поддержку.");
//   //     navigate("/funding");
//   //   } catch (err) {
//   //     alert("Ошибка: " + (err.response?.data?.detail || "Не удалось отправить"));
//   //   }
//   // };


//   const handleSupport = async (e) => {
//     e.preventDefault();
//     if (!isAuthenticated) {
//       navigate("/login");
//       return;
//     }

//     const parsed = Number(amount);
//     if (!Number.isFinite(parsed) || parsed <= 0) {
//       alert("Введите корректную сумму");
//       return;
//     }

//     try {
//       // 1. Создаем инвестицию (POST /funding/investments/)
//       // Ожидаем, что бэк вернет объект с id инвестиции
//       const investment = await fundingApi.createInvestment({
//         campaign_id: parseInt(id, 10),
//         amount: parsed,
//         type,
//       });

//       // 2. Инициируем платеж (POST /payments/initiate)
//       // Передаем полученный investment_id и провайдера по умолчанию
//       const payment = await fundingApi.initiatePayment({
//         investment_id: investment.id,
//         provider: "paybox", 
//       });

//       // 3. Перенаправляем на внешнюю страницу оплаты
//       if (payment?.checkout_url) {
//         window.location.href = payment.checkout_url;
//       } else {
//         throw new Error("Ссылка на оплату не получена");
//       }

//     } catch (err) {
//       // Выводим детализацию ошибки от FastAPI (422 или бизнес-логика)
//       const errorDetail = err.response?.data?.detail;
//       const errorMessage = typeof errorDetail === 'string' 
//         ? errorDetail 
//         : JSON.stringify(errorDetail) || "Не удалось инициировать платеж";
      
//       alert("Ошибка: " + errorMessage);
//     }
//   };

//   if (loading) return <div className="container"><h2>Загрузка...</h2></div>;
//   if (!campaign) return <div className="container"><h2>Кампания не найдена</h2></div>;

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
//   const percent = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

//   return (
//     <div className="container">
//       <div
//         className="auth-card"
//         style={{ marginTop: "2rem", padding: "30px" }}
//       >
//         <h1 style={{ color: "var(--primary)" }}>{campaign.title}</h1>
//         <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", lineHeight: 1.6 }}>
//           {campaign.description}
//         </p>

//         {/* Progress bar */}
//         <div
//           style={{
//             background: "var(--border, rgba(255,255,255,0.12))",
//             height: 10,
//             borderRadius: 6,
//             margin: "20px 0 10px",
//             overflow: "hidden",
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

//         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
//           <span style={{ color: "var(--text-muted)" }}>{Math.round(percent)}% собрано</span>
//           <span style={{ color: "var(--text-muted)" }}>
//             <b style={{ color: "var(--primary)" }}>
//               {Number.isFinite(current) ? current.toLocaleString() : "0"}
//             </b>{" "}
//             / {goal > 0 ? goal.toLocaleString() : "—"} ₸
//           </span>
//         </div>

//         {/* Support form */}
//         <div style={{ maxWidth: 420, marginTop: 10 }}>
//           <h3 style={{ marginTop: 0 }}>Поддержать</h3>

//           <form onSubmit={handleSupport} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//             <div>
//               <label>Сумма (₸)</label>
//               <input
//                 type="number"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 required
//                 min="1"
//               />
//             </div>

//             <div>
//               <label>Тип</label>
//               <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: "100%", padding: 10 }}>
//                 <option value="donation">Донат</option>
//                 <option value="investment">Инвестиция</option>
//                 <option value="sponsorship">Спонсорство</option>
//               </select>
//             </div>

//             <button type="submit" className="btn-primary">
//               Отправить
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
// import { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { fundingApi } from '../../api/funding';
// import { useAuthStore } from '../../store/useAuthStore';

// export default function CampaignDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { isAuthenticated } = useAuthStore();
  
//   const [campaign, setCampaign] = useState(null);
//   const [amount, setAmount] = useState('');
//   const [coverUrl, setCoverUrl] = useState(null);
//   const [type, setType] = useState('donation');
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);

//   const loadData = async () => {
//     try {
//       const data = await fundingApi.getCampaignById(id);
//       setCampaign(data);
//     } catch (err) {
//       console.error("Ошибка загрузки:", err);
//     } finally {
//       setFetching(false);
//     }
//   };

//   // useEffect(() => {
//   //   loadData();
//   // }, [id]);
//   useEffect(() => {
//     const fetchCampaign = async () => {
//       try {
//         const data = await fundingApi.getCampaignById(id);
//         setCampaign(data);
        
//         // Загружаем картинку, если есть ключ
//         if (data.cover_key) {
//           const url = await getLogoUrlCached(data.cover_key);
//           setCoverUrl(url);
//         }
//       } catch (err) {
//         console.error("Ошибка загрузки:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCampaign();
//   }, [id]);

//   const handleSupport = async (e) => {
//     e.preventDefault();

//     if (!isAuthenticated) {
//       alert("Необходимо войти в систему");
//       navigate("/login");
//       return;
//     }

//     const numAmount = parseFloat(amount);
//     if (isNaN(numAmount) || numAmount <= 0) {
//       alert("Введите корректную сумму");
//       return;
//     }

//     setLoading(true);
//     try {
//       // ШАГ 1: Создаем запись об инвестиции
//       const investment = await fundingApi.createInvestment({
//         campaign_id: id,
//         amount: numAmount,
//         type: type
//       });

//       // ШАГ 2: Инициируем платеж в системе
//       const paymentInfo = await fundingApi.initiatePayment({
//         investment_id: investment.id,
//         provider: "paybox"
//       });

//       // --- ВРЕМЕННОЕ РЕШЕНИЕ (СИМУЛЯЦИЯ) ---
//       // Вместо редиректа на Paybox, сразу подтверждаем оплату
//       console.log("Симуляция оплаты для платежа:", paymentInfo.id);
//       await fundingApi.simulatePaymentWebhook(paymentInfo.provider_payment_id);
      
//       alert("Оплата успешно симулирована! Статус обновлен.");
      
//       // Обновляем данные на странице, чтобы увидеть прогресс-бар
//       await loadData();
//       setAmount(''); // сбрасываем ввод

//     } catch (err) {
//       console.error("Ошибка процесса:", err);
//       const errorMsg = err.response?.data?.detail;
//       alert(`Ошибка: ${typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : (errorMsg || "Сервер недоступен")}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (fetching) return <div className="container">Загрузка...</div>;
//   if (!campaign) return <div className="container">Кампания не найдена</div>;

//   const current = campaign.current_amount || 0;
//   const goal = campaign.goal_amount || 0;
//   const percent = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

//   return (
//     <div className="container" style={{ marginTop: '2.5rem', paddingBottom: '5rem' }}>
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '50px' }}>
        
//         {/* Описание проекта */}
//         <div>
//           <h1 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: 800 }}>{campaign.title}</h1>
//           <div style={{ 
//             width: '100%', height: '450px', backgroundColor: 'var(--bg-card)', 
//             borderRadius: '24px', overflow: 'hidden', marginBottom: '2rem',
//             border: '1px solid rgba(255,255,255,0.1)',
//             boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
//           }}>
//             {campaign.cover_key ? (
//               <img src={campaign.cover_key} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//             ) : (
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
//                 Нет обложки
//               </div>
//             )}
//           </div>
//           <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '20px' }}>
//             <h3 style={{ marginBottom: '15px' }}>О кампании</h3>
//             <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#8a8a8a', whiteSpace: 'pre-wrap' }}>
//               {campaign.description}
//             </p>
//           </div>
//         </div>

//         {/* Виджет оплаты */}
//         <div className="funding-card" style={{ height: 'fit-content', position: 'sticky', top: '30px', padding: '30px' }}>
//           <div style={{ marginBottom: '25px' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
//               <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{Math.round(percent)}% собрано</span>
//               <span style={{ color: '#525252' }}>{current.toLocaleString()} / {goal.toLocaleString()} ₸</span>
//             </div>
//             <div style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
//               <div style={{ width: `${percent}%`, height: '100%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }} />
//             </div>
//           </div>

//           <form onSubmit={handleSupport}>
//             <div style={{ marginBottom: '20px' }}>
//               <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Сумма поддержки (₸)</label>
//               <input 
//                 type="number" 
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 required 
//                 placeholder="Введите сумму..."
//                 style={{ 
//                   width: '100%', padding: '15px', borderRadius: '12px', 
//                   border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', 
//                   color: '#fff', fontSize: '1.1rem' 
//                 }}
//               />
//             </div>

//             <div style={{ marginBottom: '30px' }}>
//               <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Тип участия</label>
//               <select 
//                 value={type}
//                 onChange={(e) => setType(e.target.value)}
//                 style={{ 
//                   width: '100%', padding: '15px', borderRadius: '12px', 
//                   border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', 
//                   color: '#fff'
//                 }}
//               >
//                 <option value="donation">Донат</option>
//                 <option value="investment">Инвестиция</option>
//                 <option value="sponsorship">Спонсорство</option>
//               </select>
//             </div>

//             <button 
//               type="submit" 
//               className="neon-btn" 
//               disabled={loading} 
//               style={{ width: '100%', padding: '18px', fontSize: '1rem' }}
//             >
//               {loading ? 'Обработка...' : 'Поддержать (Simulate)'}
//             </button>
//           </form>

//           <div style={{ marginTop: '20px', textAlign: 'center' }}>
//             <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
//               Режим разработки: оплата подтверждается автоматически
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fundingApi } from '../../api/funding';
import { useAuthStore } from '../../store/useAuthStore';
import { getLogoUrlCached } from '../../api/logoUrlCache';

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [campaign, setCampaign] = useState(null);
  const [amount, setAmount] = useState('');
  const [coverUrl, setCoverUrl] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);

  const [type, setType] = useState('donation');
  const [loading, setLoading] = useState(false);     // для оплаты
  const [fetching, setFetching] = useState(true);    // для загрузки страницы

  const loadData = async () => {
    try {
      const data = await fundingApi.getCampaignById(id);
      setCampaign(data);

      const coverKey = data?.cover_key;
      if (coverKey && coverKey !== "string") {
        setImgLoading(true);
        const url = await getLogoUrlCached(coverKey);
        setCoverUrl(url || null);
      } else {
        setCoverUrl(null);
      }
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    } finally {
      setFetching(false);
      setImgLoading(false);
    }
  };

  useEffect(() => {
    setFetching(true);
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSupport = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert("Необходимо войти в систему");
      navigate("/login");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Введите корректную сумму");
      return;
    }

    setLoading(true);
    try {
      const investment = await fundingApi.createInvestment({
        campaign_id: id,
        amount: numAmount,
        type: type
      });

      const paymentInfo = await fundingApi.initiatePayment({
        investment_id: investment.id,
        provider: "paybox"
      });

      console.log("Симуляция оплаты для платежа:", paymentInfo.id);
      await fundingApi.simulatePaymentWebhook(paymentInfo.provider_payment_id);

      alert("Оплата успешно симулирована! Статус обновлен.");

      await loadData();
      setAmount('');
    } catch (err) {
      console.error("Ошибка процесса:", err);
      const errorMsg = err.response?.data?.detail;
      alert(`Ошибка: ${typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : (errorMsg || "Сервер недоступен")}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="container">Загрузка...</div>;
  if (!campaign) return <div className="container">Кампания не найдена</div>;

  const current = campaign.current_amount || 0;
  const goal = campaign.goal_amount || 0;
  const percent = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

  return (
    <div className="container" style={{ marginTop: '2.5rem', paddingBottom: '5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '50px' }}>

        <div>
          <h1 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: 800 }}>{campaign.title}</h1>

          <div style={{
            width: '100%',
            height: '450px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '24px',
            overflow: 'hidden',
            marginBottom: '2rem',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            {imgLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Загрузка...
              </div>
            ) : coverUrl ? (
              <img src={coverUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Нет обложки
              </div>
            )}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>О кампании</h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#8a8a8a', whiteSpace: 'pre-wrap' }}>
              {campaign.description}
            </p>
          </div>
        </div>

        <div className="funding-card" style={{ height: 'fit-content', position: 'sticky', top: '30px', padding: '30px' }}>
          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{Math.round(percent)}% собрано</span>
              <span style={{ color: '#525252' }}>{current.toLocaleString()} / {goal.toLocaleString()} ₸</span>
            </div>
            <div style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${percent}%`, height: '100%', background: 'var(--primary)' }} />
            </div>
          </div>

          <form onSubmit={handleSupport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Сумма</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Например: 1000"
              style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text)' }}
            />

            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Тип</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text)' }}
            >
              <option value="donation">Донат</option>
              <option value="investment">Инвестиция</option>
              <option value="sponsorship">Спонсорство</option>
            </select>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Обработка..." : "Поддержать"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}