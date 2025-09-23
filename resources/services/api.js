import axios from 'axios';

const api = axios.create({
  baseURL: 'http://your-laravel-app.test/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Pievienojam tokenu katram requestam
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



export default api;