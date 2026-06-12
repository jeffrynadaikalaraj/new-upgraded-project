import { create } from 'zustand';
import api from '../services/api';

export const useAnalyticsStore = create((set, get) => ({
  overview: null,
  weeklyData: [],
  monthlyData: [],
  habitsData: [],
  goalsData: [],
  isLoading: true,
  error: null,

  fetchOverview: async () => {
    try {
      const response = await api.get('/analytics/overview');
      set({ overview: response.data.data });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch overview' });
    }
  },

  fetchWeekly: async () => {
    try {
      const response = await api.get('/analytics/weekly');
      set({ weeklyData: response.data.data });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch weekly data' });
    }
  },

  fetchMonthly: async () => {
    try {
      const response = await api.get('/analytics/monthly');
      set({ monthlyData: response.data.data });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch monthly data' });
    }
  },

  fetchHabits: async () => {
    try {
      const response = await api.get('/analytics/habits');
      set({ habitsData: response.data.data });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch habits data' });
    }
  },

  fetchGoals: async () => {
    try {
      const response = await api.get('/analytics/goals');
      set({ goalsData: response.data.data });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch goals data' });
    }
  },

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([
        get().fetchOverview(),
        get().fetchWeekly(),
        get().fetchMonthly(),
        get().fetchHabits(),
        get().fetchGoals()
      ]);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: 'Failed to load analytics data' });
    }
  }
}));
