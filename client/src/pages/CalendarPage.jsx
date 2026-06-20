import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { useCalendarStore } from '../stores/calendarStore';
import { PageSkeleton } from '../components/common/LoadingSkeleton';
import ProductivityHeader from '../components/calendar/ProductivityHeader';
import CalendarGrid from '../components/calendar/CalendarGrid';
import AIAssistantSidebar from '../components/calendar/AIAssistantSidebar';
import CalendarAnalytics from '../components/calendar/CalendarAnalytics';
import CalendarHeatmap from '../components/calendar/CalendarHeatmap';
import FocusMode from '../components/calendar/FocusMode';
import Button from '../components/ui/Button';

const CalendarPage = () => {
  const { 
    events, 
    analytics, 
    isLoading, 
    fetchEvents, 
    fetchAnalytics,
    updateEvent,
    generateDaily,
    generateWeekly,
    conflictWarning,
    clearConflictWarning,
    createEvent
  } = useCalendarStore();

  const [activeFocusEvent, setActiveFocusEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
    const today = new Date().toISOString().split('T')[0];
    fetchAnalytics(today);
  }, [fetchEvents, fetchAnalytics]);

  if (isLoading && events.length === 0 && !analytics) {
    return <PageSkeleton title="Smart Calendar V2" showHeader={false} />;
  }

  const handleGenerate = async (prompt) => {
    const today = new Date().toISOString().split('T')[0];
    const proposedEvents = await generateDaily(today, prompt);
    
    if (proposedEvents && proposedEvents.length > 0) {
       for (const ev of proposedEvents) {
         await createEvent(ev); 
       }
       fetchAnalytics(today);
    }
  };

  const handleGenerateWeek = async (prompt) => {
    const today = new Date().toISOString().split('T')[0];
    const proposedEvents = await generateWeekly(today, prompt);
    
    if (proposedEvents && proposedEvents.length > 0) {
       for (const ev of proposedEvents) {
         await createEvent(ev); 
       }
       fetchAnalytics(today);
    }
  };

  const handleAcceptConflictSlot = async (slot) => {
    if (!conflictWarning || !conflictWarning.originalPayload) return;
    const newEvent = {
      ...conflictWarning.originalPayload,
      startTime: slot.startTime,
      endTime: slot.endTime,
      ignoreConflict: true
    };
    await createEvent(newEvent);
    clearConflictWarning();
  };

  const handleDismissConflict = async () => {
    if (!conflictWarning || !conflictWarning.originalPayload) return;
    const newEvent = {
      ...conflictWarning.originalPayload,
      ignoreConflict: true
    };
    await createEvent(newEvent);
    clearConflictWarning();
  };

  const handleToggleComplete = async (event) => {
    await updateEvent(event._id, { ...event, isCompleted: !event.isCompleted });
    const today = new Date().toISOString().split('T')[0];
    fetchAnalytics(today);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-950 w-full relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 tracking-tight">
                <CalendarIcon className="text-indigo-400" size={32} />
                Smart Calendar <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded-md uppercase tracking-widest font-bold border border-indigo-500/30">V2 Premium</span>
              </h1>
              <p className="text-slate-400 mt-2 text-sm font-medium">AI-first scheduling workflow with smart integrations.</p>
            </div>
            <Button onClick={() => { fetchEvents(); fetchAnalytics(new Date().toISOString().split('T')[0]); }} variant="secondary" icon={RefreshCw}>
              Sync
            </Button>
          </div>

          {/* Top Section: Productivity Header */}
          <ProductivityHeader analytics={analytics} />

          {/* Middle Section: 70/30 Split for Calendar and AI Assistant */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
            <div className="lg:col-span-2 h-full">
              <CalendarGrid 
                events={events} 
                onToggleComplete={handleToggleComplete}
                onEventUpdate={updateEvent}
                onEventClick={(event) => setActiveFocusEvent(event)}
              />
            </div>
            
            <div className="lg:col-span-1 h-full">
              <AIAssistantSidebar 
                onGenerateDaily={handleGenerate}
                onGenerateWeekly={handleGenerateWeek}
                conflictWarning={conflictWarning}
                onAcceptConflict={handleAcceptConflictSlot}
                onDismissConflict={handleDismissConflict}
                analytics={analytics}
              />
            </div>
          </div>

          {/* Bottom Section: Analytics & Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <CalendarAnalytics analytics={analytics} />
            </div>
            <div className="lg:col-span-1">
              <CalendarHeatmap events={events} />
            </div>
          </div>

        </div>
      </div>

      {activeFocusEvent && (
        <FocusMode 
          activeEvent={activeFocusEvent} 
          onComplete={async (id, updatedEvent) => {
             await updateEvent(id, updatedEvent);
             fetchAnalytics(new Date().toISOString().split('T')[0]);
          }}
          onClose={() => setActiveFocusEvent(null)}
        />
      )}
    </div>
  );
};

export default CalendarPage;
