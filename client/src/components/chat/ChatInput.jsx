import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';
import VoiceButton from './VoiceButton';
import { useChatStore } from '../../stores/chatStore';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { setIsUserTyping } = useChatStore();

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    
    // Set typing state to true
    setIsUserTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to clear typing state after 1.5s of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false);
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      setIsUserTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
  };

  const handleVoiceTranscript = useCallback((transcript, isFinal) => {
    setMessage(prev => isFinal ? transcript + ' ' : transcript);
    if (isFinal) setIsUserTyping(false);
    else setIsUserTyping(true);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [disabled, onSendMessage, setIsUserTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setIsUserTyping(false);
    };
  }, [setIsUserTyping]);

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-4xl mx-auto flex items-end gap-2 p-4">
      <div className="relative flex-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Type your message here..."
          className="w-full max-h-[200px] bg-transparent text-slate-100 placeholder-slate-400 p-4 pr-12 resize-none focus:outline-none scrollbar-thin"
          rows={1}
          disabled={disabled}
          autoFocus
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="absolute right-2 bottom-2.5 p-2 text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors rounded-lg z-10"
        >
          {disabled ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
        <VoiceButton onTranscript={handleVoiceTranscript} isGenerating={disabled} />
      </div>
    </form>
  );
};

export default ChatInput;
