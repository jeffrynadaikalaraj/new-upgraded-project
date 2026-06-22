import { create } from 'zustand';

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  currentPage: 'dashboard',
  theme: 'dark',
  avatarEmotion: 'idle', // idle, thinking, speaking, listening, happy, concerned, excited, error
  notifications: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  setTheme: (theme) => set({ theme }),
  
  setAvatarEmotion: (emotion) => set({ avatarEmotion: emotion }),
  
  addNotification: (notification) => set((state) => ({ 
    notifications: [...state.notifications, { id: Date.now(), ...notification }] 
  })),
  
  removeNotification: (id) => set((state) => ({ 
    notifications: state.notifications.filter(n => n.id !== id) 
  })),
}));
