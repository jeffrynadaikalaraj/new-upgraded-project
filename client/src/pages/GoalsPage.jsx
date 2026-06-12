import React, { useEffect, useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { useGoalStore } from '../stores/goalStore';
import GoalCard from '../components/goals/GoalCard';
import GoalModal from '../components/goals/GoalModal';
import Button from '../components/ui/Button';
import { PageSkeleton } from '../components/common/LoadingSkeleton';

const GoalsPage = () => {
  const { goals, isLoading, fetchGoals, createGoal, updateGoal, updateMilestone, generateAiSuggestions } = useGoalStore();
  
  const [filterStatus, setFilterStatus] = useState('active');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleOpenNew = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (goalData) => {
    try {
      if (editingGoal) {
        await updateGoal(editingGoal._id, goalData);
      } else {
        await createGoal(goalData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save goal', err);
    }
  };

  const filteredGoals = goals.filter(goal => {
    if (filterStatus !== 'all' && goal.status !== filterStatus) return false;
    if (filterCategory !== 'all' && goal.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-900 w-full relative">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between p-8 pb-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Target className="text-indigo-400" size={32} />
            My Goals
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Track your progress and get AI-powered next steps.</p>
        </div>
        <Button onClick={handleOpenNew} className="shadow-lg shadow-indigo-500/20">
          <Plus size={18} /> New Goal
        </Button>
      </div>

      {/* Filters */}
      <div className="px-8 pb-6 pt-2 flex items-center gap-4 relative z-10 border-b border-slate-800">
        <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/50 backdrop-blur-md">
          {['active', 'completed', 'all'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                filterStatus === status 
                  ? 'bg-slate-700 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <select 
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 backdrop-blur-md capitalize"
        >
          <option value="all">All Categories</option>
          <option value="career">Career</option>
          <option value="health">Health</option>
          <option value="finance">Finance</option>
          <option value="learning">Learning</option>
          <option value="personal">Personal</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
        {isLoading && goals.length === 0 ? (
          <PageSkeleton title="My Goals" showHeader={false} />
        ) : filteredGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center">
            <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
              <Target size={48} className="text-indigo-400 opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">🎯 No goals yet</h3>
            <p className="text-slate-400 text-sm mb-8">
              {filterStatus === 'active' 
                ? "Create your first goal and start building momentum." 
                : "Try changing your filters to see more goals."}
            </p>
            <Button onClick={handleOpenNew} variant="primary">Create Your First Goal</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredGoals.map(goal => (
              <GoalCard 
                key={goal._id} 
                goal={goal} 
                onClickEdit={handleOpenEdit}
                onUpdateMilestone={updateMilestone}
                onGenerateAiSuggestions={generateAiSuggestions}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <GoalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveGoal}
        goal={editingGoal}
      />
    </div>
  );
};

export default GoalsPage;
