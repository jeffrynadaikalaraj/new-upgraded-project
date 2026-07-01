import { create } from 'zustand';

export const useUIStore = create((set) => ({
  sidebarOpen: window.innerWidth >= 768, // Default closed on mobile
  currentPage: 'dashboard',
  theme: 'dark',
  avatarEmotion: 'idle', // idle, thinking, speaking, listening, happy, concerned, excited, error
  notifications: [],
  isMobile: window.innerWidth < 768,
  keyboardVisible: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  setTheme: (theme) => set({ theme }),
  
  setAvatarEmotion: (emotion) => set({ avatarEmotion: emotion }),
  
  setIsMobile: (isMobile) => set({ isMobile }),
  setKeyboardVisible: (visible) => set({ keyboardVisible: visible }),
  
  addNotification: (notification) => set((state) => ({ 
    notifications: [...state.notifications, { id: Date.now(), ...notification }] 
  })),
  
  removeNotification: (id) => set((state) => ({ 
    notifications: state.notifications.filter(n => n.id !== id) 
  })),
}));

// Listen for window resize to track mobile state
if (typeof window !== 'undefined') {
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const isMobile = window.innerWidth < 768;
      useUIStore.getState().setIsMobile(isMobile);
      // Auto-close sidebar on mobile
      if (isMobile && useUIStore.getState().sidebarOpen) {
        useUIStore.getState().setSidebarOpen(false);
      }
    }, 150);
  });
}
