import { create } from 'zustand';
import api from '../services/api';
import { sfx } from '../utils/sfx';

const BASE_URL = ''; // Use Vite proxy to avoid CORS issues

export const speakText = async (text, forcePlay = false) => {
  if (!forcePlay && !useChatStore.getState().isVoiceModeEnabled) return;
  
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
        source.onended = () => {
          useChatStore.getState().setIsSpeakingAudio(false);
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
  
  // ─── Voice Discovery & Classification ─────────────────────────
  const voices = window.speechSynthesis.getVoices();
  const langPrefix = lang.split('-')[0];
  const langVoices = voices.filter(v => v.lang.startsWith(langPrefix));
  const voicePool = langVoices.length > 0 ? langVoices : voices;
  
  // Classify voice quality tiers
  const isNeural = (v) => /Natural|Neural|Enhanced|Premium|Google|Online|Wavenet/i.test(v.name);
  const isMaleVoice = (v) => /\bMale\b|Guy|David|Daniel|Alex|Matthew|Brian|Mark|Andrew|James|Christopher|Eric|Ryan|Adam|George|Thomas|William/i.test(v.name);
  const isFemaleVoice = (v) => /\bFemale\b|Aria|Jenny|Zira|Samantha|Joanna|Salli|Kendra|Ivy|Amy|Emma|Lucy|Olivia|Susan|Hazel|Karen|Catherine|Moira|Tessa|Victoria/i.test(v.name);
  const isBritish = (v) => /UK|British|George|Hazel|Daniel|en-GB|en_GB/i.test(v.name) || v.lang === 'en-GB';
  
  // Smart voice finder: tries neural first, then any match, then fallback
  const findVoice = (matcher) => {
    return voicePool.find(v => matcher(v) && isNeural(v))
        || voicePool.find(v => matcher(v))
        || voicePool[0];
  };

  // ─── Theme-Specific Voice Profiles ────────────────────────────
  // Each theme gets a radically different voice personality
  let preferredVoice;

  switch (theme) {
    case 'male':
      utterance.pitch = 0.9;
      utterance.rate = 1.0;
      utterance.volume = 1.0;
      preferredVoice = findVoice(v => isMaleVoice(v) && !isBritish(v))
                    || findVoice(v => isMaleVoice(v))
                    || findVoice(v => !isFemaleVoice(v))
                    || voicePool[0];
      break;

    case 'female':
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
      utterance.volume = 1.0;
      preferredVoice = findVoice(v => isFemaleVoice(v) && !isBritish(v))
                    || findVoice(v => isFemaleVoice(v))
                    || findVoice(v => !isMaleVoice(v))
                    || voicePool[0];
      break;

    case 'jarvis':
      utterance.pitch = 0.8;
      utterance.rate = 1.0;
      utterance.volume = 0.95;
      preferredVoice = findVoice(v => isBritish(v) && isMaleVoice(v))
                    || findVoice(v => isBritish(v))
                    || findVoice(v => isMaleVoice(v));
      break;

    case 'cyber':
      utterance.pitch = 0.5;
      utterance.rate = 0.9;
      utterance.volume = 1.0;
      preferredVoice = findVoice(v => /Mark|Zira|Microsoft Desktop/i.test(v.name))
                    || findVoice(v => isMaleVoice(v));
      break;

    case 'minimal':
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
      utterance.volume = 0.85;
      preferredVoice = findVoice(v => isNeural(v))
                    || voicePool[0];
      break;

    case 'anime':
      utterance.pitch = 1.2;
      utterance.rate = 1.1;
      utterance.volume = 1.0;
      preferredVoice = findVoice(v => isFemaleVoice(v) && /Ivy|Emily|Samantha|Jenny|Aria/i.test(v.name))
                    || findVoice(v => isFemaleVoice(v));
      break;

    default:
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
      preferredVoice = voicePool[0];
      break;
  }

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.cancel(); // Stop any current speaking
  
  // Sync avatar state
  utterance.onstart = () => {
    useChatStore.getState().setIsSpeakingAudio(true);
  };
  utterance.onend = () => {
    useChatStore.getState().setIsSpeakingAudio(false);
  };
  utterance.onerror = () => {
    useChatStore.getState().setIsSpeakingAudio(false);
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
  isVoiceModeEnabled: false,
  toggleVoiceMode: () => set(state => ({ isVoiceModeEnabled: !state.isVoiceModeEnabled })),
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
  sendMessage: async (text, attachedDoc = null) => {
    const { activeChat, messages } = get();
    
    // Play SFX
    sfx.playSendMsg();

    // Optimistic UI update — add user message immediately
    const tempUserMsgId = `user_${Date.now()}`;
    const tempAiMsgId = `ai_${Date.now()}`;

    // If message is empty but there's a doc, set a default visible text
    const visibleText = text || (attachedDoc ? `Uploaded file: ${attachedDoc.originalName}` : '');

    const newUserMsg = { 
      _id: tempUserMsgId, 
      role: 'user', 
      content: visibleText, 
      timestamp: new Date(),
      attachedDocument: attachedDoc ? attachedDoc._id : undefined,
      attachedDocDetails: attachedDoc // temp store for UI rendering if needed
    };
    
    const newAiMsg  = { _id: tempAiMsgId, role: 'assistant', content: '', timestamp: new Date(), isStreaming: true };

    set({ messages: [...messages, newUserMsg, newAiMsg], isStreaming: true, isThinking: true });

    const token = localStorage.getItem('token');
    const url = `${BASE_URL}/api/chat/stream`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          message: visibleText,
          mode: 'auto',
          chatId: activeChat?._id || undefined,
          attachedDocId: attachedDoc?._id || undefined
        })
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
