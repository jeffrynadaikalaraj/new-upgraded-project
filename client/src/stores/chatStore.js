import { create } from 'zustand';
import api from '../services/api';

const BASE_URL = ''; // Use Vite proxy to avoid CORS issues

// Optional TTS feature toggle - can be linked to a UI setting later
let isVoiceModeEnabled = true;

const speakText = (text) => {
  if (!isVoiceModeEnabled || !('speechSynthesis' in window)) return;
  
  // Clean text of markdown and action tags
  const cleanText = text
    .replace(/<!--ACTION:.*?-->/g, '')
    .replace(/[*_~`#]/g, '')
    .trim();
    
  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const lang = useChatStore.getState().language || 'en-US';
  utterance.lang = lang;
  utterance.rate = 1.0;
  utterance.pitch = 0.95; // Slightly deeper, more natural
  
  // Select voice based on theme and language
  const theme = useChatStore.getState().avatarTheme;
  const voices = window.speechSynthesis.getVoices();
  
  // Filter voices by selected language prefix (e.g. 'en', 'es', 'fr')
  const langPrefix = lang.split('-')[0];
  const langVoices = voices.filter(v => v.lang.startsWith(langPrefix)) || voices;
  
  // Prioritize high-quality neural/natural voices built into the OS
  const isHighQuality = (v) => v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google');
  const hqVoices = langVoices.filter(isHighQuality);
  const voiceList = hqVoices.length > 0 ? hqVoices : langVoices;
  
  let preferredVoice;
  if (theme === 'male' || theme === 'jarvis') {
    preferredVoice = voiceList.find(v => v.name.includes('Male') || v.name.includes('David') || v.name.includes('Mark') || v.name.includes('Guy')) || voiceList[0];
  } else {
    preferredVoice = voiceList.find(v => v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Aria') || v.name.includes('Jenny')) || voiceList[0];
  }

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.cancel(); // Stop current speaking
  window.speechSynthesis.speak(utterance);
};

export const useChatStore = create((set, get) => ({
  messages: [],
  activeChat: null,
  chatHistory: [],
  isStreaming: false,
  isThinking: false,
  isLoadingHistory: false,
  
  // Avatar States
  avatarTheme: 'female', // 'female', 'male', 'jarvis', 'cyber', 'minimal', 'anime'
  avatarEmotion: 'neutral', // 'neutral', 'happy', 'concerned', 'thinking', 'listening'
  language: 'en-US',
  isUserTyping: false,
  setAvatarTheme: (theme) => set({ avatarTheme: theme }),
  setAvatarEmotion: (emotion) => set({ avatarEmotion: emotion }),
  setLanguage: (lang) => set({ language: lang }),
  setIsUserTyping: (isTyping) => set({ isUserTyping: isTyping }),

  loadChatHistory: async () => {
    set({ isLoadingHistory: true });
    try {
      const res = await api.get('/chat/history');
      set({ chatHistory: res.data.data, isLoadingHistory: false });
    } catch (err) {
      console.error('Failed to load chat history', err);
      set({ isLoadingHistory: false });
    }
  },

  loadChat: async (chatId) => {
    try {
      const res = await api.get(`/chat/${chatId}`);
      set({ activeChat: res.data.data.chat, messages: res.data.data.messages });
    } catch (err) {
      console.error('Failed to load chat', err);
    }
  },

  newChat: () => {
    set({ activeChat: null, messages: [] });
  },

  deleteChat: async (chatId) => {
    try {
      await api.delete(`/chat/${chatId}`);
      set(state => ({
        chatHistory: state.chatHistory.filter(c => c._id !== chatId),
        // Reset if this was the active chat
        ...(state.activeChat?._id === chatId ? { activeChat: null, messages: [] } : {})
      }));
    } catch (err) {
      console.error('Failed to delete chat', err);
    }
  },

  // SSE Streaming using fetch (supports auth headers unlike EventSource)
  sendMessage: async (text) => {
    const { activeChat, messages } = get();
    
    // Optimistic UI update — add user message immediately
    const tempUserMsgId = `user_${Date.now()}`;
    const tempAiMsgId = `ai_${Date.now()}`;

    const newUserMsg = { _id: tempUserMsgId, role: 'user', content: text, timestamp: new Date() };
    const newAiMsg  = { _id: tempAiMsgId, role: 'assistant', content: '', timestamp: new Date(), isStreaming: true };

    set({ messages: [...messages, newUserMsg, newAiMsg], isStreaming: true, isThinking: true });

    const token = localStorage.getItem('token');
    const chatIdQuery = activeChat?._id ? `&chatId=${activeChat._id}` : '';
    const url = `${BASE_URL}/api/chat/stream?message=${encodeURIComponent(text)}&mode=auto${chatIdQuery}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete last line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          if (raw === '[DONE]') {
            set(state => {
              const aiMsg = state.messages.find(m => m._id === tempAiMsgId);
              if (aiMsg && aiMsg.content) {
                speakText(aiMsg.content);
              }
              return {
                isStreaming: false,
                isThinking: false,
                messages: state.messages.map(m =>
                  m._id === tempAiMsgId ? { ...m, isStreaming: false } : m
                )
              };
            });
            // Refresh history sidebar
            get().loadChatHistory();
            return;
          }

          try {
            const data = JSON.parse(raw);

            // Capture new chatId sent on stream open
            if (data.chatId && !get().activeChat) {
              set({ activeChat: { _id: data.chatId } });
            }

            if (data.chunk) {
              set(state => ({
                isThinking: false,
                messages: state.messages.map(m =>
                  m._id === tempAiMsgId
                    ? { ...m, content: m.content + data.chunk }
                    : m
                )
              }));
            }

            if (data.error) {
              set(state => ({
                isStreaming: false,
                isThinking: false,
                messages: state.messages.map(m =>
                  m._id === tempAiMsgId
                    ? { ...m, content: 'Error: ' + data.error, isStreaming: false }
                    : m
                )
              }));
            }

            if (data.action) {
              set(state => ({
                messages: state.messages.map(m =>
                  m._id === tempAiMsgId
                    ? { ...m, actions: [...(m.actions || []), data.action] }
                    : m
                )
              }));
            }
          } catch (e) {
            console.warn('SSE parse error on line:', raw, e);
          }
        }
      }
    } catch (err) {
      console.error('Streaming fetch error:', err);
      set(state => ({
        isStreaming: false,
        isThinking: false,
        messages: state.messages.map(m =>
          m._id === tempAiMsgId
            ? { ...m, content: 'Connection error. Is the backend running?', isStreaming: false }
            : m
        )
      }));
    }
  }
}));
