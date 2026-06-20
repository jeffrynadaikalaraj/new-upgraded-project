import React, { useState } from 'react';
import { Sparkles, Send, AlertTriangle, Clock } from 'lucide-react';
import Button from '../ui/Button';

const AIAssistantSidebar = ({ onGenerate, conflictWarning, onAcceptConflict, onDismissConflict }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    await onGenerate(prompt);
    setIsGenerating(false);
    setPrompt('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 overflow-hidden shadow-lg backdrop-blur-md relative">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-700/50 pb-3">
        <Sparkles className="text-indigo-400" size={20} />
        <h3 className="text-lg font-bold text-white">AI Assistant</h3>
      </div>
      
      {/* Messages / AI Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-4 pr-1">
        <div className="bg-slate-800/80 rounded-xl p-3 text-sm text-slate-300 border border-slate-700/50 shadow-sm leading-relaxed">
          Hi! I can schedule your day or week. Just tell me what you need.
          <br/><br/>
          <span className="text-slate-500 italic">"Schedule 2 hours of React coding this evening"</span>
        </div>

        {/* Memory Prompt Suggestion Example */}
        <div className="bg-indigo-500/10 rounded-xl p-3 text-sm text-indigo-200 border border-indigo-500/20 flex gap-3 shadow-inner">
           <div className="mt-0.5 shrink-0"><Sparkles size={14} className="text-indigo-400"/></div>
           <div>
             <p className="leading-relaxed">I noticed you usually study Java at 7 PM. Would you like me to schedule that for today?</p>
             <div className="mt-3 flex gap-2">
               <button className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md text-xs font-semibold transition-colors shadow-sm">Yes, schedule</button>
               <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md text-xs font-semibold transition-colors shadow-sm">Not today</button>
             </div>
           </div>
        </div>

        {/* Conflict Warning Area */}
        {conflictWarning && (
          <div className="bg-rose-500/10 rounded-xl p-4 border border-rose-500/30 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold mb-2">
              <AlertTriangle size={18} /> Conflict Detected
            </div>
            <p className="text-sm text-slate-300 mb-3 leading-relaxed">
              This event overlaps with existing schedules. Here are alternative slots:
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
                    {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                  </span>
                  <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-wider">Select</span>
                </button>
              ))}
            </div>
            <button onClick={onDismissConflict} className="mt-4 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors w-full text-center uppercase tracking-wider">
              Ignore & Schedule anyway
            </button>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="relative mt-auto shrink-0">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Tell me what to schedule..."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none h-24 shadow-inner custom-scrollbar pr-12"
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="absolute bottom-3 right-3 p-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors shadow-md"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default AIAssistantSidebar;
