import { create } from 'zustand';
import api from '../services/api';
import { sfx } from '../utils/sfx';

const BASE_URL = ''; // Use Vite proxy to avoid CORS issues

// Optional TTS feature toggle - can be linked to a UI setting later
let isVoiceModeEnabled = true;

const speakText = async (text) => {
  if (!isVoiceModeEnabled) return;
  
  // Clean text of markdown and action tags
  const cleanText = text
    .replace(/<!--ACTION:.*?-->/g, '')
    .replace(/[*_~`#]/g, '')
    .trim();
    
  if (!cleanText) return;

  const theme = useChatStore.getState().avatarTheme;
  
  try {
    // Try backend ElevenLabs endpoint
    const response = await fetch(`${BASE_URL}/api/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ text: cleanText, theme })
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('audio')) {
        // Play backend audio
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
        
        // Sync Avatar's speaking state manually (approximate based on audio duration)
        useChatStore.getState().setIsSpeakingAudio(true);
        sfx.playSpeechAmbience(theme);
        source.onended = () => {
          useChatStore.getState().setIsSpeakingAudio(false);
          sfx.stopSpeechAmbience();
        };
        return; // Success, skip browser TTS
      } else {
        const data = await response.json();
        if (data.useBrowserTTS) {
          console.log('Falling back to browser TTS (no ElevenLabs key)');
        }
      }
    }
  } catch (error) {
    console.error('TTS Backend failed, falling back to browser TTS:', error);
  }

  // Fallback: Browser Web Speech API
  if (!('speechSynthesis' in window)) return;
  
  const utterance = new SpeechSynthesisUtterance(cleanText);
  const lang = useChatStore.getState().language || 'en-US';
  
  utterance.lang = lang;
  
  // Select voice based on theme and language
  const voices = window.speechSynthesis.getVoices();
  const langPrefix = lang.split('-')[0];
  const langVoices = voices.filter(v => v.lang.startsWith(langPrefix)) || voices;
  
  // Prioritize high-quality neural/natural voices built into the OS
  const isHighQuality = (v) => v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Online');
  const hqVoices = langVoices.filter(isHighQuality);
  const voiceList = hqVoices.length > 0 ? hqVoices : langVoices;
  
  // Theme-based Voice Adjustments for fluent human-like or robotic reads
  let preferredVoice;
  utterance.rate = 1.35; // Very fast and fluent like a human
  utterance.pitch = 1.0;

  switch (theme) {
    case 'anime':
      // Extremely high pitch, super fast for classic anime character feel
      utterance.pitch = 2.0;
      utterance.rate = 1.5;
      preferredVoice = voiceList.find(v => /Female|Aria|Jenny|Zira|Samantha/i.test(v.name) && isHighQuality(v)) 
        || voiceList.find(v => /Female|Aria|Jenny|Zira|Samantha/i.test(v.name)) || voiceList[0];
      break;
      
    case 'jarvis':
      // Very deep, robotic, calculated pitch
      utterance.pitch = 0.2;
      utterance.rate = 1.25;
      preferredVoice = voiceList.find(v => /UK|British|George|Hazel|David/i.test(v.name) && /Male|Guy/i.test(v.name))
        || voiceList.find(v => /Male|Guy|David|Daniel|Alex/i.test(v.name)) || voiceList[0];
      break;

    case 'cyber':
      // Deep, aggressive, robotic pitch
      utterance.pitch = 0.1;
      utterance.rate = 1.3;
      preferredVoice = voiceList.find(v => /Male|Guy|Matthew|Brian/i.test(v.name)) || voiceList[0];
      break;

    case 'minimal':
      // Neutral, balanced, extremely fluent
      utterance.pitch = 1.0;
      utterance.rate = 1.35;
      preferredVoice = voiceList.find(v => /Aria|Jenny|Google/i.test(v.name)) || voiceList[0];
      break;

    case 'male':
      // Normal Male, very fluent
      utterance.pitch = 0.9;
      utterance.rate = 1.35;
      preferredVoice = voiceList.find(v => /Male|Guy|David|Daniel|Alex|Matthew|Brian/i.test(v.name) && isHighQuality(v))
        || voiceList.find(v => /Male|Guy|David|Daniel|Alex|Matthew|Brian/i.test(v.name)) || voiceList[0];
      break;

    case 'female':
    default:
      // Normal Female, very fluent
      utterance.pitch = 1.1;
      utterance.rate = 1.35;
      preferredVoice = voiceList.find(v => /Female|Aria|Jenny|Zira|Samantha|Google US English/i.test(v.name) && isHighQuality(v))
        || voiceList.find(v => /Female|Aria|Jenny|Zira|Samantha/i.test(v.name)) || voiceList[0];
      break;
  }

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.cancel(); // Stop current speaking
  
  // Sync avatar state and play ambient FX
  utterance.onstart = () => {
    useChatStore.getState().setIsSpeakingAudio(true);
    sfx.playSpeechAmbience(theme);
  };
  utterance.onend = () => {
    useChatStore.getState().setIsSpeakingAudio(false);
    sfx.stopSpeechAmbience();
  };
  
  window.speechSynthesis.speak(utterance);
};

export const useChatStore = create((set, get) => ({
  messages: [],
  activeChat: null,
  chatHistory: [],
  isStreaming: false,
  isThinking: false,
  isSpeakingAudio: false,
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
  setIsSpeakingAudio: (isSpeaking) => set({ isSpeakingAudio: isSpeaking }),

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
    
    // Play SFX
    sfx.playSendMsg();

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
              set(state => {
                // If this is the first chunk, play receive sound
                if (state.isThinking) {
                   sfx.playReceiveMsg();
                }
                return {
                  isThinking: false,
                  messages: state.messages.map(m =>
                    m._id === tempAiMsgId
                      ? { ...m, content: m.content + data.chunk }
                      : m
                  )
                };
              });
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
