import axios from 'axios';

// Создаём экземпляр с базовыми настройками
const api = axios.create({
  // Базовый URL твоего FastAPI
  baseURL: 'http://2.132.157.33:8000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR: Срабатывает ПЕРЕД отправкой запроса на сервер
api.interceptors.request.use(
  (config) => {
    // Извлекаем токен из localStorage (куда мы его положим при логине)
    const token = localStorage.getItem('access_token');
    
    if (token) {
      // Добавляем заголовок авторизации согласно документации
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR: Срабатывает ПОСЛЕ получения ответа от сервера
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если бэкенд вернул 401 (токен невалиден или истек)
    if (error.response && error.response.status === 401) {
      console.warn('Сессия истекла или токен невалиден');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Можно сделать редирект на логин, если мы не на странице входа
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Обработка 422 Unprocessable Entity (ошибки валидации FastAPI)
    if (error.response && error.response.status === 422) {
      console.error('Ошибка валидации данных на стороне бэкенда:', error.response.data);
    }

    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  if (isFormData) {
    // дать браузеру самому выставить multipart/form-data + boundary
    if (config.headers) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  } else {
    // для JSON-запросов можно выставлять явно
    config.headers = config.headers || {};
    if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
      config.headers["Content-Type"] = "application/json";
    }
  }

  return config;
});


export default api;