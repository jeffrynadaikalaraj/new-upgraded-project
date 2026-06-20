import React, { useState } from 'react';
import { Sparkles, Send, AlertTriangle, Clock, CalendarDays, BrainCircuit } from 'lucide-react';

const AIAssistantSidebar = ({ onGenerateDaily, onGenerateWeekly, conflictWarning, onAcceptConflict, onDismissConflict, analytics }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    await onGenerateDaily(prompt);
    setIsGenerating(false);
    setPrompt('');
  };

  const handleGenerateWeekly = async () => {
    setIsGenerating(true);
    await onGenerateWeekly(prompt || 'Plan my perfect week based on my goals');
    setIsGenerating(false);
    setPrompt('');
  };

  return (
    <div className="flex flex-col h-[700px] bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 overflow-hidden shadow-lg backdrop-blur-md relative">
      <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="text-indigo-400" size={20} />
          <h3 className="text-lg font-bold text-white">AI Assistant</h3>
        </div>
        <button 
          onClick={handleGenerateWeekly}
          disabled={isGenerating}
          className="flex items-center gap-1.5 text-xs font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg transition-colors border border-indigo-500/30"
        >
          <CalendarDays size={14} /> Plan Week
        </button>
      </div>
      
      {/* Messages / AI Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-4 pr-1">
        
        {/* Free Time Finder */}
        {analytics?.freeTime && (
          <div className="bg-slate-800/80 rounded-xl p-3 text-sm text-slate-300 border border-slate-700/50 shadow-sm leading-relaxed flex items-start gap-3">
             <div className="mt-0.5 shrink-0"><BrainCircuit size={16} className="text-emerald-400"/></div>
             <div>
               <p className="font-semibold text-emerald-400 mb-1">Free Time Finder</p>
               <p className="text-xs">You have <span className="font-bold text-white">{analytics.freeTime.today}h</span> free today and <span className="font-bold text-white">{analytics.freeTime.thisWeek}h</span> this week.</p>
               <p className="text-xs mt-1 italic text-slate-400">"Schedule 2 hours of React coding this evening"</p>
             </div>
          </div>
        )}

        {/* Conflict Warning Area */}
        {conflictWarning && (
          <div className="bg-rose-500/10 rounded-xl p-4 border border-rose-500/30 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold mb-2">
              <AlertTriangle size={18} /> Conflict Detected
            </div>
            <p className="text-sm text-slate-300 mb-3 leading-relaxed font-medium">
              This event overlaps with existing schedules. Smart Resolution:
            </p>
            <div className="space-y-2">
              {conflictWarning.suggestedSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => onAcceptConflict(slot)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-indigo-500 transition-all group shadow-sm"
                >
                  <span className="text-sm text-slate-200 flex items-center gap-2 font-medium">
                    <Clock size={16} className="text-indigo-400" />
                    Move to {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                  </span>
                  <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-wider">Fix</span>
                </button>
              ))}
            </div>
            <button onClick={onDismissConflict} className="mt-4 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors w-full text-center uppercase tracking-wider">
              Ignore & Overlap
            </button>
          </div>
        )}

      </div>

      {/* Input Area */}
      <div className="relative mt-auto shrink-0">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Study Java 10 hours this week..."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none h-24 shadow-inner custom-scrollbar pr-12 placeholder:text-slate-600"
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="absolute bottom-3 right-3 p-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors shadow-md"
        >
          {isGenerating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
};

export default AIAssistantSidebar;
