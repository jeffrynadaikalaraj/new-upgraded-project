import React, { useEffect } from 'react';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import { useChatStore } from '../stores/chatStore';

const ChatPage = () => {
  const { sendMessage, isStreaming, newChat, avatarTheme, setAvatarTheme } = useChatStore();

  const handleSendMessage = (text) => {
    sendMessage(text);
  };

  const themes = [
    { value: 'female', label: 'Female AI' },
    { value: 'male', label: 'Male AI' },
    { value: 'jarvis', label: 'Jarvis' },
    { value: 'cyber', label: 'Cyber AI' },
    { value: 'minimal', label: 'Minimal Orb' },
    { value: 'anime', label: 'Anime AI' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/50 relative">
      {/* Header Area */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gradient md:hidden">AI LifeOS</h1>
        <div className="hidden md:block"></div> {/* Spacer for desktop */}
        
        <div className="flex items-center gap-4">
          <select 
            value={avatarTheme}
            onChange={(e) => setAvatarTheme(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
          >
            {themes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          
          <button onClick={newChat} className="text-indigo-400 hover:text-indigo-300 hidden md:block">
            <span className="text-2xl leading-none" title="New Chat">+</span>
          </button>
        </div>
      </div>

      <ChatWindow />
      
      <div className="w-full bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent pt-6 pb-4 px-4 sticky bottom-0 z-10">
        <ChatInput onSendMessage={handleSendMessage} disabled={isStreaming} />
        <div className="text-center mt-2">
          <p className="text-[10px] text-slate-500">AI LifeOS may generate inaccurate information. Verify critical details.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
