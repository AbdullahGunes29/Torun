import axios from 'axios';

const api = axios.create({
  baseURL: "https://torunai.com/api",
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('torun_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response, 
  (error) => {
    
    if (error.response && error.response.status === 401) {
      console.log("Amca anahtarın süresi dolmuş, login'e gidiyoruz...");
      
    
      localStorage.removeItem('torun_token');
      localStorage.removeItem('torun_user');
      
     
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default api;