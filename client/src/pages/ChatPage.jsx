import React, { useEffect } from 'react';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import { useChatStore } from '../stores/chatStore';

const ChatPage = () => {
  const { sendMessage, isStreaming, newChat } = useChatStore();

  const handleSendMessage = (text) => {
    sendMessage(text);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/50 relative">
      {/* Mobile Header */}
      <div className="md:hidden p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gradient">AI LifeOS</h1>
        <button onClick={newChat} className="text-indigo-400 hover:text-indigo-300">
          <span className="text-2xl leading-none">+</span>
        </button>
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
