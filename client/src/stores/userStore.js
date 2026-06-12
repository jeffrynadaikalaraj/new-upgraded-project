import { create } from 'zustand';
import api from '../services/api';
import { useAuthStore } from './authStore';

export const useUserStore = create((set) => ({
  profile: null,
  isLoading: false,
  isSaving: false,
  isExporting: false,
  isDeleting: false,
  error: null,
  successMessage: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/users/me');
      set({ profile: res.data.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to load profile', isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const res = await api.put('/users/me', updates);
      const updatedUser = res.data.data;
      set({ profile: updatedUser, isSaving: false, successMessage: 'Settings saved successfully!' });
      // Sync with authStore so the sidebar avatar/name updates
      useAuthStore.setState(state => ({ user: { ...state.user, ...updatedUser } }));
      // Clear success message after 3s
      setTimeout(() => set({ successMessage: null }), 3000);
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to save settings', isSaving: false });
    }
  },

  exportData: async () => {
    set({ isExporting: true, error: null });
    try {
      const res = await api.post('/users/me/export', {}, { responseType: 'blob' });
      // Create a download link
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-lifeos-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      set({ isExporting: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Export failed', isExporting: false });
    }
  },

  deleteAccount: async () => {
    set({ isDeleting: true, error: null });
    try {
      await api.delete('/users/me');
      // Clear everything from localStorage and reset auth
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
      set({ profile: null, isDeleting: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to delete account', isDeleting: false });
    }
  },

  clearMessages: () => set({ error: null, successMessage: null })
}));
