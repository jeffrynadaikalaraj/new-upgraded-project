import React, { useEffect, useState } from 'react';
import { Calendar, Sparkles, RefreshCw, Wand2 } from 'lucide-react';
import { usePlannerStore } from '../stores/plannerStore';
import Button from '../components/ui/Button';
import TimeBlock from '../components/planner/TimeBlock';
import CustomizePlanModal from '../components/planner/CustomizePlanModal';
import { PageSkeleton } from '../components/common/LoadingSkeleton';
import { motion } from 'framer-motion';

const PlannerPage = () => {
  const { todayPlan, isLoading, fetchTodayPlan, generatePlan, updateBlock } = usePlannerStore();
  
  const today = new Date().toISOString().split('T')[0];
  const [currentDate, setCurrentDate] = useState(today);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  useEffect(() => {
    fetchTodayPlan();
  }, [fetchTodayPlan]);

  const handleGenerate = async () => {
    await generatePlan(currentDate);
  };

  const handleCustomGenerate = async (customPrompt, wakeTime, sleepTime, priorityLevel) => {
    setIsCustomizerOpen(false);
    await generatePlan(currentDate, customPrompt, wakeTime, sleepTime, priorityLevel);
  };

  const handleToggleBlock = async (blockId, completed) => {
    await updateBlock(currentDate, blockId, completed);
  };

  // Safe checks for score rendering
  const score = todayPlan?.score || 0;
  const circumference = 2 * Math.PI * 38; // r=38
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-900 w-full relative">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between p-8 pb-4 relative z-10 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Calendar className="text-indigo-400" size={32} />
            Daily Planner
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {new Date(currentDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        {todayPlan ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-800/50 p-2 pr-4 rounded-full border border-slate-700 backdrop-blur-sm">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="transform -rotate-90 w-12 h-12">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-700" />
                  <circle
                    cx="24" cy="24" r="20"
                    stroke="currentColor" strokeWidth="4" fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="text-emerald-500 transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-white">{score}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Score</span>
              </div>
            </div>
            <Button onClick={() => setIsCustomizerOpen(true)} variant="secondary" icon={Wand2} isLoading={isLoading}>
              Customize
            </Button>
            <Button onClick={handleGenerate} variant="secondary" icon={RefreshCw} isLoading={isLoading}>
              Regenerate
            </Button>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
        {isLoading && !todayPlan ? (
          <PageSkeleton title="Daily Planner" showHeader={false} />
        ) : !todayPlan ? (
          <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center">
            <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
              <Sparkles size={48} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">Ready to plan your day?</h3>
            <p className="text-slate-400 text-sm mb-8">
              AI LifeOS will analyze your active goals, pending milestones, daily habits, and personal preferences to create an optimized schedule for you.
            </p>
            <div className="flex gap-4 w-full">
              <Button onClick={() => setIsCustomizerOpen(true)} variant="secondary" size="lg" className="flex-1">
                <Wand2 size={18} className="mr-2" />
                Customize
              </Button>
              <Button onClick={handleGenerate} variant="gradient" size="lg" isLoading={isLoading} className="flex-1">
                Generate Plan
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Timeline View */}
            <div className="relative space-y-4">
              {/* Vertical timeline line */}
              <div className="absolute top-4 bottom-4 left-[3.5rem] w-px bg-slate-700/50 z-0" />
              
              {todayPlan.blocks.map((block, index) => (
                <TimeBlock 
                  key={block._id || index} 
                  block={block} 
                  onToggle={handleToggleBlock} 
                />
              ))}
            </div>
            
            {todayPlan.blocks.length === 0 && (
              <div className="text-center text-slate-500 mt-10">
                <p>No blocks generated. Try regenerating the plan.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <CustomizePlanModal 
        isOpen={isCustomizerOpen} 
        onClose={() => setIsCustomizerOpen(false)} 
        onGenerate={handleCustomGenerate} 
      />
    </div>
  );
};

export default PlannerPage;
