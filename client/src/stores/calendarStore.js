import { create } from 'zustand';
import api from '../services/api';

export const useCalendarStore = create((set) => ({
  events: [],
  analytics: null,
  isLoading: false,
  error: null,
  conflictWarning: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/calendar');
      set({ events: response.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch events', isLoading: false });
    }
  },

  createEvent: async (eventData, ignoreConflict = false) => {
    set({ isLoading: true, error: null, conflictWarning: null });
    try {
      const payload = { ...eventData, ignoreConflict };
      const response = await api.post('/calendar', payload);
      set((state) => ({ 
        events: response.data.count > 1 
          ? [...state.events, ...response.data.data] // For recurring arrays
          : [...state.events, response.data.data], 
        isLoading: false 
      }));
      return { success: true, data: response.data.data };
    } catch (error) {
      if (error.response?.status === 409) {
        set({ 
          conflictWarning: { ...error.response.data.conflict, originalPayload: eventData }, 
          isLoading: false 
        });
        return { success: false, conflict: error.response.data.conflict };
      }
      set({ error: error.response?.data?.error || 'Failed to create event', isLoading: false });
      return { success: false, error };
    }
  },

  updateEvent: async (id, eventData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/calendar/${id}`, eventData);
      set((state) => ({
        events: state.events.map(e => e._id === id ? response.data.data : e),
        isLoading: false
      }));
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to update event', isLoading: false });
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
    }
  },

  generateDaily: async (date, prompt) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/calendar/generate', { date, prompt });
      set({ isLoading: false });
      return response.data.data; // array of proposed events
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to generate daily schedule', isLoading: false });
      return [];
    }
  },

  generateWeekly: async (startDate, prompt) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/calendar/generate-week', { startDate, prompt });
      set({ isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to generate weekly schedule', isLoading: false });
      return [];
    }
  },

  checkConflict: async (startTime, endTime, excludeEventId) => {
    try {
      const response = await api.post('/calendar/check-conflict', { startTime, endTime, excludeEventId });
      return response.data.data;
    } catch (error) {
      console.error('Conflict check failed', error);
      return { hasConflict: false };
    }
  },

  syncPlanner: async (date) => {
    set({ isLoading: true });
    try {
      await api.post('/calendar/sync-planner', { date });
      // Reload events after sync
      const eventsRes = await api.get('/calendar');
      set({ events: eventsRes.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to sync planner', isLoading: false });
    }
  },

  fetchAnalytics: async (date) => {
    try {
      const response = await api.get(`/calendar/analytics?date=${date}`);
      set({ analytics: response.data.data });
    } catch (error) {
      console.error('Analytics fetch failed', error);
    }
  },

  clearConflictWarning: () => set({ conflictWarning: null })
}));
