import React, { useState } from 'react';
import { Target, CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, Zap, Calendar, TrendingUp } from 'lucide-react';
import { activityMetrics } from '../../data/activityMetrics';

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

const ActivityLogForm = ({ goal, onLogActivity }) => {
  const metricsConfig = activityMetrics[goal.subcategory];
  
  const [text, setText] = useState('');
  const [type, setType] = useState(metricsConfig ? metricsConfig.types[0].id : '');
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !value) return;

    const payload = { text };
    if (metricsConfig && type && value) {
      const selectedType = metricsConfig.types.find(t => t.id === type);
      payload.type = selectedType.label;
      payload.metric = selectedType.metric;
      payload.value = Number(value);
      if (!text.trim()) {
        payload.text = `Logged ${selectedType.label}`;
      }
    }

    if (onLogActivity) {
      onLogActivity(goal._id, payload);
      setText('');
      setValue('');
    }
  };

  if (!metricsConfig) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Log progress (e.g., 'Ran 5km today')"
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
    );
  }

  const selectedType = metricsConfig.types.find(t => t.id === type);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
      <div className="flex gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          onClick={e => e.stopPropagation()}
          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          {metricsConfig.types.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
        
        <div className="flex-1 relative">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Amount...`}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-12 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            onClick={e => e.stopPropagation()}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
            {selectedType?.metric}
          </span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Optional note..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          onClick={e => e.stopPropagation()}
        />
        <button 
          type="submit"
          onClick={e => e.stopPropagation()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors text-xs font-medium shadow-lg shadow-indigo-500/20"
        >
          Save
        </button>
      </div>
    </form>
  );
};

const GoalCard = ({ goal, onUpdateMilestone, onClickEdit, onGenerateAiSuggestions, onLogActivity }) => {
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
          {goal.targetValue > 0 && (
            <div className="flex justify-between items-center mt-2 text-[11px]">
              <span className="text-emerald-400 font-medium">
                Completed: {goal.currentValue || 0} {goal.targetMetric || 'units'}
              </span>
              <span className="text-slate-500">
                Remaining: {Math.max(0, goal.targetValue - (goal.currentValue || 0))} {goal.targetMetric || 'units'}
              </span>
            </div>
          )}
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
                {goal.milestones?.map((milestone) => {
                  const hasNumericTarget = milestone.targetValue > 0 && goal.targetValue > 0;
                  const milestoneProgress = hasNumericTarget
                    ? Math.min(100, Math.round(((goal.currentValue || 0) / milestone.targetValue) * 100))
                    : 0;

                  return (
                    <div 
                      key={milestone._id}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer group"
                      onClick={(e) => handleMilestoneToggle(e, milestone)}
                    >
                      <div className="mt-0.5 text-slate-400 group-hover:text-indigo-400 transition-colors shrink-0">
                        {milestone.completed ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : (
                          <Circle size={16} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm transition-colors block ${milestone.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                          {milestone.title}
                        </span>
                        {hasNumericTarget && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  milestone.completed
                                    ? 'bg-emerald-500'
                                    : 'bg-gradient-to-r from-indigo-500/80 to-purple-500/80'
                                }`}
                                style={{ width: `${milestone.completed ? 100 : milestoneProgress}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                              {Math.min(goal.currentValue || 0, milestone.targetValue)}/{milestone.targetValue} {goal.targetMetric || ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  {[...(goal.activityLog || [])].sort((a,b) => new Date(b.date) - new Date(a.date)).map((activity) => (
                    <div key={activity._id} className="flex gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-slate-300">
                          {activity.text} 
                          {activity.type && activity.value && (
                            <span className="ml-2 text-xs font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                              {activity.type}: {activity.value} {activity.metric}
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 mb-1.5">{new Date(activity.date).toLocaleString()}</p>
                        {activity.aiFeedback && (
                          <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-lg p-2 mt-1">
                            <p className="text-xs text-indigo-300 flex items-start gap-1.5 italic">
                              <Zap size={12} className="mt-0.5 shrink-0" />
                              {activity.aiFeedback}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <ActivityLogForm 
              goal={goal} 
              onLogActivity={onLogActivity} 
            />
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



        </div>
      )}
    </div>
  );
};

export default GoalCard;
