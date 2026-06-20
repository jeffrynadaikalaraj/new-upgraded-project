import React, { useState } from 'react';
import { X, Wand2, Clock, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

const EXAMPLE_CHIPS = [
  { icon: '📚', text: 'Study 4 hours DSA' },
  { icon: '🏋️', text: 'Gym 1 hour' },
  { icon: '🇯🇵', text: 'JLPT N5 Practice' },
  { icon: '💻', text: 'Build Flutter Project' }
];

const CustomizePlanModal = ({ isOpen, onClose, onGenerate }) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [priorityLevel, setPriorityLevel] = useState('Mixed');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(customPrompt, wakeTime, sleepTime, priorityLevel);
  };

  const handleChipClick = (text) => {
    setCustomPrompt(prev => {
      const newText = prev ? `${prev}\n${text}` : text;
      return newText;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Wand2 size={20} className="text-indigo-400" />
            Customize Daily Plan
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="customize-form" onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                What do you want to do today?
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none h-28"
                placeholder="e.g. Allocate 2 hours for coding, 1 hour for gym, and 30 minutes for Japanese."
                autoFocus
              />
              
              <div className="mt-3 flex flex-wrap gap-2">
                {EXAMPLE_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChipClick(chip.text)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <span>{chip.icon}</span> {chip.text}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock size={14} /> Wake Up
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock size={14} /> Sleep
                </label>
                <input
                  type="time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Priority Focus</label>
              <select
                value={priorityLevel}
                onChange={(e) => setPriorityLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="Mixed">Mixed / Balanced</option>
                <option value="Study">Study</option>
                <option value="Work">Work</option>
                <option value="Fitness">Fitness</option>
              </select>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
          <Button variant="gradient" form="customize-form" type="submit" icon={Sparkles}>
            Generate Magic Plan
          </Button>
        </div>

      </div>
    </div>
  );
};

export default CustomizePlanModal;
