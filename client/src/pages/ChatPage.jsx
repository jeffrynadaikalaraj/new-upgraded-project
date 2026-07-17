import React, { useEffect } from 'react';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import AIAvatar from '../components/chat/AIAvatar';
import { useChatStore } from '../stores/chatStore';
import { motion } from 'framer-motion';

const ChatPage = () => {
  const { messages, sendMessage, isStreaming, newChat, avatarTheme, setAvatarTheme, language, setLanguage } = useChatStore();

  // Proactive Daily Briefing removed as per user request

  const handleSendMessage = (text) => {
    sendMessage(text);
  };

  const themes = [
    { value: 'female', label: 'Female AI' },
    { value: 'male', label: 'Male AI' },
    { value: 'jarvis', label: 'Jarvis' },
    { value: 'cyber', label: 'Cyber AI' },
    { value: 'minimal', label: 'Minimal Bot' },
    { value: 'anime', label: 'Anime AI' },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full relative overflow-hidden" style={{ backgroundColor: '#0a0f1e' }}>
      
      {/* Animated Background Orbs */}
      <motion.div 
        className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-500/[0.08] rounded-full blur-[120px] pointer-events-none"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div 
        className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-pink-500/[0.05] rounded-full blur-[140px] pointer-events-none"
        animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 w-[20rem] h-[20rem] bg-cyan-500/[0.04] rounded-full blur-[100px] pointer-events-none"
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Left Half: 3D Avatar Area */}
      <div className="w-full md:w-1/2 h-[40vh] md:h-full relative flex flex-col border-b md:border-b-0 md:border-r border-white/[0.04] z-10" style={{ background: 'linear-gradient(180deg, rgba(10,15,30,0.7) 0%, rgba(10,15,30,0.5) 100%)', backdropFilter: 'blur(40px)' }}>
        <AIAvatar size="full" />
        
        {/* Header/Controls overlaid on the Avatar */}
        <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10 pointer-events-none">
           <h1 className="text-lg font-bold text-gradient-brand pointer-events-auto md:hidden">AI LifeOS</h1>
           <div className="hidden md:block"></div>
           
           <div className="flex items-center gap-2 pointer-events-auto bg-white/[0.04] p-2 rounded-xl backdrop-blur-xl border border-white/[0.06] shadow-card">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-white/[0.06] border-none text-slate-300 text-xs rounded-lg focus:ring-1 focus:ring-brand-500 cursor-pointer p-1.5 font-medium"
              >
                <option value="en-US">English</option>
                <option value="es-ES">Español</option>
                <option value="fr-FR">Français</option>
                <option value="de-DE">Deutsch</option>
                <option value="hi-IN">Hindi</option>
              </select>

              <select 
                value={avatarTheme}
                onChange={(e) => setAvatarTheme(e.target.value)}
                className="bg-white/[0.06] border-none text-slate-300 text-xs rounded-lg focus:ring-1 focus:ring-brand-500 cursor-pointer p-1.5 font-medium"
              >
                {themes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              
              <button onClick={newChat} className="text-brand-400 hover:text-brand-300 p-1.5 bg-white/[0.06] rounded-lg hover:bg-white/[0.1] transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
           </div>
        </div>
      </div>

      {/* Right Half: Chat Area */}
      <div className="w-full md:w-1/2 h-[60vh] md:h-full flex flex-col relative z-10 border-l border-white/[0.03]" style={{ background: 'rgba(10,15,30,0.4)', backdropFilter: 'blur(32px)' }}>
        <ChatWindow />
        <div className="w-full pt-3 pb-4 px-4 sticky bottom-0 z-20" style={{ background: 'linear-gradient(to top, #0a0f1e 60%, transparent)' }}>
          <ChatInput onSendMessage={handleSendMessage} disabled={isStreaming} />
          <div className="text-center mt-2">
            <p className="text-2xs text-slate-500/60 font-medium">AI LifeOS may generate inaccurate information. Verify critical details.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChatPage;
