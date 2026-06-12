import { create } from 'zustand';
import api from '../services/api';

export const useDashboardStore = create((set) => ({
  dashboardData: null,
  isLoading: true,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/dashboard');
      set({ dashboardData: response.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch dashboard data', isLoading: false });
    }
  }
}));
