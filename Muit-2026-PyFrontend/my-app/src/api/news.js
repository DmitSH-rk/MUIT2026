import api from './axiosInstance';

export const newsApi = {
  // Получить список новостей (можно фильтровать по club_id)
    getNews: async (limit = 20, skip = 0) => {
    const response = await api.get('/news/', { 
      params: { limit, skip } 
    });
    return response.data;
  },

  // Получить конкретную новость
  getNewsById: async (id) => {
    const response = await api.get(`/news/${id}`);
    return response.data;
  },

  // Создать новость (только для клубов)
  createNews: async (newsData) => {
    // newsData: { title, body, cover_key, is_published }
    const response = await api.post('/news/', newsData);
    return response.data;
  },
uploadNewsCover: async (id, file) => {
    const form = new FormData();
    form.append('cover', file);

    const res = await api.post(`/news/${id}/cover`, form, {
      headers: { accept: 'application/json' },
    });

    return res.data; // ожидаем { object_key } или строку
  },
  // Удалить новость
  deleteNews: async (id) => {
    await api.delete(`/news/${id}`);
  }
};