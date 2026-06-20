import React from 'react';
import { format, subDays, startOfWeek } from 'date-fns';
import { Activity } from 'lucide-react';

const CalendarHeatmap = ({ events }) => {
  // Generate exactly 12 weeks of data (84 days) to fit cleanly
  const today = new Date();
  const days = Array.from({ length: 84 }, (_, i) => subDays(today, 83 - i));

  // Compute completed events per day
  const completions = events?.reduce((acc, event) => {
    if (event.isCompleted) {
      const d = format(new Date(event.startTime), 'yyyy-MM-dd');
      acc[d] = (acc[d] || 0) + 1;
    }
    return acc;
  }, {}) || {};

  const getColor = (count) => {
    if (!count || count === 0) return 'bg-slate-800 border-slate-700/30';
    if (count === 1) return 'bg-indigo-900 border-indigo-800/50';
    if (count <= 3) return 'bg-indigo-700 border-indigo-600/50';
    if (count <= 5) return 'bg-indigo-500 border-indigo-400/50';
    return 'bg-indigo-400 border-indigo-300 shadow-[0_0_8px_rgba(129,140,248,0.5)]';
  };

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 shadow-lg backdrop-blur-md h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b border-slate-700/50 pb-4 shrink-0">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="text-indigo-400" size={20} />
          Activity Heatmap
        </h3>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last 12 Weeks</span>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5">
          {days.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const count = completions[dateStr] || 0;
            return (
              <div 
                key={idx}
                title={`${dateStr}: ${count} tasks completed`}
                className={`w-4 h-4 rounded-[4px] border transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer ${getColor(count)}`}
              />
            );
          })}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-6 text-xs font-medium text-slate-500 justify-end shrink-0">
        <span className="uppercase tracking-widest mr-1">Less</span>
        <div className="w-3 h-3 rounded-sm bg-slate-800 border border-slate-700"></div>
        <div className="w-3 h-3 rounded-sm bg-indigo-900 border border-indigo-800"></div>
        <div className="w-3 h-3 rounded-sm bg-indigo-700 border border-indigo-600"></div>
        <div className="w-3 h-3 rounded-sm bg-indigo-500 border border-indigo-400"></div>
        <div className="w-3 h-3 rounded-sm bg-indigo-400 border border-indigo-300"></div>
        <span className="uppercase tracking-widest ml-1">More</span>
      </div>
    </div>
  );
};

export default CalendarHeatmap;
