import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Paperclip, X } from 'lucide-react';
import VoiceButton from './VoiceButton';
import { useChatStore } from '../../stores/chatStore';
import { useDocumentStore } from '../../stores/documentStore';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { setIsUserTyping } = useChatStore();
  const { uploadDocument, isUploading, uploadProgress, error, clearError } = useDocumentStore();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const newDoc = await uploadDocument(file);
        const textContent = newDoc.extractedText || newDoc.summary || 'No text could be extracted.';
        const contextMsg = `I have attached a document: "${newDoc.originalName}".\n\nHere is the content/summary of the document:\n\n${textContent}\n\nPlease acknowledge that you have received this document and let me know if you are ready to answer questions about it.`;
        onSendMessage(contextMsg);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
    e.target.value = '';
  };

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
    <div className="relative w-full max-w-4xl mx-auto flex flex-col gap-2 p-4">
      {/* Upload Progress */}
      {isUploading && (
        <div className="premium-card p-3 absolute -top-12 left-4 right-4 z-20 flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-brand-400 flex-shrink-0" />
          <div className="text-xs font-semibold text-slate-300 w-24">Uploading {uploadProgress}%</div>
          <div className="flex-1 bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
            <div className="bg-brand-500 h-1.5 rounded-full transition-all duration-300 ease-out shimmer-effect" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-rose-500/15 backdrop-blur-sm border border-rose-500/25 rounded-xl p-3 shadow-lg absolute -top-12 left-4 right-4 z-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
            <span className="font-bold text-rose-200">Error:</span> {error}
          </div>
          <button onClick={clearError} type="button" className="text-rose-300 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative w-full flex items-end gap-2">
        <div className="relative flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-500/25 focus-within:border-brand-500/30 hover:border-white/[0.12] transition-all duration-300 shadow-inner-glow">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Type your message here..."
            className="w-full max-h-[200px] bg-transparent text-slate-100 placeholder-slate-500 p-4 pr-[120px] resize-none focus:outline-none scrollbar-thin"
            rows={1}
            disabled={disabled}
            autoFocus
          />
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.txt,.png,.jpg,.jpeg,.webp,.mp3,.wav,.mp4,.m4a,.webm" 
            onChange={handleFileChange} 
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="absolute right-[88px] bottom-2.5 p-2 text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-lg z-10"
            title="Upload document"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <VoiceButton onTranscript={handleVoiceTranscript} isGenerating={disabled} />
          
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="absolute right-2 bottom-2.5 p-2 text-brand-400 hover:text-brand-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-all duration-300 rounded-lg z-10 hover:bg-brand-500/10"
          >
            {disabled ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
