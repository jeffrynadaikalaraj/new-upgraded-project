import React from 'react';
import { Brain, Calendar, Heart, Zap, Lightbulb, Star } from 'lucide-react';

const TYPE_META = {
  fact:       { label: 'Fact',       color: 'text-sky-400',    bg: 'bg-sky-500/10  border-sky-500/20',    icon: Zap },
  preference: { label: 'Preference', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', icon: Heart },
  event:      { label: 'Event',      color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20',  icon: Calendar },
  insight:    { label: 'Insight',    color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/20', icon: Lightbulb },
  profile:    { label: 'Profile',    color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', icon: Brain },
};

const MemoryTimeline = ({ memories }) => {
  // Group memories by Month Year
  const sortedMemories = [...memories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const grouped = sortedMemories.reduce((acc, memory) => {
    const date = new Date(memory.createdAt);
    const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(memory);
    return acc;
  }, {});

  return (
    <div className="relative border-l border-slate-700/50 ml-4 md:ml-6 pb-8 space-y-10">
      {Object.entries(grouped).map(([monthYear, items]) => (
        <div key={monthYear} className="relative">
          {/* Month Marker */}
          <div className="absolute -left-[33px] top-0 bg-slate-900 px-2 py-1">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{monthYear}</span>
          </div>

          <div className="mt-8 space-y-6">
            {items.map(memory => {
              const tm = TYPE_META[memory.type] || TYPE_META.fact;
              const Icon = tm.icon;
              
              return (
                <div key={memory._id} className="relative pl-8 md:pl-10 group">
                  {/* Timeline Dot */}
                  <div className={`absolute left-[-21px] top-1.5 w-3 h-3 rounded-full border-2 border-slate-900 ${tm.bg.split(' ')[0].replace('/10', '/80')}`} />
                  
                  {/* Card */}
                  <div className="glass rounded-xl p-4 border border-slate-700/40 hover:border-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tm.bg} ${tm.color}`}>
                        <Icon size={10} />
                        {tm.label}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(memory.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      </span>
                      {memory.importance >= 8 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-rose-400">
                          <Star size={10} className="fill-rose-400/20" /> Core
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {memory.content}
                    </p>
                    
                    {memory.key && memory.value && (
                      <div className="mt-2 text-xs bg-slate-800/50 inline-block px-2 py-1 rounded border border-slate-700/50">
                        <span className="text-slate-400">{memory.key}:</span> <span className="text-slate-200 font-medium">{memory.value}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemoryTimeline;
