import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Target, Activity, Flame, Calendar as CalendarIcon, CheckCircle2, Sparkles } from 'lucide-react';
import { useDashboardStore } from '../stores/dashboardStore';
import { PageSkeleton } from '../components/common/LoadingSkeleton';

const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 flex items-center justify-between shadow-xl hover:shadow-indigo-500/5 transition-all"
  >
    <div>
      <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-100">{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
      <Icon size={24} />
    </div>
  </motion.div>
);

const WeeklyChart = ({ data }) => {
  const maxScore = Math.max(...data.map(d => d.score), 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 flex flex-col h-full shadow-xl"
    >
      <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
        <Activity className="text-indigo-400" size={20} />
        Weekly Productivity
      </h3>
      <div className="flex-1 flex items-end justify-between gap-2 mt-auto">
        {data.map((item, index) => {
          const heightPct = Math.max((item.score / maxScore) * 100, 5); // min height 5%
          return (
            <div key={index} className="flex flex-col items-center flex-1 group">
              <div className="w-full relative flex justify-center items-end h-40 bg-slate-700/20 rounded-t-lg overflow-hidden">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.6, type: "spring" }}
                  className={`w-full rounded-t-lg transition-colors ${
                    item.score >= 80 ? 'bg-emerald-500/80 group-hover:bg-emerald-400' :
                    item.score >= 50 ? 'bg-indigo-500/80 group-hover:bg-indigo-400' :
                    'bg-slate-500/80 group-hover:bg-slate-400'
                  }`}
                />
                {/* Tooltip */}
                <div className="absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-xs font-bold px-2 py-1 rounded text-white pointer-events-none z-10">
                  {item.score}%
                </div>
              </div>
              <span className="text-xs text-slate-400 mt-3 font-medium uppercase tracking-wider">{item.day}</span>
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

  const { stats, weeklyChart, recentActivity, aiInsight } = dashboardData;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-900 w-full relative">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between p-8 pb-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <LayoutDashboard className="text-indigo-400" size={32} />
            Dashboard
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Welcome back. Here is your LifeOS overview.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* AI Insight Banner */}
          {aiInsight && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-indigo-500/5"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex flex-shrink-0 items-center justify-center text-indigo-400">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">AI Insight</p>
                <p className="text-slate-200 font-medium">{aiInsight}</p>
              </div>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Active Goals" 
              value={stats.activeGoals} 
              icon={Target} 
              colorClass="bg-blue-500/20 text-blue-400 border border-blue-500/30" 
              delay={0.1} 
            />
            <StatCard 
              title="Habits Tracked" 
              value={stats.habitsToday} 
              icon={Activity} 
              colorClass="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
              delay={0.2} 
            />
            <StatCard 
              title="Current Streak" 
              value={`${stats.currentStreak}d`} 
              icon={Flame} 
              colorClass="bg-orange-500/20 text-orange-400 border border-orange-500/30" 
              delay={0.3} 
            />
            <StatCard 
              title="Planner Score" 
              value={`${stats.plannerScore}%`} 
              icon={CalendarIcon} 
              colorClass="bg-purple-500/20 text-purple-400 border border-purple-500/30" 
              delay={0.4} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2">
              <WeeklyChart data={weeklyChart} />
            </div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl flex flex-col h-full"
            >
              <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-400" size={20} />
                Recent Activity
              </h3>
              
              <div className="space-y-4 flex-1">
                {recentActivity.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center mt-10">No recent activity found.</p>
                ) : (
                  recentActivity.map((activity, i) => (
                    <motion.div 
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + (i * 0.1) }}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-200 font-medium leading-tight">{activity.text}</p>
                        <p className="text-xs text-slate-500 mt-1">
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
