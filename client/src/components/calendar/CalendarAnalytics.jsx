import React from 'react';
import { TrendingUp, BarChart2, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CalendarAnalytics = ({ analytics }) => {
  if (!analytics) return null;

  // Mock data for the chart. In a production setting this would be aggregated in the backend.
  const focusData = [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 3.8 },
    { day: 'Wed', hours: 1.2 },
    { day: 'Thu', hours: 4.5 },
    { day: 'Fri', hours: 3.0 },
    { day: 'Sat', hours: 1.0 },
    { day: 'Sun', hours: 0.5 },
  ];

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 shadow-lg backdrop-blur-md h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b border-slate-700/50 pb-4 shrink-0">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart2 className="text-indigo-400" size={20} />
          Calendar Analytics
        </h3>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">This Week</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
        
        {/* Chart */}
        <div className="xl:col-span-2 bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 shadow-inner flex flex-col">
          <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Zap className="text-amber-400" size={16} /> Focus Hours Trend
          </h4>
          <div className="flex-1 min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {focusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.hours > 3 ? '#818cf8' : '#4f46e5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Productive Day */}
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 shadow-inner flex flex-col justify-center group hover:bg-slate-800/80 transition-colors">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <TrendingUp className="text-indigo-400" size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Most Productive</p>
              <p className="text-2xl font-bold text-slate-200">{analytics.mostProductiveDay || 'N/A'}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Based on task completion volume.</p>
          
          <div className="mt-6 pt-4 border-t border-slate-700/50 space-y-2">
             <div className="flex justify-between text-sm">
               <span className="text-slate-400">Total Focus Time</span>
               <span className="text-indigo-400 font-bold">{analytics.focusTimeSpent || 0} hrs</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-slate-400">Study Hours</span>
               <span className="text-blue-400 font-bold">{analytics.studyHours || 0} hrs</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-slate-400">Fitness Hours</span>
               <span className="text-emerald-400 font-bold">{analytics.fitnessHours || 0} hrs</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CalendarAnalytics;
