import { create } from 'zustand';
import api from '../services/api';

export const useHabitStore = create((set, get) => ({
  habits: [],
  selectedHabit: null,
  habitStats: null,
  isLoading: false,
  isActionLoading: false, // for complete/uncomplete actions
  error: null,

  // ── Fetch ────────────────────────────────────────────────────────────────

  fetchHabits: async (archived = false) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/habits?archived=${archived}`);
      set({ habits: res.data.data, isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.error || 'Failed to fetch habits',
        isLoading: false,
      });
    }
  },

  fetchHabitStats: async (id) => {
    try {
      const res = await api.get(`/habits/${id}/stats`);
      set({ habitStats: res.data.data });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch stats' });
    }
  },

  // ── Create ───────────────────────────────────────────────────────────────

  createHabit: async (habitData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/habits', habitData);
      set((state) => ({
        habits: [res.data.data, ...state.habits],
        isLoading: false,
      }));
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.error || 'Failed to create habit',
        isLoading: false,
      });
      throw err;
    }
  },

  // ── Update ───────────────────────────────────────────────────────────────

  updateHabit: async (id, habitData) => {
    try {
      const res = await api.put(`/habits/${id}`, habitData);
      set((state) => ({
        habits: state.habits.map((h) => (h._id === id ? res.data.data : h)),
      }));
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to update habit' });
      throw err;
    }
  },

  // ── Archive / Delete ─────────────────────────────────────────────────────

  archiveHabit: async (id) => {
    try {
      await api.delete(`/habits/${id}`);
      // Remove from active list
      set((state) => ({
        habits: state.habits.filter((h) => h._id !== id),
      }));
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to archive habit' });
      throw err;
    }
  },

  deleteHabitPermanently: async (id) => {
    try {
      await api.delete(`/habits/${id}?permanent=true`);
      set((state) => ({
        habits: state.habits.filter((h) => h._id !== id),
      }));
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to delete habit' });
      throw err;
    }
  },

  // ── Complete ─────────────────────────────────────────────────────────────

  completeHabit: async (id, note = '') => {
    set({ isActionLoading: true });
    try {
      const res = await api.post(`/habits/${id}/complete`, { note });
      set((state) => ({
        habits: state.habits.map((h) => (h._id === id ? res.data.data : h)),
        isActionLoading: false,
      }));
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.error || 'Failed to complete habit',
        isActionLoading: false,
      });
      throw err;
    }
  },

  uncompleteHabit: async (id) => {
    set({ isActionLoading: true });
    try {
      const res = await api.post(`/habits/${id}/uncomplete`);
      set((state) => ({
        habits: state.habits.map((h) => (h._id === id ? res.data.data : h)),
        isActionLoading: false,
      }));
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.error || 'Failed to undo completion',
        isActionLoading: false,
      });
      throw err;
    }
  },

  // ── UI helpers ────────────────────────────────────────────────────────────

  setSelectedHabit: (habit) => set({ selectedHabit: habit }),
  clearError: () => set({ error: null }),
}));
