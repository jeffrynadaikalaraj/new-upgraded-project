import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, Info } from 'lucide-react';

const typeColors = {
  habit: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  goal_work: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  break: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  free: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
  custom: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
};

const TimeBlock = ({ block, onToggle }) => {
  const [expanded, setExpanded] = useState(false);
  const colors = typeColors[block.type] || typeColors.custom;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`relative bg-slate-800/50 backdrop-blur-md border rounded-xl overflow-hidden transition-all duration-300 shadow-lg ${
        block.completed 
          ? 'border-emerald-500/30 shadow-emerald-500/5 opacity-80' 
          : 'border-slate-700/50 hover:border-slate-600/70 hover:shadow-indigo-500/5'
      }`}
    >
      <div className="flex items-start p-4 gap-4">
        {/* Time Sidebar */}
        <div className="flex flex-col items-center justify-center w-16 flex-shrink-0 text-slate-400 font-medium">
          <span className="text-sm">{block.startTime}</span>
          <span className="text-xs text-slate-600 my-1">to</span>
          <span className="text-sm">{block.endTime}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
              {block.type.replace('_', ' ')}
            </span>
          </div>
          <h3 className={`text-base font-bold truncate leading-tight ${block.completed ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
            {block.title}
          </h3>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {block.aiNotes && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-all"
              title="AI Notes"
            >
              {expanded ? <ChevronUp size={16} /> : <Info size={16} />}
            </button>
          )}
          
          <button
            onClick={() => onToggle(block._id, !block.completed)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${
              block.completed
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-700 text-slate-400 border border-slate-600 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30'
            }`}
          >
            <Check size={16} className={block.completed ? 'opacity-100 scale-100' : 'opacity-0 scale-50 transition-all group-hover:opacity-50 group-hover:scale-75'} />
          </button>
        </div>
      </div>

      {/* AI Notes Expanded Area */}
      <AnimatePresence>
        {expanded && block.aiNotes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-700/50 bg-slate-800/80 p-4"
          >
            <p className="text-xs text-slate-400 flex items-start gap-2 leading-relaxed">
              <span className="text-indigo-400 font-bold">AI:</span> {block.aiNotes}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TimeBlock;
