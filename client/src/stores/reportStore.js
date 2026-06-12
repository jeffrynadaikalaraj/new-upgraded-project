import { create } from 'zustand';
import api from '../services/api';

export const useReportStore = create((set) => ({
  reports: [],
  latestReport: null,
  isLoading: false,
  isGenerating: false,
  error: null,

  fetchLatestReport: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/reports/latest');
      set({ latestReport: res.data.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch latest report', isLoading: false });
    }
  },

  fetchReports: async () => {
    try {
      const res = await api.get('/reports');
      set({ reports: res.data.data });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch reports' });
    }
  },

  fetchReport: async (id) => {
    try {
      const res = await api.get(`/reports/${id}`);
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch report' });
    }
  },

  generateReport: async () => {
    set({ isGenerating: true, error: null });
    try {
      const res = await api.post('/reports/generate');
      const newReport = res.data.data;
      // Prepend to list and set as latest
      set(state => ({
        latestReport: newReport,
        reports: [newReport, ...state.reports],
        isGenerating: false
      }));
      return newReport;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to generate report', isGenerating: false });
      throw err;
    }
  }
}));
