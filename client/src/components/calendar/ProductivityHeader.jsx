import React from 'react';
import { Target, Clock, CheckCircle2, ListTodo } from 'lucide-react';

const ProductivityHeader = ({ analytics }) => {
  if (!analytics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Focus Score</p>
          <p className="text-2xl font-bold text-emerald-400">{analytics.focusScore}%</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Target className="text-emerald-500" size={20} />
        </div>
      </div>
      
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Scheduled</p>
          <p className="text-2xl font-bold text-indigo-400">{analytics.scheduledHours} <span className="text-sm font-normal text-slate-500">hrs</span></p>
        </div>
        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
          <Clock className="text-indigo-500" size={20} />
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Completed</p>
          <p className="text-2xl font-bold text-blue-400">{analytics.completedTasks} <span className="text-sm font-normal text-slate-500">tasks</span></p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
          <CheckCircle2 className="text-blue-500" size={20} />
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Free Time</p>
          <p className="text-2xl font-bold text-amber-400">{analytics.freeTime} <span className="text-sm font-normal text-slate-500">hrs</span></p>
        </div>
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
          <ListTodo className="text-amber-500" size={20} />
        </div>
      </div>
    </div>
  );
};

export default ProductivityHeader;
