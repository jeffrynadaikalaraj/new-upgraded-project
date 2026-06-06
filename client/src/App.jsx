import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import ProtectedRoute from './components/layout/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';

const Placeholder = ({ title }) => (
  <div className="flex h-full items-center justify-center bg-slate-900 text-white w-full">
    <h1 className="text-3xl font-bold text-slate-500">{title} Page Coming Soon</h1>
  </div>
);

// Dashboard layout wrapper
const AppLayout = ({ children }) => (
  <div className="flex h-screen w-full bg-slate-900 text-slate-100 overflow-hidden">
    <Sidebar />
    <main className="flex-1 flex flex-col h-full relative overflow-hidden">
      {children}
    </main>
  </div>
);

function App() {
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
              <Placeholder title="Dashboard" />
            </AppLayout>
          } />
          
          <Route path="/goals" element={
            <AppLayout>
              <Placeholder title="Goals" />
            </AppLayout>
          } />
          
          <Route path="/habits" element={
            <AppLayout>
              <Placeholder title="Habits" />
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
