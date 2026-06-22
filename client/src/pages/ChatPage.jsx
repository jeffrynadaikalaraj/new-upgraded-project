import React, { useEffect } from 'react';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import AIAvatar3D from '../components/chat/AIAvatar3D';
import { useChatStore } from '../stores/chatStore';

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
    <div className="flex-1 flex flex-col md:flex-row h-full bg-slate-900/50 relative overflow-hidden">
      
      {/* Left Half: 3D Avatar Area */}
      <div className="w-full md:w-1/2 h-[40vh] md:h-full relative flex flex-col border-b md:border-b-0 md:border-r border-slate-800 shadow-2xl z-10 bg-slate-900/80">
        <AIAvatar3D />
        
        {/* Header/Controls overlaid on the Avatar */}
        <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10 pointer-events-none">
           <h1 className="text-xl font-bold text-slate-200 pointer-events-auto md:hidden">AI LifeOS</h1>
           <div className="hidden md:block"></div>
           
           <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/70 p-2 rounded-xl backdrop-blur-md border border-slate-700/50 shadow-lg">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-800 border-none text-slate-300 text-xs rounded-lg focus:ring-1 focus:ring-indigo-500 cursor-pointer p-1.5"
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
                className="bg-slate-800 border-none text-slate-300 text-xs rounded-lg focus:ring-1 focus:ring-indigo-500 cursor-pointer p-1.5"
              >
                {themes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              
              <button onClick={newChat} className="text-indigo-400 hover:text-indigo-300 p-1 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
           </div>
        </div>
      </div>

      {/* Right Half: Chat Area */}
      <div className="w-full md:w-1/2 h-[60vh] md:h-full flex flex-col relative bg-slate-900/40">
        <ChatWindow />
        <div className="w-full bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent pt-4 pb-4 px-4 sticky bottom-0 z-10">
          <ChatInput onSendMessage={handleSendMessage} disabled={isStreaming} />
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-500">AI LifeOS may generate inaccurate information. Verify critical details.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChatPage;
