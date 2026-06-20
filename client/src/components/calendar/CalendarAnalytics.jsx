import React from 'react';
import { TrendingUp, BarChart2, Activity } from 'lucide-react';

const CalendarAnalytics = ({ analytics }) => {
  if (!analytics) return null;

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between mb-6 border-b border-slate-700/50 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart2 className="text-indigo-400" size={20} />
          Calendar Analytics
        </h3>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">This Week</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Goal Progress Visualization Example */}
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-200">Learn Java</h4>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">80%</span>
          </div>
          
          <div className="w-full bg-slate-900 rounded-full h-2 mb-5 overflow-hidden shadow-inner">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-1000" style={{ width: '80%' }}></div>
          </div>
          
          <div className="flex justify-between text-xs text-slate-400">
            <div>
              <p className="font-semibold uppercase tracking-wider mb-1">Scheduled</p>
              <p className="text-slate-200 font-medium">15 hrs</p>
            </div>
            <div className="text-right">
              <p className="font-semibold uppercase tracking-wider mb-1">Completed</p>
              <p className="text-emerald-400 font-bold">12 hrs</p>
            </div>
          </div>
        </div>

        {/* Most Productive Day */}
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 shadow-inner flex flex-col justify-center group hover:bg-slate-800/80 transition-colors">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <TrendingUp className="text-indigo-400" size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Most Productive Day</p>
              <p className="text-2xl font-bold text-slate-200">Tuesday</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">You completed 8 tasks on average on Tuesdays.</p>
        </div>

        {/* Fitness Consistency */}
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 shadow-inner flex flex-col justify-center group hover:bg-slate-800/80 transition-colors">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Activity className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Fitness Consistency</p>
              <p className="text-2xl font-bold text-slate-200">High</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">You hit 4 out of 5 scheduled workouts this week.</p>
        </div>

      </div>
    </div>
  );
};

export default CalendarAnalytics;
