import React from 'react';
import { Target, CheckSquare, ListTodo, FileText, TrendingUp, Search, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const getActionDetails = (action) => {
  const { type, result } = action;
  const isSuccess = result?.success;
  
  const commonClasses = "flex flex-col gap-1 p-3 rounded-xl border bg-slate-800/80 backdrop-blur-sm mt-3 shadow-lg";
  const successBorder = "border-emerald-500/30 shadow-emerald-500/5";
  const errorBorder = "border-red-500/30 shadow-red-500/5";
  
  if (!isSuccess) {
    return {
      icon: <span className="text-red-400">⚠️</span>,
      title: 'Action Failed',
      description: result?.message || 'Unknown error occurred.',
      className: `${commonClasses} ${errorBorder}`
    };
  }

  const payload = result.data;

  switch (type) {
    case 'create_goal':
      return {
        icon: <Target className="text-emerald-400" size={18} />,
        title: `Created Goal: ${payload?.title}`,
        description: `Category: ${payload?.category} · Priority: ${payload?.priority}`,
        className: `${commonClasses} ${successBorder}`
      };
    case 'create_habit':
      return {
        icon: <CheckSquare className="text-emerald-400" size={18} />,
        title: `Created Habit: ${payload?.title}`,
        description: `Frequency: ${payload?.frequency}`,
        className: `${commonClasses} ${successBorder}`
      };
    case 'add_task':
      return {
        icon: <ListTodo className="text-emerald-400" size={18} />,
        title: `Added Task`,
        description: `Task added to your Daily Plan.`,
        className: `${commonClasses} ${successBorder}`
      };
    case 'save_note':
      return {
        icon: <FileText className="text-emerald-400" size={18} />,
        title: `Note Saved`,
        description: 'Saved to your personal knowledge base.',
        className: `${commonClasses} ${successBorder}`
      };
    case 'update_goal_progress':
      return {
        icon: <TrendingUp className="text-emerald-400" size={18} />,
        title: `Updated Goal Progress`,
        description: `${payload?.title} is now at ${payload?.progress}%.`,
        className: `${commonClasses} ${successBorder}`
      };
    case 'complete_habit':
      return {
        icon: <CheckSquare className="text-emerald-400" size={18} />,
        title: `Completed Habit`,
        description: `${payload?.title} marked as done!`,
        className: `${commonClasses} ${successBorder}`
      };
    case 'generate_plan':
      return {
        icon: <Calendar className="text-emerald-400" size={18} />,
        title: `Generated Plan`,
        description: `Daily schedule generated.`,
        className: `${commonClasses} ${successBorder}`
      };
    default:
      return {
        icon: <span className="text-emerald-400">✨</span>,
        title: `Action Executed`,
        description: result?.message || 'Done.',
        className: `${commonClasses} ${successBorder}`
      };
  }
};

const ActionBadge = ({ action }) => {
  const { icon, title, description, className } = getActionDetails(action);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={className}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold text-slate-200">{title}</span>
      </div>
      <p className="text-xs text-slate-400 pl-6">{description}</p>
    </motion.div>
  );
};

export default ActionBadge;
