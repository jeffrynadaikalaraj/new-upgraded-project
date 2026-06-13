import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare, Target, Activity, LayoutDashboard, Settings,
  LogOut, PlusCircle, ChevronLeft, ChevronRight, Trash2, Brain, Calendar, BarChart3, FileBarChart, FileText
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import { useUIStore } from '../../stores/uiStore';

const navItems = [
  { path: '/chat', label: 'AI Chat', icon: MessageSquare },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/habits', label: 'Habits', icon: Activity },
  { path: '/planner', label: 'Daily Plan', icon: LayoutDashboard },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/memories', label: 'Memory', icon: Brain },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/reports', label: 'Reports', icon: FileBarChart },
  { path: '/documents', label: 'Documents', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { chatHistory, loadChatHistory, loadChat, newChat, deleteChat, activeChat } = useChatStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadChatHistory();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSelectChat = (chat) => {
    loadChat(chat._id);
    navigate('/chat');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}
      
      <aside
        className={`absolute md:relative z-50 flex flex-col h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out flex-shrink-0 ${
          sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-16'
        }`}
      >
        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3.5 top-8 z-20 w-7 h-7 rounded-full bg-slate-700 border border-slate-600 items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-colors shadow-md"
        >
          {sidebarOpen ? <ChevronLeft size={14}/> : <ChevronRight size={14}/>}
        </button>


      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-slate-800 h-16 ${!sidebarOpen && 'justify-center'}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient flex-shrink-0 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <span className="text-lg">🧠</span>
        </div>
        {sidebarOpen && (
          <span className="font-bold text-white text-lg truncate">AI LifeOS</span>
        )}
      </div>

      {/* New Chat Button */}
      <div className={`p-3 border-b border-slate-800 ${!sidebarOpen && 'flex justify-center'}`}>
        <button
          onClick={() => { newChat(); navigate('/chat'); }}
          className={`flex items-center gap-2 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium ${
            sidebarOpen ? 'w-full px-3 py-2' : 'p-2'
          }`}
        >
          <PlusCircle size={18} className="flex-shrink-0"/>
          {sidebarOpen && 'New Chat'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-0.5 border-b border-slate-800">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group ${
              isActive(path)
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            } ${!sidebarOpen && 'justify-center'}`}
            title={!sidebarOpen ? label : ''}
          >
            <Icon size={18} className="flex-shrink-0"/>
            {sidebarOpen && <span className="truncate">{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Chat History */}
      {sidebarOpen && (
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold px-2 mb-2 pt-1">History</p>
          {chatHistory.length === 0 && (
            <p className="text-xs text-slate-600 px-3 py-2">No conversations yet</p>
          )}
          {chatHistory.map(chat => (
            <div
              key={chat._id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all text-xs ${
                activeChat?._id === chat._id
                  ? 'bg-slate-700 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              onClick={() => handleSelectChat(chat)}
            >
              <span className="flex-1 truncate">{chat.title}</span>
              <button
                onClick={e => { e.stopPropagation(); deleteChat(chat._id); }}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all flex-shrink-0"
              >
                <Trash2 size={13}/>
              </button>
            </div>
          ))}
        </div>
      )}
      {!sidebarOpen && <div className="flex-1"/>}

      {/* User Profile */}
      <div className={`p-3 border-t border-slate-800 flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
        <div className="w-8 h-8 rounded-full bg-gradient flex-shrink-0 flex items-center justify-center text-sm font-bold text-white shadow-sm">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        {sidebarOpen && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email || ''}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Logout"
          className="text-slate-500 hover:text-rose-400 transition-colors flex-shrink-0"
        >
          <LogOut size={16}/>
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
