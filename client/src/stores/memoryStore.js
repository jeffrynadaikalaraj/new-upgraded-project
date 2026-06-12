import { create } from 'zustand';
import api from '../services/api';

export const useMemoryStore = create((set, get) => ({
  memories: [],
  isLoading: false,
  error: null,

  /**
   * Fetch all memories for the authenticated user.
   */
  fetchMemories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/memories');
      set({ memories: response.data.data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to fetch memories',
        isLoading: false,
      });
    }
  },

  /**
   * Delete a single memory by ID.
   * @param {string} id - Memory document ID
   */
  deleteMemory: async (id) => {
    try {
      await api.delete(`/memories/${id}`);
      set((state) => ({
        memories: state.memories.filter((m) => m._id !== id),
      }));
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to delete memory' });
      throw error;
    }
  },

  /**
   * Delete all memories for the authenticated user.
   */
  clearMemories: async () => {
    try {
      await api.delete('/memories');
      set({ memories: [] });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to clear memories' });
      throw error;
    }
  },
}));
