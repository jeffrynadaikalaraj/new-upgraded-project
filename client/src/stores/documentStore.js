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

      // We bypass Axios completely for file uploads to guarantee FormData and boundary
      // are handled correctly by the browser without interceptor interference.
      // We manually handle 401 Token Refresh here.
      let token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || '/api';
      
      let response = await fetch(`${baseURL}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      // If token expired, attempt refresh
      if (response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshRes = await fetch(`${baseURL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken })
            });
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              token = refreshData.token;
              localStorage.setItem('token', token);
              localStorage.setItem('refreshToken', refreshData.refreshToken);

              // Retry upload with new token
              response = await fetch(`${baseURL}/documents/upload`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                },
                body: formData
              });
            }
          } catch (refreshErr) {
            console.error('Failed to refresh token during upload', refreshErr);
          }
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const res = { data: await response.json() }; // shape it like axios response for the code below
      
      set({ uploadProgress: 100 });

      const newDoc = res.data.data;
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
