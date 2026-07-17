import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBubble from './MessageBubble';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { Calendar, Target, Activity, BarChart2, Mic, Sparkles } from 'lucide-react';

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
        <div className="h-full flex flex-col items-center justify-center text-center px-4 pt-4 pb-20">
          {/* Ambient glow behind heading */}
          <div className="relative">
            <div className="absolute inset-0 bg-brand-500/10 blur-3xl rounded-full scale-150" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient mx-auto mb-6 flex items-center justify-center shadow-glow-md">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Hello {user?.name ? user.name.split(' ')[0] : 'User'}.</h2>
              <p className="text-slate-400 max-w-md mb-10 text-sm leading-relaxed">
                I'm your personal AI companion. How can I help you dominate your day?
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-2xl">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.action}
                className="flex items-center justify-center gap-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 text-slate-300 hover:text-white py-3.5 px-4 rounded-xl text-sm font-medium shadow-inner-glow group"
              >
                <span className="text-brand-400 group-hover:text-brand-300 transition-colors">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col pb-4 max-w-4xl mx-auto p-4 sm:p-6 w-full relative">
          {/* Chat messages */}

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
