import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Target, Activity, Flame, Calendar as CalendarIcon, CheckCircle2, Sparkles, BrainCircuit, NotebookPen, TrendingUp } from 'lucide-react';
import { useDashboardStore } from '../stores/dashboardStore';
import { PageSkeleton } from '../components/common/LoadingSkeleton';

const StatCard = ({ title, value, icon: Icon, colorClass, glowColor, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    className="premium-card-hover p-5 md:p-6 flex items-center justify-between gap-4 group"
  >
    <div>
      <p className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner-glow transition-all duration-500 group-hover:scale-110 ${colorClass}`}>
      <Icon size={22} />
    </div>
  </motion.div>
);

const WeeklyChart = ({ data }) => {
  const maxScore = Math.max(...data.map(d => d.score), 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="premium-card p-6 flex flex-col h-full"
    >
      <h3 className="text-base font-bold text-slate-100 mb-6 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
          <TrendingUp className="text-brand-400" size={16} />
        </div>
        Weekly Productivity
      </h3>
      <div className="flex-1 flex items-end justify-between gap-2 mt-auto">
        {data.map((item, index) => {
          const heightPct = Math.max((item.score / maxScore) * 100, 5);
          return (
            <div key={index} className="flex flex-col items-center flex-1 group/bar">
              <div className="w-full relative flex justify-center items-end h-40 bg-white/[0.02] rounded-t-lg overflow-hidden border-b border-white/[0.04]">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ delay: 0.4 + index * 0.08, duration: 0.7, type: "spring", damping: 15 }}
                  className={`w-full rounded-t-lg transition-all duration-300 relative overflow-hidden ${
                    item.score >= 80 ? 'bg-emerald-500/70 group-hover/bar:bg-emerald-400/80' :
                    item.score >= 50 ? 'bg-brand-500/70 group-hover/bar:bg-brand-400/80' :
                    'bg-slate-500/50 group-hover/bar:bg-slate-400/60'
                  }`}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300" />
                </motion.div>
                {/* Tooltip */}
                <div className="absolute top-2 opacity-0 group-hover/bar:opacity-100 transition-all duration-200 bg-slate-900/95 backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-lg text-white pointer-events-none z-10 border border-white/[0.08] shadow-lg">
                  {item.score}%
                </div>
              </div>
              <span className="text-2xs text-slate-500 mt-3 font-bold uppercase tracking-widest">{item.day}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

const DashboardPage = () => {
  const { dashboardData, isLoading, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading || !dashboardData) {
    return <PageSkeleton title="Dashboard" showHeader={false} />;
  }

  const { user, stats, weeklyChart, recentActivity, aiInsight, aiSuggestions, dailyReview } = dashboardData;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  })();

  return (
    <div className="page-container">
      {/* Ambient Background Orbs */}
      <div className="ambient-orb-primary w-[600px] h-[600px] -top-40 -right-40" />
      <div className="ambient-orb-secondary w-[500px] h-[500px] -bottom-40 -left-40" />
      <div className="ambient-orb-tertiary w-[300px] h-[300px] top-1/2 left-1/2" />

      {/* Header */}
      <div className="page-header">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-title"
          >
            {greeting}, <span className="text-gradient-brand">{user?.name || 'User'}</span> <span className="animate-wave origin-bottom-right inline-block">👋</span>
          </motion.h1>
          <p className="page-subtitle">Here's your LifeOS overview for today.</p>
        </div>
      </div>

      <div className="page-content">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* AI Insight Banner */}
          {aiInsight && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="ai-insight-banner"
            >
              <div className="ai-insight-icon text-brand-400">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-2xs font-bold text-brand-400 uppercase tracking-widest mb-1">AI Insight</p>
                <p className="text-slate-200 font-medium text-sm leading-relaxed">{aiInsight}</p>
              </div>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            <StatCard 
              title="Active Goals" 
              value={stats.activeGoals} 
              icon={Target} 
              colorClass="bg-blue-500/15 text-blue-400 border-blue-500/25" 
              delay={0.1} 
            />
            <StatCard 
              title="Habits Tracked" 
              value={stats.habitsToday} 
              icon={Activity} 
              colorClass="bg-emerald-500/15 text-emerald-400 border-emerald-500/25" 
              delay={0.15} 
            />
            <StatCard 
              title="Current Streak" 
              value={`${stats.currentStreak}d`} 
              icon={Flame} 
              colorClass="bg-orange-500/15 text-orange-400 border-orange-500/25" 
              delay={0.2} 
            />
            <StatCard 
              title="Planner Score" 
              value={`${stats.plannerScore}%`} 
              icon={CalendarIcon} 
              colorClass="bg-purple-500/15 text-purple-400 border-purple-500/25" 
              delay={0.25} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
            
            {/* AI Suggestions Panel */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="premium-card p-6 flex flex-col h-full"
            >
              <h3 className="text-base font-bold text-slate-100 mb-5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                  <BrainCircuit className="text-violet-400" size={16} />
                </div>
                AI Suggestions
              </h3>
              <div className="space-y-2.5 flex-1">
                {aiSuggestions && aiSuggestions.length > 0 ? (
                  aiSuggestions.map((suggestion, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.08 }}
                      className="flex items-start gap-3 bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300"
                    >
                      <div className="mt-0.5 text-violet-400">
                        <Sparkles size={13} />
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{suggestion}</p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm text-center py-6">No new suggestions.</p>
                )}
              </div>
            </motion.div>

            {/* Daily Review Panel */}
            {dailyReview && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="premium-card p-6 flex flex-col h-full"
              >
                <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/20 flex items-center justify-center">
                    <NotebookPen className="text-sky-400" size={16} />
                  </div>
                  Daily Review
                </h3>
                <div className="flex gap-3 mb-4">
                   <div className="flex-1 bg-white/[0.03] rounded-xl p-3 border border-white/[0.04] text-center">
                     <p className="text-2xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Habits</p>
                     <p className="text-xl font-bold text-slate-200">{dailyReview.stats?.completedHabits}/{dailyReview.stats?.totalHabits}</p>
                   </div>
                   <div className="flex-1 bg-white/[0.03] rounded-xl p-3 border border-white/[0.04] text-center">
                     <p className="text-2xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Tasks</p>
                     <p className="text-xl font-bold text-slate-200">{dailyReview.stats?.completedTasks}/{dailyReview.stats?.totalTasks}</p>
                   </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-sky-400/40 pl-3">
                  "{dailyReview.summary}"
                </p>
              </motion.div>
            )}

            {/* Chart */}
            <div className={`lg:col-span-${dailyReview ? '1' : '2'}`}>
              <WeeklyChart data={weeklyChart} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="premium-card p-6 flex flex-col h-full"
            >
              <h3 className="text-base font-bold text-slate-100 mb-5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="text-emerald-400" size={16} />
                </div>
                Recent Activity
              </h3>
              
              <div className="space-y-4 flex-1">
                {recentActivity.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-6">No recent activity found.</p>
                ) : (
                  recentActivity.map((activity, i) => (
                    <motion.div 
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + (i * 0.08) }}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-200 font-medium leading-tight">{activity.text}</p>
                        <p className="text-2xs text-slate-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
