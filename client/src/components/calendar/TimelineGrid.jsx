import React, { useState, useMemo } from 'react';
import { format, isSameDay, addDays, startOfWeek, subWeeks, addWeeks } from 'date-fns';
import { DndContext, useDraggable, useDroppable, DragOverlay, pointerWithin } from '@dnd-kit/core';
import { Clock } from 'lucide-react';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const DraggableEvent = ({ event, categoryColor, height, top, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event._id,
    data: { event }
  });

  const style = {
    height: `${height}px`,
    top: `${top}px`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 50 : 10,
    opacity: isDragging ? 0 : 1, // Hide original when dragging (overlay is used)
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => { e.stopPropagation(); onClick(event); }}
      className={`absolute left-2 right-2 rounded-lg border-l-4 p-2 shadow-sm cursor-grab active:cursor-grabbing backdrop-blur-md transition-shadow hover:brightness-110 ${categoryColor} ${event.isCompleted ? 'grayscale opacity-60' : ''}`}
    >
      <div className="font-semibold text-xs truncate leading-tight">{event.title}</div>
      <div className="text-[10px] opacity-80 mt-1 flex items-center gap-1 font-medium tracking-wide">
        <Clock size={10} />
        {format(new Date(event.startTime), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
      </div>
    </div>
  );
};

const DroppableColumn = ({ day, events, onEventClick, getCategoryColor }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: format(day, 'yyyy-MM-dd'),
    data: { date: day }
  });

  return (
    <div ref={setNodeRef} className={`flex-1 border-r border-slate-700/50 relative min-w-[120px] transition-colors ${isOver ? 'bg-indigo-500/5' : ''}`}>
      {HOURS.map(hour => (
        <div key={hour} className="h-14 border-b border-slate-700/30 w-full hover:bg-slate-800/30 transition-colors"></div>
      ))}
      
      {/* Events Layer */}
      {events.map(event => {
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        
        // 1 hour = 56px (h-14 is 3.5rem = 56px in Tailwind)
        const top = (startMinutes / 60) * 56;
        const height = Math.max((durationMinutes / 60) * 56, 24);

        return (
          <DraggableEvent 
            key={event._id} 
            event={event} 
            categoryColor={getCategoryColor(event.category)}
            top={top}
            height={height}
            onClick={onEventClick}
          />
        );
      })}
    </div>
  );
};

export default function TimelineGrid({ events, view, currentDate, onEventUpdate, onEventClick }) {
  const [activeId, setActiveId] = useState(null);

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  const days = useMemo(() => {
    if (view === 'Day') return [currentDate];
    return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  }, [view, currentDate, startDate]);

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Study': return 'border-blue-500 bg-blue-500/20 text-blue-200 border border-blue-500/30';
      case 'Fitness': return 'border-emerald-500 bg-emerald-500/20 text-emerald-200 border border-emerald-500/30';
      case 'Work': return 'border-purple-500 bg-purple-500/20 text-purple-200 border border-purple-500/30';
      case 'Personal': return 'border-orange-500 bg-orange-500/20 text-orange-200 border border-orange-500/30';
      case 'Meeting': return 'border-rose-500 bg-rose-500/20 text-rose-200 border border-rose-500/30';
      default: return 'border-slate-500 bg-slate-500/20 text-slate-200 border border-slate-500/30';
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, delta, over } = event;
    setActiveId(null);
    
    if (!over) return; 

    const draggedEvent = active.data.current.event;
    
    // Calculate new time based on delta.y
    // 56px = 60 minutes
    const minutesDelta = Math.round(delta.y / 56 * 60 / 15) * 15; // snap to 15 min intervals
    
    let newStart = new Date(draggedEvent.startTime);
    let newEnd = new Date(draggedEvent.endTime);
    
    // Target day
    const targetDate = new Date(`${over.id}T00:00:00`);
    newStart.setFullYear(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    newEnd.setFullYear(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    newStart.setMinutes(newStart.getMinutes() + minutesDelta);
    newEnd.setMinutes(newEnd.getMinutes() + minutesDelta);

    // Prevent dragging to negative hours (previous day implicitly) or beyond 24h
    if (newStart.getDate() !== targetDate.getDate()) return;

    onEventUpdate(draggedEvent._id, {
      ...draggedEvent,
      startTime: newStart.toISOString(),
      endTime: newEnd.toISOString()
    });
  };

  const activeEvent = useMemo(() => events.find(e => e._id === activeId), [activeId, events]);

  return (
    <div className="flex flex-col h-[700px] bg-slate-900/60 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="flex border-b border-slate-700/50 bg-slate-800/40">
        <div className="w-16 shrink-0 border-r border-slate-700/50"></div>
        {days.map(day => (
          <div key={day.toISOString()} className="flex-1 p-3 text-center border-r border-slate-700/50 last:border-r-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{format(day, 'EEE')}</p>
            <div className="flex justify-center">
              <p className={`w-8 h-8 flex items-center justify-center rounded-full text-lg font-bold ${isSameDay(day, new Date()) ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-200'}`}>
                {format(day, 'd')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex">
        <DndContext 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
          collisionDetection={pointerWithin}
        >
          {/* Time Labels */}
          <div className="w-16 shrink-0 border-r border-slate-700/50 bg-slate-800/20">
            {HOURS.map(hour => (
              <div key={hour} className="h-14 relative">
                <span className="absolute -top-2.5 right-2 text-[10px] text-slate-500 font-bold tracking-wider">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour-12} PM`}
                </span>
              </div>
            ))}
          </div>

          {/* Columns */}
          <div className="flex-1 flex relative">
            {days.map(day => {
              const dayEvents = events.filter(e => isSameDay(new Date(e.startTime), day));
              return (
                <DroppableColumn 
                  key={day.toISOString()} 
                  day={day} 
                  events={dayEvents} 
                  getCategoryColor={getCategoryColor}
                  onEventClick={onEventClick}
                />
              );
            })}
          </div>

          {/* Drag Overlay (Visual representation while dragging) */}
          <DragOverlay dropAnimation={null}>
            {activeEvent ? (
              <div 
                className={`rounded-lg border-l-4 p-2 shadow-2xl backdrop-blur-md opacity-90 scale-105 cursor-grabbing ${getCategoryColor(activeEvent.category)}`} 
                style={{ 
                  height: Math.max(((new Date(activeEvent.endTime).getTime() - new Date(activeEvent.startTime).getTime()) / (1000 * 60) / 60) * 56, 24) 
                }}
              >
                 <div className="font-semibold text-xs truncate leading-tight">{activeEvent.title}</div>
                 <div className="text-[10px] opacity-80 mt-1 flex items-center gap-1 font-medium">
                    <Clock size={10} /> Drag to reschedule
                 </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
