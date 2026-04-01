import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ user: data.user, token: data.token, loading: false });
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      register: async (name, email, password) => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          set({ user: data.user, token: data.token, loading: false });
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      fetchMe: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data });
        } catch {
          set({ user: null, token: null });
        }
      },

      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'wb-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
