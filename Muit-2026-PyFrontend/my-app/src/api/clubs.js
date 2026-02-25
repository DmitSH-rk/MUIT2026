import api from './axiosInstance';

export const clubsApi = {
  // Получение списка клубов с фильтрацией
  getClubs: async (filters = {}) => {
    const { city, category, search, skip = 0, limit = 20 } = filters;
    
    const response = await api.get('/clubs/', {
      params: { city, category, search, skip, limit }
    });
    return response.data;
  },

  updateClub: async (id, clubData) => {
    const response = await api.patch(`/clubs/me`, clubData);
    return response.data;
  },

  // Получение одного клуба по ID
  getClubById: async (id) => {
    const response = await api.get(`/clubs/${id}`);
    return response.data;
  },

  // Регистрация клуба (отдельный эндпоинт)
  registerClub: async (clubData) => {
    const response = await api.post('/clubs/register', clubData);
    return response.data;
  },
  
 // ✅ ВАЖНО: /media/public-url по доке возвращает { object_key, url }
  // Но на всякий случай поддержим и вариант, если бекенд вернет просто строку.
  getPublicMediaUrl: async (objectKey) => {
    if (!objectKey || objectKey === "string") return null;

    const { data } = await api.get(`/media/public-url`, {
      params: { object_key: objectKey },
    });

    if (!data) return null;

    // Вариант 1: бекенд вернул строку
    if (typeof data === "string") return data;

    // Вариант 2: бекенд вернул объект { object_key, url }
    if (typeof data === "object" && typeof data.url === "string") return data.url;

    return null;
  },
  
  uploadLogo: async (file) => {
    const formData = new FormData();
    
    // В curl было -F 'logo=...', значит ключ должен быть 'logo'
    formData.append('logo', file); 

    const response = await api.post('/clubs/me/logo', formData, {
      headers: {
        // ВАЖНО: Не указывай Content-Type вручную!
        // Браузер сам добавит 'multipart/form-data' и правильный 'boundary'
        'accept': 'application/json',
      }
    });
    return response.data;
  },
};