import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

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
