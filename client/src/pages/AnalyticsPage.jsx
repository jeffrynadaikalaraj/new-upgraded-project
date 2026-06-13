import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Target, Activity, Flame, Calendar as CalendarIcon, CheckCircle2, Smile } from 'lucide-react';
import { useAnalyticsStore } from '../stores/analyticsStore';
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
      <p className="text-2xl font-bold text-slate-100">{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
      <Icon size={24} />
    </div>
  </motion.div>
);

const AnimatedBarChart = ({ data, title, icon: Icon, delay }) => {
  const maxScore = Math.max(...data.map(d => d.score), 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 flex flex-col shadow-xl"
    >
      <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
        <Icon className="text-indigo-400" size={20} />
        {title}
      </h3>
      <div className="flex-1 flex items-end justify-between gap-2 h-40">
        {data.map((item, index) => {
          const heightPct = Math.max((item.score / maxScore) * 100, 5);
          return (
            <div key={index} className="flex flex-col items-center flex-1 group">
              <div className="w-full relative flex justify-center items-end h-full bg-slate-700/20 rounded-t-lg overflow-hidden">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ delay: delay + 0.2 + index * 0.1, duration: 0.6, type: "spring" }}
                  className={`w-full rounded-t-lg transition-colors ${
                    item.score >= 80 ? 'bg-emerald-500/80 group-hover:bg-emerald-400' :
                    item.score >= 50 ? 'bg-indigo-500/80 group-hover:bg-indigo-400' :
                    'bg-slate-500/80 group-hover:bg-slate-400'
                  }`}
                />
                <div className="absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-xs font-bold px-2 py-1 rounded text-white pointer-events-none z-10">
                  {item.score}%
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-wider">{item.day || item.week}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

const AnimatedLineChart = ({ data, title, icon: Icon, delay }) => {
  const maxScore = 5; // Mood is out of 5
  
  // Calculate points for the SVG polyline
  const height = 160; // container height matching h-40
  const width = 100; // relative percentage
  
  const points = data.map((item, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * width;
    // Mood of 0 means no data, we can treat it as 3 (neutral) for the line, or skip. We'll map 1-5 to Y axis.
    const effectiveScore = item.mood === 0 ? 3 : item.mood;
    const y = height - ((effectiveScore / maxScore) * height);
    return `${x}%,${y}`;
  }).join(' ');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 flex flex-col shadow-xl"
    >
      <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
        <Icon className="text-pink-400" size={20} />
        {title}
      </h3>
      <div className="flex-1 flex flex-col justify-end h-40 relative">
        <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
           <motion.polyline
             initial={{ pathLength: 0, opacity: 0 }}
             animate={{ pathLength: 1, opacity: 1 }}
             transition={{ delay: delay + 0.3, duration: 1.5, ease: "easeInOut" }}
             points={points}
             fill="none"
             stroke="#ec4899" // pink-500
             strokeWidth="3"
             strokeLinecap="round"
             strokeLinejoin="round"
             vectorEffect="non-scaling-stroke"
           />
           {data.map((item, i) => {
             const x = (i / Math.max(data.length - 1, 1)) * 100;
             const effectiveScore = item.mood === 0 ? 3 : item.mood;
             const y = height - ((effectiveScore / maxScore) * height);
             return (
               <motion.circle
                 key={i}
                 initial={{ scale: 0, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ delay: delay + 1.5 + (i * 0.1) }}
                 cx={`${x}%`}
                 cy={y}
                 r="4"
                 fill="#ec4899"
                 className="drop-shadow-md"
               />
             );
           })}
        </svg>
        <div className="flex items-end justify-between mt-4 relative z-10 w-full">
          {data.map((item, index) => (
            <div key={index} className="flex-1 text-center">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{item.day || item.week}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const GoalDonutChart = ({ data, delay }) => {
  const categoryColors = {
    career: '#3b82f6', // blue-500
    health: '#10b981', // emerald-500
    finance: '#f59e0b', // amber-500
    learning: '#8b5cf6', // violet-500
    personal: '#ec4899', // pink-500
    other: '#64748b' // slate-500
  };

  let cumulativePercent = 0;
  const pieSegments = data.map(d => {
    const start = cumulativePercent;
    cumulativePercent += d.percentage;
    return `${categoryColors[d.category]} ${start}% ${cumulativePercent}%`;
  });

  const backgroundStr = pieSegments.length > 0 
    ? `conic-gradient(${pieSegments.join(', ')})`
    : 'conic-gradient(#334155 0% 100%)';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-8"
    >
      <div className="flex-1 w-full">
        <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Target className="text-indigo-400" size={20} />
          Goal Distribution
        </h3>
        <div className="space-y-3">
          {data.length === 0 ? (
             <p className="text-slate-500 text-sm">No goals data available.</p>
          ) : data.map((d, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[d.category] }} />
                <span className="text-sm text-slate-300 capitalize">{d.category}</span>
              </div>
              <span className="text-sm font-bold text-slate-100">{d.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative w-48 h-48 rounded-full flex-shrink-0" style={{ background: backgroundStr }}>
        <div className="absolute inset-4 bg-slate-900 rounded-full flex items-center justify-center">
          <span className="text-slate-400 text-sm font-medium">Goals</span>
        </div>
      </div>
    </motion.div>
  );
};

const HabitPerformanceTable = ({ habits, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl overflow-hidden"
  >
    <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
      <CheckCircle2 className="text-emerald-400" size={20} />
      Habit Performance
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-700/50">
            <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Habit</th>
            <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Completion %</th>
            <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Current Streak</th>
          </tr>
        </thead>
        <tbody>
          {habits.length === 0 ? (
            <tr>
              <td colSpan="3" className="py-8 text-center text-slate-500 text-sm">No active habits found.</td>
            </tr>
          ) : (
            habits.map((habit, idx) => (
              <tr key={idx} className="border-b border-slate-700/30 last:border-0 hover:bg-slate-800/30 transition-colors">
                <td className="py-3 text-sm font-medium text-slate-200">{habit.title}</td>
                <td className="py-3 text-sm text-slate-300 text-right">
                  <span className={`px-2 py-1 rounded border ${habit.completionRate >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : habit.completionRate >= 50 ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                    {habit.completionRate}%
                  </span>
                </td>
                <td className="py-3 text-sm font-bold text-orange-400 text-right">{habit.streak}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </motion.div>
);

const AnalyticsPage = () => {
  const { overview, weeklyData, monthlyData, habitsData, goalsData, isLoading, fetchAll } = useAnalyticsStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (isLoading || !overview) {
    return <PageSkeleton title="Analytics" showHeader={false} />;
  }

  const circumference = 2 * Math.PI * 45; // r=45
  const strokeDashoffset = circumference - (overview.productivityScore / 100) * circumference;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-900 w-full relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between p-8 pb-4 relative z-10 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="text-indigo-400" size={32} />
            Analytics
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Deep insights into your productivity.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 pt-6 custom-scrollbar relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Productivity Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between shadow-lg shadow-indigo-500/10 gap-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Overall Productivity Score</h2>
              <p className="text-indigo-200/80 max-w-md">
                This score combines your goal completions, milestone progress, and habit tracking consistency into a single metric.
              </p>
            </div>
            
            <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle cx="64" cy="64" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                <circle
                  cx="64" cy="64" r="45"
                  stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-indigo-400 transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-white">{overview.productivityScore}%</span>
              </div>
            </div>
          </motion.div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard title="Goal Completion" value={`${overview.goalCompletionRate}%`} icon={Target} colorClass="bg-blue-500/20 text-blue-400 border border-blue-500/30" delay={0.1} />
            <StatCard title="Habit Success" value={`${overview.habitSuccessRate}%`} icon={Activity} colorClass="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" delay={0.2} />
            <StatCard title="Best Streak" value={`${overview.bestStreak}d`} icon={Flame} colorClass="bg-orange-500/20 text-orange-400 border border-orange-500/30" delay={0.3} />
            <StatCard title="Best Day" value={overview.mostProductiveDay} icon={CalendarIcon} colorClass="bg-purple-500/20 text-purple-400 border border-purple-500/30" delay={0.4} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AnimatedBarChart data={weeklyData} title="Weekly Productivity" icon={Activity} delay={0.5} />
            <AnimatedBarChart data={monthlyData} title="Monthly Trend" icon={CalendarIcon} delay={0.6} />
            <AnimatedLineChart data={weeklyData} title="Weekly Mood" icon={Smile} delay={0.7} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GoalDonutChart data={goalsData} delay={0.8} />
            <HabitPerformanceTable habits={habitsData} delay={0.9} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
