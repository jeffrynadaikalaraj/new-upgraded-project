import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Zap, X } from 'lucide-react';

export default function FocusMode({ activeEvent, onComplete, onClose }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins default
  const [isActive, setIsActive] = useState(false);
  const [focusTimeSpent, setFocusTimeSpent] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
        setFocusTimeSpent(time => time + 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const handleComplete = () => {
    setIsActive(false);
    const minutesFocused = Math.round(focusTimeSpent / 60);
    
    // Always mark as completed if they finish or manually stop it
    onComplete(activeEvent._id, {
      ...activeEvent,
      focusTimeSpent: (activeEvent.focusTimeSpent || 0) + minutesFocused,
      isCompleted: true
    });
    
    onClose();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!activeEvent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in zoom-in duration-300">
      <div className="bg-slate-900 border border-slate-700/50 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative text-center">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors bg-slate-800 rounded-full p-2">
          <X size={20} />
        </button>
        
        <div className="w-20 h-20 mx-auto bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-6 shadow-inner border border-indigo-500/20">
          <Zap size={40} />
        </div>
        
        <h2 className="text-3xl font-extrabold text-white mb-2">Focus Session</h2>
        <p className="text-slate-400 mb-10 font-medium text-lg">{activeEvent.title}</p>
        
        <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-400 mb-12 tracking-tighter drop-shadow-lg tabular-nums">
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={toggleTimer}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${isActive ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 border border-emerald-500/30'}`}
          >
            {isActive ? <Pause size={32} className="fill-current" /> : <Play size={32} className="fill-current ml-2" />}
          </button>
          
          <button 
            onClick={handleComplete}
            className="w-20 h-20 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-all shadow-lg border border-slate-700"
          >
            <Square size={28} className="fill-current" />
          </button>
        </div>
        
        <p className="text-xs text-slate-500 mt-10 font-bold uppercase tracking-[0.2em]">
          Block distractions. Stay focused.
        </p>
      </div>
    </div>
  );
}
