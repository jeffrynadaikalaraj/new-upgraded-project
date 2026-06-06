import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  loadUser: async () => {
    if (!get().token) return;
    
    set({ isLoading: true });
    try {
      const res = await api.get('/auth/me');
      set({ 
        user: res.data.data, 
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: 'Session expired'
      });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data?.error || 'Login failed',
        isLoading: false 
      });
      return false;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', userData);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data?.error || 'Registration failed',
        isLoading: false 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    set({ user: null, token: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null })
}));
