import React, { useState } from 'react';
import { Target, CheckSquare, ListTodo, FileText, TrendingUp, Search, Calendar, Loader2, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChatStore } from '../../stores/chatStore';

const renderPayloadSummary = (payload) => {
  if (!payload) return null;
  return (
    <div className="mt-2 text-xs bg-black/20 p-2 rounded-lg border border-white/5 space-y-1">
      {Object.entries(payload).map(([key, value]) => (
        <div key={key} className="flex gap-2 text-slate-300">
          <span className="font-semibold text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
          <span className="truncate">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
        </div>
      ))}
    </div>
  );
};

const getActionDetails = (action) => {
  const { type, result, payload, status } = action;
  
  const commonClasses = "flex flex-col gap-2 p-3 rounded-xl border bg-slate-800/80 backdrop-blur-sm mt-3 shadow-lg";
  const successBorder = "border-emerald-500/30 shadow-emerald-500/5";
  const errorBorder = "border-red-500/30 shadow-red-500/5";
  const pendingBorder = "border-indigo-500/40 shadow-indigo-500/5";
  const rejectedBorder = "border-slate-600/30 shadow-slate-600/5 opacity-70";
  
  if (status === 'failed' || (status === 'success' && result && !result.success)) {
    return {
      icon: <span className="text-red-400">⚠️</span>,
      title: 'Action Failed',
      description: result?.message || 'Unknown error occurred.',
      className: `${commonClasses} ${errorBorder}`
    };
  }

  if (status === 'rejected') {
    return {
      icon: <X className="text-slate-400" size={18} />,
      title: 'Action Rejected',
      description: 'You canceled this action.',
      className: `${commonClasses} ${rejectedBorder}`
    };
  }

  // Base icon mapping
  let icon = <span className="text-emerald-400">✨</span>;
  let title = 'Action Executed';
  let description = result?.message || 'Done.';
  let pendingTitle = 'Action Proposed';

  switch (type) {
    case 'create_goal':
      icon = <Target className={status === 'pending' ? 'text-indigo-400' : 'text-emerald-400'} size={18} />;
      title = `Created Goal: ${payload?.title || result?.data?.title}`;
      pendingTitle = `Proposes New Goal`;
      description = `Category: ${payload?.category}`;
      break;
    case 'create_habit':
      icon = <CheckSquare className={status === 'pending' ? 'text-indigo-400' : 'text-emerald-400'} size={18} />;
      title = `Created Habit: ${payload?.title || result?.data?.title}`;
      pendingTitle = `Proposes New Habit`;
      description = `Frequency: ${payload?.frequency}`;
      break;
    case 'add_task':
      icon = <ListTodo className={status === 'pending' ? 'text-indigo-400' : 'text-emerald-400'} size={18} />;
      title = `Added Task`;
      pendingTitle = `Proposes New Task`;
      description = `Task added to your Daily Plan.`;
      break;
    case 'save_note':
      icon = <FileText className={status === 'pending' ? 'text-indigo-400' : 'text-emerald-400'} size={18} />;
      title = `Note Saved`;
      pendingTitle = `Proposes Saving Note`;
      description = 'Saved to your personal knowledge base.';
      break;
    case 'update_goal_progress':
      icon = <TrendingUp className={status === 'pending' ? 'text-indigo-400' : 'text-emerald-400'} size={18} />;
      title = `Updated Goal Progress`;
      pendingTitle = `Proposes Progress Update`;
      description = `${payload?.title} to ${payload?.progress}%.`;
      break;
    case 'complete_habit':
      icon = <CheckSquare className={status === 'pending' ? 'text-indigo-400' : 'text-emerald-400'} size={18} />;
      title = `Completed Habit`;
      pendingTitle = `Proposes Habit Completion`;
      description = `${payload?.title} marked as done.`;
      break;
    case 'generate_plan':
      icon = <Calendar className={status === 'pending' ? 'text-indigo-400' : 'text-emerald-400'} size={18} />;
      title = `Generated Plan`;
      pendingTitle = `Proposes Daily Plan`;
      description = `Daily schedule generated.`;
      break;
  }

  if (status === 'pending' || status === 'loading') {
    return {
      icon,
      title: pendingTitle,
      description: 'Review the details below:',
      className: `${commonClasses} ${pendingBorder}`,
      showPayload: true
    };
  }

  return {
    icon,
    title,
    description,
    className: `${commonClasses} ${successBorder}`,
    showPayload: false
  };
};

const ActionBadge = ({ action, messageId }) => {
  const { executePendingAction, rejectPendingAction } = useChatStore();
  const { icon, title, description, className, showPayload } = getActionDetails(action);
  
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2">
        {action.status === 'loading' ? <Loader2 className="animate-spin text-indigo-400" size={18} /> : icon}
        <span className="text-sm font-semibold text-slate-200">{title}</span>
      </div>
      <p className="text-xs text-slate-400 pl-6">{description}</p>
      
      {showPayload && renderPayloadSummary(action.payload)}

      {action.status === 'pending' && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
          <button 
            onClick={() => executePendingAction(messageId, action.actionId)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg transition-colors border border-emerald-500/20"
          >
            <Check size={14} /> Approve
          </button>
          <button 
            onClick={() => rejectPendingAction(messageId, action.actionId)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-500/10 hover:bg-slate-500/20 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-colors border border-slate-500/20"
          >
            <X size={14} /> Reject
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ActionBadge;
