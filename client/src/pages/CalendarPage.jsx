import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Trash2, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useCalendarStore } from '../stores/calendarStore';
import { PageSkeleton } from '../components/common/LoadingSkeleton';
import Button from '../components/ui/Button';

const CalendarPage = () => {
  const { events, isLoading, fetchEvents, deleteEvent } = useCalendarStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (isLoading && events.length === 0) {
    return <PageSkeleton title="Smart Calendar" showHeader={false} />;
  }

  // Group events by date string
  const grouped = events.reduce((acc, event) => {
    const d = new Date(event.startTime);
    const dateStr = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(event);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));

  const getTypeColor = (type) => {
    switch(type) {
      case 'meeting': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'focus': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'reminder': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-900 w-full relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between p-8 pb-4 relative z-10 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CalendarIcon className="text-indigo-400" size={32} />
            Smart Calendar
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Your upcoming schedule, managed by AI.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* AI Banner */}
          <div className="mb-8 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-5 flex items-start gap-4 shadow-lg shadow-indigo-500/5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={20} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 mb-1">AI Scheduling Active</h3>
              <p className="text-sm text-slate-400">
                You can ask LifeOS to schedule events directly from the chat. It will automatically check for conflicts and book the time. Try asking: <span className="text-indigo-300 italic">"Schedule a meeting with the team tomorrow at 2 PM"</span>.
              </p>
            </div>
          </div>

          {events.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center">
               <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6">
                 <CalendarIcon size={32} className="text-slate-500" />
               </div>
               <h3 className="text-xl font-bold text-slate-200 mb-2">No upcoming events</h3>
               <p className="text-slate-400 text-sm">Your schedule is clear. Let the AI know if you need to plan something.</p>
             </div>
          ) : (
            <div className="space-y-8">
              {sortedDates.map((dateStr, idx) => (
                <div key={idx}>
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                    {dateStr}
                  </h3>
                  <div className="space-y-3">
                    {grouped[dateStr].map(event => {
                      const startTime = new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const endTime = new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={event._id}
                          className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-800/60 transition-colors group"
                        >
                          <div className="min-w-[100px] text-slate-400 flex items-center gap-2 text-sm">
                            <Clock size={14} className="text-slate-500" />
                            {event.isAllDay ? 'All Day' : startTime}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getTypeColor(event.type)}`}>
                                {event.type}
                              </span>
                              <h4 className="font-semibold text-slate-200 truncate">{event.title}</h4>
                            </div>
                            {event.description && (
                              <p className="text-xs text-slate-500 truncate">{event.description}</p>
                            )}
                          </div>

                          <button
                            onClick={() => deleteEvent(event._id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-2 bg-slate-800 rounded-lg border border-slate-700 hover:border-rose-500/50"
                            title="Cancel Event"
                          >
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
