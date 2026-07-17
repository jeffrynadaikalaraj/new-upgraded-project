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
    <div className="page-container">
      {/* Ambient Background Orbs */}
      <div className="ambient-orb-primary w-[600px] h-[600px] -top-40 -right-40" />
      <div className="ambient-orb-secondary w-[500px] h-[500px] -bottom-40 -left-40" />

      {/* Header */}
      <div className="page-header border-b border-white/[0.04]">
        <div>
          <h1 className="page-title">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
              <Calendar className="text-brand-400" size={22} />
            </div>
            Daily Planner
          </h1>
          <p className="page-subtitle">
            {new Date(currentDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        {todayPlan ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 premium-card p-2 pr-4 rounded-full">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="transform -rotate-90 w-12 h-12">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" fill="transparent" className="text-white/[0.06]" />
                  <circle
                    cx="24" cy="24" r="20"
                    stroke="currentColor" strokeWidth="3.5" fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-emerald-400 transition-all duration-1000 ease-out"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.4))' }}
                  />
                </svg>
                <span className="absolute text-xs font-bold text-white">{score}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xs text-slate-400 font-bold uppercase tracking-widest">Score</span>
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
      <div className="page-content">
        {isLoading && !todayPlan ? (
          <PageSkeleton title="Daily Planner" showHeader={false} />
        ) : !todayPlan ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Sparkles size={44} className="text-brand-400" />
            </div>
            <h3 className="empty-state-title">Ready to plan your day?</h3>
            <p className="empty-state-description">
              AI LifeOS will analyze your active goals, pending milestones, daily habits, and personal preferences to create an optimized schedule for you.
            </p>
            <div className="flex gap-4 w-full max-w-md">
              <Button onClick={() => setIsCustomizerOpen(true)} variant="secondary" size="lg" className="flex-1">
                <Wand2 size={18} className="mr-2" />
                Customize
              </Button>
              <Button onClick={handleGenerate} variant="gradient" size="lg" isLoading={isLoading} className="flex-1 shadow-glow-md">
                Generate Plan
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Timeline View */}
            <div className="relative space-y-4">
              {/* Vertical timeline line */}
              <div className="absolute top-4 bottom-4 left-[3.5rem] w-px bg-white/[0.06] z-0" />
              
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
