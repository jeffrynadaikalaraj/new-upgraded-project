import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// Capacitor
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { isNativePlatform, isPluginAvailable } from './utils/platform';
import notificationService from './services/notifications';

// Layout
import ProtectedRoute from './components/layout/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import BottomNavigation from './components/layout/BottomNavigation';
import { useUIStore } from './stores/uiStore';
import AIAvatar from './components/chat/AIAvatar';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import GoalsPage from './pages/GoalsPage';
import HabitsPage from './pages/HabitsPage';
import MemoryPage from './pages/MemoryPage';
import PlannerPage from './pages/PlannerPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import CalendarPage from './pages/CalendarPage';
import AvatarSandbox from './pages/AvatarSandbox';
const Placeholder = ({ title }) => (
  <div className="flex h-full items-center justify-center bg-slate-900 text-white w-full">
    <h1 className="text-3xl font-bold text-slate-500">{title} Page Coming Soon</h1>
  </div>
);

// Dashboard layout wrapper
const AppLayout = ({ children }) => {
  const { toggleSidebar } = useUIStore();
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';
  
  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-100 overflow-hidden relative">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full relative overflow-hidden min-w-0 pt-16 md:pt-0">
        {/* Mobile menu button */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden absolute top-3 left-4 z-40 p-2 bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-lg text-slate-300 hover:text-white shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
        {children}

        {/* Floating Avatar for non-chat pages */}
        {!isChatPage && (
          <div className="absolute bottom-6 right-6 z-50 pointer-events-none group hidden md:block">
            <div className="pointer-events-auto cursor-pointer transition-transform hover:scale-110 shadow-2xl rounded-full bg-slate-900/80 backdrop-blur border border-slate-700 p-2">
              <AIAvatar size="small" />
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

/**
 * Initialize native platform features (Capacitor).
 * Called once at app startup.
 */
function useNativeInit() {
  useEffect(() => {
    async function init() {
      if (!isNativePlatform()) return;

      // Configure Status Bar
      if (isPluginAvailable('StatusBar')) {
        try {
          await StatusBar.setStyle({ style: StatusBarStyle.Dark });
          await StatusBar.setBackgroundColor({ color: '#0f172a' });
        } catch (e) {
          console.warn('[Native] StatusBar setup failed:', e);
        }
      }

      // Configure Keyboard behavior
      if (isPluginAvailable('Keyboard')) {
        try {
          Keyboard.setAccessoryBarVisible({ isVisible: false });
          Keyboard.setScroll({ isDisabled: false });
        } catch (e) {
          console.warn('[Native] Keyboard setup failed:', e);
        }
      }

      // Handle hardware back button (Android)
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          CapApp.exitApp();
        }
      });

      // Initialize push notifications
      await notificationService.initialize();
    }

    init();
  }, []);
}

function App() {
  useNativeInit();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          
          <Route path="/chat" element={
            <AppLayout>
              <ChatPage />
            </AppLayout>
          } />
          
          <Route path="/dashboard" element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          } />
          
          <Route path="/goals" element={
            <AppLayout>
              <GoalsPage />
            </AppLayout>
          } />
          
          <Route path="/habits" element={
            <AppLayout>
              <HabitsPage />
            </AppLayout>
          } />
          
          <Route path="/memories" element={
            <AppLayout>
              <MemoryPage />
            </AppLayout>
          } />
          
          <Route path="/planner" element={
            <AppLayout>
              <PlannerPage />
            </AppLayout>
          } />

          <Route path="/analytics" element={
            <AppLayout>
              <AnalyticsPage />
            </AppLayout>
          } />

          <Route path="/reports" element={
            <AppLayout>
              <ReportsPage />
            </AppLayout>
          } />

          <Route path="/settings" element={
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          } />

          <Route path="/calendar" element={
            <AppLayout>
              <CalendarPage />
            </AppLayout>
          } />

          <Route path="/sandbox" element={
            <AppLayout>
              <AvatarSandbox />
            </AppLayout>
          } />
        </Route>
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
