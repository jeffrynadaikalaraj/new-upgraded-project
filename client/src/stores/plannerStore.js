import { create } from 'zustand';
import api from '../services/api';

export const usePlannerStore = create((set, get) => ({
  todayPlan: null,
  isLoading: false,
  error: null,

  fetchTodayPlan: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/planner/today');
      set({ todayPlan: response.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch plan', isLoading: false });
    }
  },

  generatePlan: async (date, customPrompt = '', wakeTime = '', sleepTime = '', priorityLevel = 'Balanced') => {
    set({ isLoading: true, error: null });
    try {
      const payload = { 
        date: date || undefined,
        customPrompt,
        wakeTime,
        sleepTime,
        priorityLevel
      };
      const response = await api.post('/planner/generate', payload);
      set({ todayPlan: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to generate plan', isLoading: false });
      throw error;
    }
  },

  updateBlock: async (date, blockId, completed) => {
    try {
      const response = await api.put(`/planner/${date}/blocks/${blockId}`, { completed });
      set({ todayPlan: response.data.data });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to update block' });
      throw error;
    }
  },
}));
