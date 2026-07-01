import { create } from 'zustand';
import api, { initTokenCache, setCachedToken, clearCachedToken } from '../services/api';
import storage from '../utils/storage';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null, // Sync fallback for initial render
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  /**
   * Initialize auth state from secure storage.
   * Should be called once at app startup.
   */
  initAuth: async () => {
    const token = await storage.get('token');
    if (token) {
      setCachedToken(token);
      set({ token, isAuthenticated: true });
    }
    await initTokenCache();
  },

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
      await storage.remove('token');
      await storage.remove('refreshToken');
      clearCachedToken();
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
      
      await storage.set('token', res.data.token);
      await storage.set('refreshToken', res.data.refreshToken);
      setCachedToken(res.data.token);
      
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

  googleLogin: async (credential) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/google', { credential });
      
      await storage.set('token', res.data.token);
      await storage.set('refreshToken', res.data.refreshToken);
      setCachedToken(res.data.token);
      
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data?.error || 'Google Login failed',
        isLoading: false 
      });
      return false;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', userData);
      
      await storage.set('token', res.data.token);
      await storage.set('refreshToken', res.data.refreshToken);
      setCachedToken(res.data.token);
      
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

  logout: async () => {
    await storage.remove('token');
    await storage.remove('refreshToken');
    clearCachedToken();
    set({ user: null, token: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null })
}));
