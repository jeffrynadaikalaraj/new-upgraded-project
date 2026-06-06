import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { useChatStore } from '../../stores/chatStore';

const ChatWindow = () => {
  const { messages, isStreaming } = useChatStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 w-full max-w-4xl mx-auto scrollbar-thin">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center px-4">
          <div className="w-20 h-20 bg-gradient rounded-full flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
            <span className="text-3xl">👋</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Welcome to AI LifeOS</h2>
          <p className="text-slate-400 max-w-md">
            I'm your personal AI assistant. Let's plan your goals, track your habits, and build your digital second brain. What's on your mind today?
          </p>
        </div>
      ) : (
        <div className="flex flex-col pb-4">
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
