// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { fundingApi } from '../../api/funding';
// import { useAuthStore } from '../../store/useAuthStore';

// export default function CreateCampaign() {
//   const { role } = useAuthStore();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     goal_amount: '',
//     starts_at: '',
//     ends_at: '',
//     cover_key: ''
//   });

//   // Проверка прав доступа "на лету"
//   if (role !== 'club') {
//     return (
//       <div className="container" style={{ marginTop: '50px', textAlign: 'center' }}>
//         <h2 style={{ color: 'var(--support)' }}>Доступ ограничен</h2>
//         <p>Только футбольные клубы могут инициировать сборы средств.</p>
//       </div>
//     );
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       // Согласно API, отправляем объект CampaignCreate
//       await fundingApi.createCampaign({
//         ...formData,
//         goal_amount: parseFloat(formData.goal_amount) // Конвертируем строку в Decimal/Float
//       });
      
//       alert('Кампания успешно создана!');
//       navigate('/funding');
//     } catch (err) {
//       setError(err.response?.data?.detail || 'Ошибка при создании кампании');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container" style={{ maxWidth: '600px', marginTop: '2rem' }}>
//       <div className="auth-card">
//         <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Новый сбор средств</h2>
        
//         <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
//           <div>
//             <label>Название кампании</label>
//             <input 
//               type="text" 
//               required 
//               maxLength={200}
//               value={formData.title}
//               onChange={(e) => setFormData({...formData, title: e.target.value})}
//               placeholder="Например: Сбор на новую форму для юниоров"
//             />
//           </div>

//           <div>
//             <label>Описание</label>
//             <textarea 
//               required 
//               rows="4"
//               value={formData.description}
//               onChange={(e) => setFormData({...formData, description: e.target.value})}
//               style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
//             />
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
//             <div>
//               <label>Цель (₸)</label>
//               <input 
//                 type="number" 
//                 required 
//                 min="1"
//                 value={formData.goal_amount}
//                 onChange={(e) => setFormData({...formData, goal_amount: e.target.value})}
//               />
//             </div>
//             <div>
//               <label>Ссылка на обложку</label>
//               <input 
//                 type="text" 
//                 value={formData.cover_key}
//                 onChange={(e) => setFormData({...formData, cover_key: e.target.value})}
//                 placeholder="URL картинки"
//               />
//             </div>
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
//             <div>
//               <label>Дата начала</label>
//               <input 
//                 type="datetime-local" 
//                 required
//                 value={formData.starts_at}
//                 onChange={(e) => setFormData({...formData, starts_at: e.target.value})}
//               />
//             </div>
//             <div>
//               <label>Дата окончания</label>
//               <input 
//                 type="datetime-local" 
//                 required
//                 value={formData.ends_at}
//                 onChange={(e) => setFormData({...formData, ends_at: e.target.value})}
//               />
//             </div>
//           </div>

//           {error && <p style={{ color: 'var(--support)' }}>{error}</p>}

//           <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '15px' }}>
//             {loading ? 'Публикация...' : 'Запустить кампанию'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fundingApi } from '../../api/funding';
import { useAuthStore } from '../../store/useAuthStore';

export default function CreateCampaign() {
  const { role } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_amount: '',
    starts_at: '',
    ends_at: '',
  });

  // чтобы браузер не пытался “открыть” drop
  useEffect(() => {
    const prevent = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);
    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
    };
  }, []);

  if (role !== 'club') {
    return (
      <div className="container" style={{ marginTop: '50px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--support)' }}>Доступ ограничен</h2>
        <p>Только футбольные клубы могут инициировать сборы средств.</p>
      </div>
    );
  }

  const handleFileLocal = (file) => {
    if (!file) return;

    if (!file.type || !file.type.startsWith('image/')) {
      setError("Пожалуйста, выберите изображение");
      return;
    }

    setError(null);
    setCoverFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const hasFilesInDrag = (e) => {
    const types = e.dataTransfer?.types;
    if (!types) return false;
    return Array.from(types).includes('Files');
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasFilesInDrag(e)) return;
    dragCounter.current += 1;
    setIsDragging(true);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasFilesInDrag(e)) {
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
      return;
    }
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasFilesInDrag(e)) return;

    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
    dragCounter.current = 0;

    if (!hasFilesInDrag(e)) return;

    const dt = e.dataTransfer;
    let file = null;

    if (dt?.items && dt.items.length) {
      for (const item of dt.items) {
        if (item.kind === 'file') {
          file = item.getAsFile();
          break;
        }
      }
    }
    if (!file && dt?.files && dt.files.length) file = dt.files[0];

    handleFileLocal(file);
  };

  const onPickFile = () => fileInputRef.current?.click();

  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileLocal(file);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!coverFile) {
      setError("Необходимо выбрать обложку кампании");
      return;
    }

    setSubmitting(true);

    try {
      // 1) Создаём кампанию БЕЗ cover_key (сервер сам привяжет cover после)
      const created = await fundingApi.createCampaign({
        ...formData,
        goal_amount: parseFloat(formData.goal_amount),
      });

      const campaignId = created?.id;
      if (!campaignId) {
        throw new Error("createCampaign не вернул id кампании");
      }

      // 2) Загружаем обложку через правильный эндпоинт
      await fundingApi.uploadCampaignCover(campaignId, coverFile);

      alert('Кампания успешно создана!');
      navigate('/funding');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message || 'Ошибка при публикации кампании';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '2rem', marginBottom: '4rem' }}>
      <div className="auth-card">
        <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Новый сбор средств</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="input-group">
            <label>Обложка кампании</label>

            <div
              onDragEnter={onDragEnter}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={onPickFile}
              style={{
                width: '100%',
                height: '200px',
                border: isDragging ? '2px dashed var(--primary)' : '2px dashed var(--border)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                background: isDragging ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--bg-input)',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={onInputChange}
              />

              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🖼️</span>
                  <p>Перетащите изображение или кликните</p>
                  <small>Рекомендуемый формат: 16:9</small>
                </div>
              )}

              {submitting && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(70, 70, 70, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span>Публикация...</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label>Название кампании</label>
            <input
              type="text"
              required
              maxLength={200}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Например: Сбор на новую форму"
            />
          </div>

          <div>
            <label>Описание</label>
            <textarea
              required
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--bg-input)',
                color: 'white'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Цель (₸)</label>
              <input
                type="number"
                required
                min="1"
                value={formData.goal_amount}
                onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: coverFile ? 'var(--primary)' : 'var(--text-muted)',
                  marginBottom: '10px'
                }}
              >
                {coverFile ? '✅ Фото выбрано' : '❌ Нужно выбрать фото'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Дата начала</label>
              <input
                type="datetime-local"
                required
                value={formData.starts_at}
                onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
              />
            </div>

            <div>
              <label>Дата окончания</label>
              <input
                type="datetime-local"
                required
                value={formData.ends_at}
                onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
              />
            </div>
          </div>

          {error && <p style={{ color: '#ff4444', fontSize: '0.9rem' }}>{error}</p>}

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || !coverFile}
            style={{ padding: '15px', marginTop: '1rem' }}
          >
            {submitting ? 'Публикация...' : 'Запустить кампанию'}
          </button>
        </form>
      </div>
    </div>
  );
}
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { fundingApi } from '../../api/funding';
// import { useAuthStore } from '../../store/useAuthStore';

// export default function CreateCampaign() {
//   const { role } = useAuthStore();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     goal_amount: '',
//     starts_at: '',
//     ends_at: '',
//     cover_key: ''
//   });

//   // Защита роута: только для клубов
//   if (role !== 'club') {
//     return (
//       <div className="container" style={{ marginTop: '50px', textAlign: 'center' }}>
//         <h2 style={{ color: 'var(--accent)' }}>Доступ ограничен</h2>
//         <p style={{ color: 'var(--text-main)' }}>Только футбольные клубы могут инициировать сборы средств.</p>
//       </div>
//     );
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       await fundingApi.createCampaign({
//         ...formData,
//         goal_amount: parseFloat(formData.goal_amount)
//       });
      
//       alert('Сбор успешно запущен!');
//       navigate('/funding');
//     } catch (err) {
//       setError(err.response?.data?.detail || 'Ошибка при создании кампании');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container">
//       {/* Используем тот же контейнер, что и для создания баттла */}
//       <div className="battle-form-container" style={{ maxWidth: '650px', margin: '2rem auto' }}>
//         <h2 style={{ color: 'var(--accent)', textAlign: 'center', marginBottom: '2rem', textTransform: 'uppercase' }}>
//           🚀 Запустить сбор
//         </h2>
        
//         <form onSubmit={handleSubmit} className="battle-form">
//           <div className="input-group">
//             <label>Название кампании</label>
//             <input 
//               type="text" 
//               required 
//               maxLength={200}
//               value={formData.title}
//               onChange={(e) => setFormData({...formData, title: e.target.value})}
//               placeholder="Напр: Экипировка для юношеской сборной"
//             />
//           </div>

//           <div className="input-group">
//             <label>Описание и цели</label>
//             <textarea 
//               required 
//               rows="4"
//               value={formData.description}
//               onChange={(e) => setFormData({...formData, description: e.target.value})}
//               placeholder="Расскажите, на что пойдут средства..."
//             />
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
//             <div className="input-group">
//               <label>Сумма сбора (₸)</label>
//               <input 
//                 type="number" 
//                 required 
//                 min="1"
//                 value={formData.goal_amount}
//                 onChange={(e) => setFormData({...formData, goal_amount: e.target.value})}
//                 placeholder="1000000"
//               />
//             </div>
//             <div className="input-group">
//               <label>Обложка (URL)</label>
//               <input 
//                 type="text" 
//                 value={formData.cover_key}
//                 onChange={(e) => setFormData({...formData, cover_key: e.target.value})}
//                 placeholder="https://..."
//               />
//             </div>
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
//             <div className="input-group">
//               <label>Начало сбора</label>
//               <input 
//                 type="datetime-local" 
//                 required
//                 value={formData.starts_at}
//                 onChange={(e) => setFormData({...formData, starts_at: e.target.value})}
//               />
//             </div>
//             <div className="input-group">
//               <label>Окончание сбора</label>
//               <input 
//                 type="datetime-local" 
//                 required
//                 value={formData.ends_at}
//                 onChange={(e) => setFormData({...formData, ends_at: e.target.value})}
//               />
//             </div>
//           </div>

//           {error && <p style={{ color: '#ff4444', textAlign: 'center' }}>{error}</p>}

//           <button type="submit" className="neon-btn" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
//             {loading ? 'Публикация...' : 'Опубликовать сбор'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }