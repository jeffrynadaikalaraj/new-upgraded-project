import { create } from 'zustand';
import api from '../services/api';

export const useGoalStore = create((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,

  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/goals');
      set({ goals: response.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch goals', isLoading: false });
    }
  },

  createGoal: async (goalData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/goals', goalData);
      set((state) => ({ goals: [response.data.data, ...state.goals], isLoading: false }));
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to create goal', isLoading: false });
      throw error;
    }
  },

  updateGoal: async (id, goalData) => {
    try {
      const response = await api.put(`/goals/${id}`, goalData);
      set((state) => ({
        goals: state.goals.map((g) => (g._id === id ? response.data.data : g))
      }));
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to update goal' });
      throw error;
    }
  },

  deleteGoal: async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      set((state) => ({
        goals: state.goals.filter((g) => g._id !== id)
      }));
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to delete goal' });
      throw error;
    }
  },

  addMilestone: async (goalId, milestoneData) => {
    try {
      const response = await api.post(`/goals/${goalId}/milestones`, milestoneData);
      set((state) => ({
        goals: state.goals.map((g) => (g._id === goalId ? response.data.data : g))
      }));
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to add milestone' });
      throw error;
    }
  },

  updateMilestone: async (goalId, milestoneId, milestoneData) => {
    try {
      const response = await api.put(`/goals/${goalId}/milestones/${milestoneId}`, milestoneData);
      set((state) => ({
        goals: state.goals.map((g) => (g._id === goalId ? response.data.data : g))
      }));
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to update milestone' });
      throw error;
    }
  },

  generateAiSuggestions: async (goalId) => {
    try {
      const response = await api.post(`/goals/${goalId}/ai-suggest`);
      set((state) => ({
        goals: state.goals.map((g) => (g._id === goalId ? response.data.data : g))
      }));
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to generate suggestions' });
      throw error;
    }
  },

  logActivity: async (goalId, activityData) => {
    try {
      const response = await api.post(`/goals/${goalId}/activity`, activityData);
      const updatedGoal = response.data.data;
      set((state) => ({
        goals: state.goals.map((g) => (g._id === goalId ? updatedGoal : g))
      }));
      return updatedGoal;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to log activity' });
      throw error;
    }
  }
}));
