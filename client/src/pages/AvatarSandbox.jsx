import React from 'react';
import AIAvatar from '../components/chat/AIAvatar';
import { useChatStore } from '../stores/chatStore';

const AvatarSandbox = () => {
  const { setAvatarEmotion, setIsUserTyping } = useChatStore();
  
  // A helper to force states
  const triggerState = (state) => {
    // Reset typing first
    setIsUserTyping(false);
    
    if (state === 'listening') {
      setAvatarEmotion('neutral');
      setIsUserTyping(true);
    } else {
      setAvatarEmotion(state);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white gap-12 w-full p-8 overflow-y-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Avatar Animation Sandbox</h1>
        <p className="text-slate-400">Click the buttons below to manually trigger emotion states.</p>
      </div>

      <div className="p-12 bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 relative">
        <AIAvatar size="large" />
      </div>

      <div className="flex flex-wrap gap-4 justify-center max-w-2xl">
        <button onClick={() => triggerState('neutral')} className="px-6 py-2 bg-slate-700 rounded-full hover:bg-slate-600 transition font-medium">Idle</button>
        <button onClick={() => triggerState('listening')} className="px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-500 transition font-medium">Listening</button>
        <button onClick={() => triggerState('thinking')} className="px-6 py-2 bg-amber-600 rounded-full hover:bg-amber-500 transition font-medium">Thinking</button>
        <button onClick={() => triggerState('speaking')} className="px-6 py-2 bg-emerald-600 rounded-full hover:bg-emerald-500 transition font-medium">Speaking</button>
        <button onClick={() => triggerState('happy')} className="px-6 py-2 bg-rose-500 rounded-full hover:bg-rose-400 transition font-medium">Happy</button>
        <button onClick={() => triggerState('excited')} className="px-6 py-2 bg-purple-600 rounded-full hover:bg-purple-500 transition font-medium">Excited</button>
        <button onClick={() => triggerState('error')} className="px-6 py-2 bg-red-600 rounded-full hover:bg-red-500 transition font-medium">Confused</button>
      </div>
      
      <p className="text-slate-400 text-sm mt-4">Move your mouse around to watch the eyes track you!</p>
    </div>
  );
};

export default AvatarSandbox;
