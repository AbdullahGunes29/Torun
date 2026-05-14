import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// İSTEK GİTMEDEN HEMEN ÖNCE ARAYA GİR:
api.interceptors.request.use((config) => {
  // Cüzdandan token'ı al
  const token = localStorage.getItem('torun_token');
  
  // Eğer token varsa, güvenliğe (header) göster
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;