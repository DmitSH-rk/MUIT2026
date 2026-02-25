import api from './axiosInstance';

export const competitionsApi = {
  // Получить список всех баттлов
  getCompetitions: async (params = {}) => {
    const response = await api.get('/competitions/', { params });
    return response.data;
  },

  // Создать новый вызов (только для клубов)
  createCompetition: async (data) => {
    // data: { title, description, starts_at, ends_at }
    const response = await api.post('/competitions/', data);
    return response.data;
  },

  joinCompetition: async (id) => {
  const response = await api.post(`/competitions/${id}/subscribe`);
  return response.data;
},
  // Обновить статус или данные
  updateCompetition: async (id, data) => {
    const response = await api.patch(`/competitions/${id}`, data);
    return response.data;
  },

  // Загрузить фото баттла (афишу)
  uploadPhoto: async (id, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post(`/competitions/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};