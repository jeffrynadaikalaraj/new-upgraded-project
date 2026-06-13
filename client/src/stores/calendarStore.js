import { create } from 'zustand';
import api from '../services/api';

export const useCalendarStore = create((set) => ({
  events: [],
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/calendar');
      set({ events: response.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch events', isLoading: false });
    }
  },

  createEvent: async (eventData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/calendar', eventData);
      set((state) => ({ events: [...state.events, response.data.data], isLoading: false }));
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to create event', isLoading: false });
      throw error;
    }
  },

  deleteEvent: async (id) => {
    try {
      await api.delete(`/calendar/${id}`);
      set((state) => ({
        events: state.events.filter((e) => e._id !== id)
      }));
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to delete event' });
      throw error;
    }
  }
}));
