// import { useState } from 'react';
// import { clubsApi } from '../../api/clubs';
// import { useAuthStore } from '../../store/useAuthStore';

// export default function ClubSettings() {
//   const { user, setAuth } = useAuthStore();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     title: user?.username || '',
//     city: user?.city || '',
//     category: user?.category || 'amateur',
//     description: user?.description || '',
//     achievements: user?.achievements || ''
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       // Отправляем данные на бэкенд
//       const updatedClub = await clubsApi.updateClub(user.id, formData);
//       // Обновляем данные в нашем глобальном хранилище
//       setAuth(updatedClub, { access_token: localStorage.getItem('access_token') });
//       alert('Данные клуба успешно обновлены!');
//     } catch (err) {
//       alert('Ошибка при обновлении: ' + (err.response?.data?.detail || 'Error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="auth-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//       <h3>Настройки профиля клуба</h3>
      
//       <label>Город</label>
//       <input 
//         type="text" 
//         value={formData.city} 
//         onChange={(e) => setFormData({...formData, city: e.target.value})} 
//         placeholder="Например: Алматы"
//       />

//       <label>Категория</label>
//       <select 
//         value={formData.category} 
//         onChange={(e) => setFormData({...formData, category: e.target.value})}
//         style={{ padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
//       >
//         <option value="pro">Профессиональный</option>
//         <option value="amateur">Любительский</option>
//         <option value="youth">Детский/Юношеский</option>
//       </select>

//       <label>Описание</label>
//       <textarea 
//         value={formData.description} 
//         onChange={(e) => setFormData({...formData, description: e.target.value})} 
//         rows="4"
//         placeholder="Расскажите о вашем клубе..."
//       />

//       <button type="submit" className="btn-primary" disabled={loading}>
//         {loading ? 'Сохранение...' : 'Сохранить изменения'}
//       </button>
//     </form>
//   );
// }
import { useState, useRef, useEffect } from 'react';
import { clubsApi } from '../../api/clubs';
import { useAuthStore } from '../../store/useAuthStore';
import { getLogoUrlCached, invalidateLogoCache } from "../../api/logoUrlCache";

export default function ClubSettings() {
  const { user, setAuth } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null); // Добавляем стейт для URL
  const fileInputRef = useRef(null);

  // Загружаем актуальный URL логотипа при монтировании или обновлении ключа
  useEffect(() => {
    async function fetchPreview() {
      if (user?.logo_key) {
        const url = await getLogoUrlCached(user.logo_key);
        setPreviewUrl(url);
      }
    }
    fetchPreview();
  }, [user?.logo_key]);

  const processFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert("Пожалуйста, загрузите изображение");
      return;
    }

    setUploading(true);
    try {
      // 1. Загружаем на сервер
      const updatedClub = await clubsApi.uploadLogo(file); 
      
      // 2. Инвалидируем старый кеш, чтобы получить свежую ссылку
      invalidateLogoCache(user?.logo_key);
      
      // 3. Обновляем глобальный стор (Zustand)
      const token = localStorage.getItem('access_token');
      setAuth(updatedClub, { access_token: token });
      
      // 4. Получаем новый URL для немедленного отображения
      const newUrl = await clubsApi.getPublicMediaUrl(updatedClub.logo_key);
      setPreviewUrl(newUrl);

      alert('Логотип успешно обновлен!');
    } catch (err) {
      alert('Ошибка при загрузке');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
      <div className="auth-card" style={{ padding: '2rem' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>Логотип клуба</h2>

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`drop-zone ${isDragging ? 'active' : ''}`}
          style={{ 
            padding: '2rem', border: '2px dashed var(--border)', borderRadius: '15px',
            textAlign: 'center', cursor: 'pointer', background: isDragging ? 'rgba(255,255,255,0.05)' : 'transparent'
          }}
        >
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 1rem', overflow: 'hidden', border: '2px solid var(--primary)' }}>
            {previewUrl ? (
              <img src={previewUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '3rem' }}>⚽</span>
            )}
          </div>

          <p>{uploading ? 'Загрузка...' : 'Нажмите или перетащите логотип'}</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  );
}