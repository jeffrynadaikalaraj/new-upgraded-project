import React, { useState } from 'react';
import { Flame, Check, RotateCcw, Edit2, Archive, ChevronDown, ChevronUp, Repeat } from 'lucide-react';
import StreakCalendar from './StreakCalendar';

const categoryColors = {
  health:        { bg: 'bg-emerald-500/10',  text: 'text-emerald-400',  border: 'border-emerald-500/30' },
  fitness:       { bg: 'bg-orange-500/10',   text: 'text-orange-400',   border: 'border-orange-500/30' },
  productivity:  { bg: 'bg-blue-500/10',     text: 'text-blue-400',     border: 'border-blue-500/30' },
  mindfulness:   { bg: 'bg-violet-500/10',   text: 'text-violet-400',   border: 'border-violet-500/30' },
  learning:      { bg: 'bg-purple-500/10',   text: 'text-purple-400',   border: 'border-purple-500/30' },
  other:         { bg: 'bg-slate-500/10',    text: 'text-slate-400',    border: 'border-slate-500/30' },
};

const frequencyLabel = { daily: 'Daily', weekly: 'Weekly', custom: 'Custom' };

const HabitCard = ({ habit, onEdit, onArchive, onComplete, onUncomplete }) => {
  const [expanded, setExpanded] = useState(false);
  const [completing, setCompleting] = useState(false);

  const colors = categoryColors[habit.category] || categoryColors.other;
  const todayDone = habit.todayCompleted;
  const accentColor = habit.color || '#6366f1';

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (completing) return;
    setCompleting(true);
    try {
      if (todayDone) {
        await onUncomplete(habit._id);
      } else {
        await onComplete(habit._id);
      }
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div
      className={`bg-slate-800/50 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl group ${
        todayDone
          ? 'border-emerald-500/30 shadow-emerald-500/5'
          : 'border-slate-700/50 hover:border-slate-600/70'
      }`}
    >
      {/* Color accent top bar */}
      <div
        className="h-1 w-full transition-all duration-500"
        style={{ backgroundColor: todayDone ? '#10b981' : accentColor, opacity: todayDone ? 1 : 0.6 }}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-4">
          {/* Icon */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-inner"
            style={{ backgroundColor: `${accentColor}20`, border: `1px solid ${accentColor}40` }}
          >
            {habit.icon}
          </div>

          {/* Title & meta */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-100 truncate leading-tight">{habit.title}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
              >
                {habit.category}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <Repeat size={10} />
                {frequencyLabel[habit.frequency]}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(habit); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
              title="Edit"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onArchive(habit._id); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-400/10 transition-all opacity-0 group-hover:opacity-100"
              title="Archive"
            >
              <Archive size={13} />
            </button>
          </div>
        </div>

        {/* Streak row */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <Flame
              size={16}
              className={habit.streak?.current > 0 ? 'text-orange-400' : 'text-slate-600'}
            />
            <span className={`text-sm font-bold ${habit.streak?.current > 0 ? 'text-orange-400' : 'text-slate-600'}`}>
              {habit.streak?.current ?? 0}
            </span>
            <span className="text-xs text-slate-500">day streak</span>
          </div>
          {habit.streak?.longest > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <span>Best:</span>
              <span className="text-slate-500 font-medium">{habit.streak.longest}d</span>
            </div>
          )}
        </div>

        {/* Footer: complete button + expand */}
        <div className="flex items-center justify-between gap-3">
          {/* Complete / Undo button */}
          <button
            onClick={handleToggle}
            disabled={completing}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              completing
                ? 'opacity-50 cursor-not-allowed bg-slate-700'
                : todayDone
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
            }`}
          >
            {todayDone ? (
              <>
                <Check size={15} className="transition-all" />
                Done today
              </>
            ) : (
              <>
                <Check size={15} />
                Mark complete
              </>
            )}
          </button>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-all"
            title={expanded ? 'Collapse' : 'Show calendar'}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Expanded calendar */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-200">
            {habit.description && (
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">{habit.description}</p>
            )}
            <StreakCalendar completionLog={habit.completionLog} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitCard;
