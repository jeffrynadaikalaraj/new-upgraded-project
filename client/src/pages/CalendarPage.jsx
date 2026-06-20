import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { useCalendarStore } from '../stores/calendarStore';
import { PageSkeleton } from '../components/common/LoadingSkeleton';
import ProductivityHeader from '../components/calendar/ProductivityHeader';
import CalendarGrid from '../components/calendar/CalendarGrid';
import AIAssistantSidebar from '../components/calendar/AIAssistantSidebar';
import CalendarAnalytics from '../components/calendar/CalendarAnalytics';
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
    conflictWarning,
    clearConflictWarning,
    createEvent
  } = useCalendarStore();

  const [pendingEvent, setPendingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
    const today = new Date().toISOString().split('T')[0];
    fetchAnalytics(today);
  }, [fetchEvents, fetchAnalytics]);

  if (isLoading && events.length === 0 && !analytics) {
    return <PageSkeleton title="Smart Calendar" showHeader={false} />;
  }

  const handleGenerate = async (prompt) => {
    const today = new Date().toISOString().split('T')[0];
    const proposedEvents = await generateDaily(today, prompt);
    
    // Auto-save the proposed events
    // In a real app we might show them as drafts first, but we'll save them directly for seamless UX
    if (proposedEvents && proposedEvents.length > 0) {
       for (const ev of proposedEvents) {
         await createEvent(ev); // This will handle conflicts internally in the store
       }
       // Refetch stats
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
    <div className="flex flex-col h-full overflow-hidden bg-slate-900 w-full relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Title */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <CalendarIcon className="text-indigo-400" size={32} />
                Smart Calendar
              </h1>
              <p className="text-slate-400 mt-2 text-sm">SaaS-level scheduling powered by AI.</p>
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
              />
            </div>
            
            <div className="lg:col-span-1 h-full">
              <AIAssistantSidebar 
                onGenerate={handleGenerate}
                conflictWarning={conflictWarning}
                onAcceptConflict={handleAcceptConflictSlot}
                onDismissConflict={handleDismissConflict}
              />
            </div>
          </div>

          {/* Bottom Section: Analytics */}
          <div className="mt-8">
            <CalendarAnalytics analytics={analytics} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
