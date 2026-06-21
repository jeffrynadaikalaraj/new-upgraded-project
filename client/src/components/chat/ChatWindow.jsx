import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBubble from './MessageBubble';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import AIAvatar from './AIAvatar';
import { Calendar, Target, Activity, BarChart2, Mic } from 'lucide-react';

const ChatWindow = () => {
  const { messages, isStreaming } = useChatStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { label: 'Plan My Day', icon: <Calendar className="w-4 h-4" />, action: () => navigate('/daily-plan') },
    { label: 'Create Goal', icon: <Target className="w-4 h-4" />, action: () => navigate('/goals') },
    { label: 'Log Habit', icon: <Activity className="w-4 h-4" />, action: () => navigate('/habits') },
    { label: 'Show Analytics', icon: <BarChart2 className="w-4 h-4" />, action: () => navigate('/analytics') },
    // Voice mode can just focus input for now until full screen is built
    { label: 'Start Voice Mode', icon: <Mic className="w-4 h-4" />, action: () => console.log('Voice mode triggered') },
  ];

  return (
    <div className="flex-1 overflow-y-auto w-full scrollbar-thin relative">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center px-4 pt-10 pb-20">
          <div className="mb-8">
            <AIAvatar size="large" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Hello {user?.name ? user.name.split(' ')[0] : 'User'}.</h2>
          <p className="text-slate-400 max-w-md mb-10 text-lg">
            I'm your personal AI companion. How can I help you dominate your day?
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-2xl">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.action}
                className="flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 transition-all text-slate-300 py-3 px-4 rounded-xl text-sm font-medium"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col pb-4 max-w-4xl mx-auto p-4 sm:p-6 w-full relative">
          {/* Sticky Avatar at the top of active chat */}
          <div className="sticky top-4 z-20 flex justify-center mb-8 pointer-events-none">
            <div className="bg-slate-900/80 backdrop-blur-md p-2 rounded-full border border-slate-800 shadow-xl pointer-events-auto">
              <AIAvatar size="small" />
            </div>
          </div>

          {messages.map((msg) => (
            <MessageBubble key={msg._id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
