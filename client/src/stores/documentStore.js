import { create } from 'zustand';
import api from '../services/api';

export const useDocumentStore = create((set, get) => ({
  documents: [],
  selectedDocument: null,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  isAsking: false,
  error: null,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/documents');
      set({ documents: res.data.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to load documents', isLoading: false });
    }
  },

  uploadDocument: async (file) => {
    set({ isUploading: true, uploadProgress: 0, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use native fetch to avoid axios forcing Content-Type: application/json
      // which prevents multer from parsing multipart/form-data
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || '/api';

      set({ uploadProgress: 30 }); // Show some progress immediately

      const response = await fetch(`${baseURL}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Do NOT set Content-Type — browser auto-adds multipart/form-data with boundary
        },
        body: formData
      });

      set({ uploadProgress: 80 });

      const data = await response.json();

      if (!response.ok) {
        throw { response: { data } };
      }

      set({ uploadProgress: 100 });

      const newDoc = data.data;
      set(state => ({
        documents: [newDoc, ...state.documents],
        selectedDocument: newDoc,
        isUploading: false,
        uploadProgress: 0
      }));
      return newDoc;
    } catch (err) {
      const errorMsg = err?.response?.data?.error || err?.message || 'Upload failed';
      set({ error: errorMsg, isUploading: false, uploadProgress: 0 });
      throw err;
    }
  },

  getDocument: async (id) => {
    try {
      const res = await api.get(`/documents/${id}`);
      set({ selectedDocument: res.data.data });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to load document' });
    }
  },

  selectDocument: (doc) => set({ selectedDocument: doc }),

  deleteDocument: async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      set(state => ({
        documents: state.documents.filter(d => d._id !== id),
        selectedDocument: state.selectedDocument?._id === id ? null : state.selectedDocument
      }));
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to delete document' });
    }
  },

  askQuestion: async (id, question) => {
    set({ isAsking: true, error: null });
    try {
      const res = await api.post(`/documents/${id}/ask`, { question });
      set({ isAsking: false });
      return res.data.data.answer;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to get answer', isAsking: false });
      throw err;
    }
  },

  clearError: () => set({ error: null })
}));
