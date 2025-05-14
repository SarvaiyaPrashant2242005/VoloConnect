import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include user-id
api.interceptors.request.use(
  (config) => {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      config.headers['user-id'] = userId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('userId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 