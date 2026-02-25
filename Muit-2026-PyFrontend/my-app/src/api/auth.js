import api from './axiosInstance';

export const authApi = {
  // Для обычных пользователей (Role: member)
  registerMember: (data) => api.post('/users/register', data),

  // Для клубов (Role: club)
  registerClub: (data) => api.post('/clubs/register', data),

  // Для инвесторов (Role: investor)
  registerInvestor: (data) => api.post('/investors/register', data),

  // Для организаций (Role: organization)
  registerOrganization: (data) => api.post('/organizations/register', data),

  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const response = await api.post('/users/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  }
};