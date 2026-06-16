import React, { useState } from 'react';
import { Target, CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, Zap, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';

const categoryColors = {
  career: 'from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30',
  health: 'from-emerald-500/20 to-emerald-600/20 text-emerald-400 border-emerald-500/30',
  finance: 'from-amber-500/20 to-amber-600/20 text-amber-400 border-amber-500/30',
  learning: 'from-purple-500/20 to-purple-600/20 text-purple-400 border-purple-500/30',
  personal: 'from-pink-500/20 to-pink-600/20 text-pink-400 border-pink-500/30',
  other: 'from-slate-500/20 to-slate-600/20 text-slate-400 border-slate-500/30'
};

const priorityDots = {
  low: 'bg-slate-400',
  medium: 'bg-emerald-400',
  high: 'bg-amber-400',
  critical: 'bg-rose-500'
};

const GoalCard = ({ goal, onUpdateMilestone, onClickEdit, onGenerateAiSuggestions, onPredictGoal, onLogActivity }) => {
  const [expanded, setExpanded] = useState(false);
  const colorScheme = categoryColors[goal.category] || categoryColors.other;
  const dotColor = priorityDots[goal.priority] || priorityDots.medium;

  const handleMilestoneToggle = (e, milestone) => {
    e.stopPropagation();
    onUpdateMilestone(goal._id, milestone._id, { completed: !milestone.completed });
  };

  return (
    <div 
      className={`bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-all duration-300 shadow-xl ${expanded ? 'ring-1 ring-indigo-500/30' : ''}`}
    >
      <div 
        className="cursor-pointer flex flex-col gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-gradient-to-r border ${colorScheme}`}>
                {goal.category}
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                <div className={`w-2 h-2 rounded-full ${dotColor} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                <span className="text-[10px] text-slate-400 uppercase font-semibold">{goal.priority}</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-100 truncate group-hover:text-indigo-400 transition-colors">
              {goal.title}
            </h3>
            {goal.targetDate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <Calendar size={12} />
                <span>Due: {new Date(goal.targetDate).toLocaleDateString()}</span>
              </div>
            )}
            {goal.prediction && (
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                  goal.prediction.riskLevel === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  goal.prediction.riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {goal.prediction.riskLevel} Risk
                </span>
                <span className="text-[10px] text-slate-400">ETA: {goal.prediction.estimatedCompletion}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onClickEdit(goal); }}
              className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
            >
              Edit
            </button>
            <div className="flex items-center gap-1 text-slate-500">
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <TrendingUp size={12} /> Progress
            </span>
            <span className="font-medium text-slate-200">{goal.progress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out relative"
              style={{ width: `${goal.progress}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-5 pt-5 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-4 duration-300">
          {goal.description && (
            <p className="text-sm text-slate-300 mb-5 leading-relaxed bg-slate-900/30 p-3 rounded-lg border border-slate-800/50">
              {goal.description}
            </p>
          )}

          <div className="mb-5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Target size={14} /> Milestones ({goal.milestones?.filter(m => m.completed).length || 0}/{goal.milestones?.length || 0})
            </h4>
            
            {goal.milestones?.length === 0 ? (
              <p className="text-xs text-slate-500 italic px-2">No milestones set. Ask AI to suggest some!</p>
            ) : (
              <div className="space-y-2">
                {goal.milestones?.map((milestone) => (
                  <div 
                    key={milestone._id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer group"
                    onClick={(e) => handleMilestoneToggle(e, milestone)}
                  >
                    <div className="mt-0.5 text-slate-400 group-hover:text-indigo-400 transition-colors">
                      {milestone.completed ? (
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      ) : (
                        <Circle size={16} />
                      )}
                    </div>
                    <span className={`text-sm transition-colors ${milestone.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                      {milestone.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-5 bg-slate-900/40 rounded-xl border border-slate-700/50 p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap size={14} className="text-indigo-400" /> Activity Log
            </h4>
            
            <div className="space-y-3 mb-4">
              {goal.activityLog?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No activity logged yet. Time to get started!</p>
              ) : (
                <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                  {[...(goal.activityLog || [])].sort((a,b) => new Date(b.date) - new Date(a.date)).map((activity) => (
                    <div key={activity._id} className="flex gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-slate-300">{activity.text}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{new Date(activity.date).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const text = form.activityText.value;
                if (!text.trim()) return;
                // Import useGoalStore from the component if needed, but better pass via props.
                // Wait, I need to pass onLogActivity as prop.
                if (onLogActivity) {
                  onLogActivity(goal._id, { text });
                  form.reset();
                }
              }}
              className="flex gap-2"
            >
              <input
                name="activityText"
                type="text"
                placeholder="Log progress (e.g., 'Scored 50 runs today')"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                onClick={e => e.stopPropagation()}
              />
              <button 
                type="submit"
                onClick={e => e.stopPropagation()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors text-xs font-medium shadow-lg shadow-indigo-500/20"
              >
                Log
              </button>
            </form>
          </div>

          <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
            <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2 relative z-10">
              <Zap size={14} className="animate-pulse" /> AI Suggestions
            </h4>
            
            {goal.aiSuggestions?.length > 0 ? (
              <ul className="space-y-2 text-sm text-slate-300 relative z-10 list-disc pl-4">
                {goal.aiSuggestions.map((suggestion, idx) => (
                  <li key={idx} className="pl-1 text-indigo-200/80">{suggestion}</li>
                ))}
              </ul>
            ) : (
              <div className="relative z-10 flex flex-col items-start gap-3">
                <p className="text-xs text-slate-400">Get personalized next steps from AI LifeOS based on your goal.</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); onGenerateAiSuggestions(goal._id); }}
                  className="text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
                >
                  <Zap size={12} /> Generate Suggestions
                </button>
              </div>
            )}
          </div>

          {/* Goal Prediction Area */}
          <div className="mt-4 bg-slate-900/30 border border-slate-700/50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" /> AI Goal Prediction
            </h4>
            {goal.prediction ? (
              <div className="text-sm text-slate-400">
                <p className="mb-2"><span className="text-slate-200 font-medium">Success Rate:</span> {goal.prediction.successRate}%</p>
                <p className="italic text-slate-300">{goal.prediction.insight}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); onPredictGoal(goal._id); }}
                  className="mt-3 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Refresh Prediction
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3">
                <p className="text-xs text-slate-400">Analyze your task and habit history to predict if you'll hit this goal.</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); onPredictGoal && onPredictGoal(goal._id); }}
                  className="text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <AlertTriangle size={12} /> Predict Outcome
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default GoalCard;
