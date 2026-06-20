import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { format, addDays, startOfWeek, subWeeks, addWeeks, isSameDay } from 'date-fns';

const CalendarGrid = ({ events, onEventClick, onToggleComplete }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('Week'); // Week, Agenda

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Study': return 'border-blue-500 bg-blue-500/10 text-blue-300';
      case 'Fitness': return 'border-green-500 bg-green-500/10 text-green-300';
      case 'Work': return 'border-purple-500 bg-purple-500/10 text-purple-300';
      case 'Personal': return 'border-orange-500 bg-orange-500/10 text-orange-300';
      case 'Meeting': return 'border-red-500 bg-red-500/10 text-red-300';
      default: return 'border-slate-500 bg-slate-500/10 text-slate-300';
    }
  };

  const handlePrev = () => {
    if (view === 'Week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, -1));
  };
  
  const handleNext = () => {
    if (view === 'Week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const renderWeekView = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(startDate, i));
    }
    
    return (
      <div className="grid grid-cols-7 gap-4">
        {days.map((day, idx) => {
          const dayEvents = events.filter(e => isSameDay(new Date(e.startTime), day)).sort((a,b) => new Date(a.startTime) - new Date(b.startTime));
          return (
            <div key={idx} className="flex flex-col h-[600px] border border-slate-700/50 rounded-xl bg-slate-800/20 overflow-hidden">
              <div className="p-3 text-center border-b border-slate-700/50 bg-slate-800/40">
                <p className="text-xs text-slate-400 font-semibold uppercase">{format(day, 'EEE')}</p>
                <p className={`text-xl font-bold ${isSameDay(day, new Date()) ? 'text-indigo-400' : 'text-slate-200'}`}>
                  {format(day, 'd')}
                </p>
              </div>
              <div className="p-2 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                {dayEvents.map(event => (
                  <div 
                    key={event._id} 
                    className={`p-2 rounded-lg border-l-4 text-xs cursor-pointer transition-all hover:brightness-110 ${getCategoryColor(event.category)} ${event.isCompleted ? 'opacity-50 grayscale' : ''}`}
                    onClick={() => onEventClick && onEventClick(event)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold truncate pr-1">{event.title}</span>
                      <button onClick={(e) => { e.stopPropagation(); onToggleComplete(event); }} className="text-slate-400 hover:text-white shrink-0">
                        <CheckCircle size={14} className={event.isCompleted ? 'text-emerald-500 fill-emerald-500/20' : ''} />
                      </button>
                    </div>
                    <div className="text-slate-400 font-medium">
                      {format(new Date(event.startTime), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAgendaView = () => {
    // Group all events by date
    const grouped = events.reduce((acc, event) => {
      const d = format(new Date(event.startTime), 'yyyy-MM-dd');
      if (!acc[d]) acc[d] = [];
      acc[d].push(event);
      return acc;
    }, {});
    
    const sortedDates = Object.keys(grouped).sort();

    if (sortedDates.length === 0) {
      return <div className="flex h-full items-center justify-center text-slate-500">No events scheduled.</div>;
    }

    return (
      <div className="space-y-6 max-w-3xl mx-auto h-[600px] overflow-y-auto custom-scrollbar p-4">
        {sortedDates.map(date => (
          <div key={date}>
            <h3 className="text-sm font-bold text-slate-300 border-b border-slate-700/50 pb-2 mb-3 sticky top-0 bg-slate-900 z-10 pt-2">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h3>
            <div className="space-y-3">
              {grouped[date].map(event => (
                <div key={event._id} className={`p-4 rounded-xl border flex items-center justify-between transition-all hover:brightness-110 ${getCategoryColor(event.category)} ${event.isCompleted ? 'opacity-50 grayscale' : ''}`}>
                   <div>
                     <p className="font-bold text-sm mb-1">{event.title}</p>
                     <p className="text-xs opacity-80">{format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}</p>
                   </div>
                   <button onClick={() => onToggleComplete(event)} className="p-2 rounded-full hover:bg-slate-800/50 transition-colors">
                     <CheckCircle size={24} className={event.isCompleted ? 'text-emerald-500 fill-emerald-500/20' : 'text-slate-400'} />
                   </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button onClick={handlePrev} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 shadow-sm border border-slate-700">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-white w-48 text-center drop-shadow-sm">
            {view === 'Week' ? `${format(startDate, 'MMM d')} - ${format(addDays(startDate, 6), 'MMM d, yyyy')}` : format(currentDate, 'MMMM d, yyyy')}
          </h2>
          <button onClick={handleNext} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 shadow-sm border border-slate-700">
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div className="flex bg-slate-800/80 rounded-lg p-1 border border-slate-700/50 shadow-inner">
          {['Week', 'Agenda'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${view === v ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl p-4 backdrop-blur-md">
        {view === 'Week' ? renderWeekView() : renderAgendaView()}
      </div>
    </div>
  );
};

export default CalendarGrid;
