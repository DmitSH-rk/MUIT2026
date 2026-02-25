import { create } from 'zustand';

// Это наше "состояние" и "методы" в одном флаконе (аналог класса с приватными полями и методами)
export const useAuthStore = create((set) => ({
  // 1. Состояние (State)
  user: null, // Данные из /users/me
  isAuthenticated: !!localStorage.getItem('access_token'), // Булево значение на основе наличия токена
  role: null, // 'member', 'club', 'investor' или 'organization'

  // 2. Действия (Actions) - аналоги методов класса
  
  // Вызывается после успешного логина
  setAuth: (userData, tokens) => {
    // Сохраняем токены в браузерное хранилище (аналог записи в конфиг-файл)
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);

    // Обновляем состояние стора
    set({ 
      user: userData, 
      isAuthenticated: true, 
      role: userData.role 
    });
  },

  // Вызывается при логауте или ошибке 401
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false, role: null });
  },

  // Метод для обновления только данных пользователя (например, после смены аватара)
  setUser: (userData) => set({ user: userData, role: userData.role })
}));