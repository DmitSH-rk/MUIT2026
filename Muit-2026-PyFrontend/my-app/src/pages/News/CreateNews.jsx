// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { newsApi } from '../../api/news';

// export default function CreateNews() {
//   const [formData, setFormData] = useState({
//     title: '',
//     body: '',
//     cover_key: '',
//     is_published: true
//   });
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await newsApi.createNews(formData); //
//       alert('Новость опубликована!');
//       navigate('/news');
//     } catch (err) {
//       alert('Ошибка при публикации: ' + (err.response?.data?.detail || 'Unknown error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
//       <div className="auth-card">
//         <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Написать новость</h2>
//         <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
//           <input 
//             type="text" 
//             placeholder="Заголовок новости" 
//             maxLength={200}
//             required
//             value={formData.title}
//             onChange={(e) => setFormData({...formData, title: e.target.value})}
//           />
//           <input 
//             type="text" 
//             placeholder="URL обложки (cover_key)" 
//             value={formData.cover_key}
//             onChange={(e) => setFormData({...formData, cover_key: e.target.value})}
//           />
//           <textarea 
//             placeholder="Текст новости..." 
//             required 
//             rows="10"
//             style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
//             value={formData.body}
//             onChange={(e) => setFormData({...formData, body: e.target.value})}
//           />
//           <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
//             <input 
//               type="checkbox" 
//               checked={formData.is_published} 
//               onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
//             />
//             Опубликовать сразу
//           </label>
//           <button type="submit" className="btn-primary" disabled={loading}>
//             {loading ? 'Публикация...' : 'Сохранить новость'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }


import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { newsApi } from '../../api/news';

export default function CreateNews() {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    cover_key: '',
    is_published: true
  });

  const [loading, setLoading] = useState(false);          // submit
  const [uploading, setUploading] = useState(false);      // upload image
  const [error, setError] = useState(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef(null);

  const [coverFile, setCoverFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const navigate = useNavigate();

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

  const handleFileLocal = (file) => {
    if (!file) return;

    if (!file.type || !file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    setError(null);
    setCoverFile(file);

    // cover_key будет получен при публикации
    setFormData(prev => ({ ...prev, cover_key: '' }));

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
  setLoading(true);
  setError(null);

  try {
    // 1) создаём новость БЕЗ cover
    const created = await newsApi.createNews({
      title: formData.title,
      body: formData.body,
      is_published: formData.is_published
    });

    const newsId = created?.id;
    if (!newsId) {
      throw new Error('createNews не вернул id');
    }

    // 2) если выбрана картинка — грузим её
    if (coverFile) {
      await newsApi.uploadNewsCover(newsId, coverFile);
    }

    alert('Новость опубликована!');
    navigate('/news');
  } catch (err) {
    console.error(err);
    const msg = err.response?.data?.detail || err.message || 'Ошибка';
    alert('Ошибка при публикации: ' + msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
      <div className="auth-card">
        <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Написать новость</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <input
            type="text"
            placeholder="Заголовок новости"
            maxLength={200}
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          {/* ✅ Drag & Drop зона для обложки */}
          <div className="input-group">
            <label>Обложка новости</label>

            <div
              onDragEnter={onDragEnter}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={onPickFile}
              style={{
                width: '100%',
                height: '220px',
                border: isDragging ? '2px dashed var(--primary)' : '2px dashed var(--border)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                background: isDragging ? 'rgba(var(--primary-rgb), 0.08)' : 'var(--bg-input)',
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
                  <small>Загрузится при сохранении новости</small>
                </div>
              )}

              {(loading || uploading) && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(255,255,255,0.75)',
                    backdropFilter: 'blur(2px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    fontWeight: 600
                  }}
                >
                  <span>{uploading ? 'Загрузка обложки...' : 'Публикация...'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Оставил поле cover_key если хочешь руками вставлять
          <input
            type="text"
            placeholder="cover_key (если вводишь вручную)"
            value={formData.cover_key}
            onChange={(e) => setFormData({ ...formData, cover_key: e.target.value })}
          /> */}

          <textarea
            placeholder="Текст новости..."
            required
            rows="10"
            style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
            />
            Опубликовать сразу
          </label>

          {error && <p style={{ color: '#ff4444', fontSize: '0.9rem' }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading || uploading}>
            {(loading || uploading) ? 'Публикация...' : 'Сохранить новость'}
          </button>
        </form>
      </div>
    </div>
  );
}