import axios from 'axios';

const rawApiBase = import.meta.env.VITE_API_BASE_URL;
const baseURL = rawApiBase
  ? rawApiBase.replace(/\/+$|\/api$/i, '') + '/api'
  : '/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  // Read from zustand persist storage
  try {
    const stored = JSON.parse(localStorage.getItem('wb-auth') || '{}');
    const token = stored?.state?.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('wb-auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
