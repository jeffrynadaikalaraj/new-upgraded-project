import React, { useEffect, useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { useGoalStore } from '../stores/goalStore';
import GoalCard from '../components/goals/GoalCard';
import GoalModal from '../components/goals/GoalModal';
import GoalWizard from '../components/goals/GoalWizard';
import Button from '../components/ui/Button';
import { PageSkeleton } from '../components/common/LoadingSkeleton';
import { goalCategories } from '../data/goalCategories';

const GoalsPage = () => {
  const { goals, isLoading, fetchGoals, createGoal, updateGoal, updateMilestone, generateAiSuggestions, logActivity } = useGoalStore();
  
  const [filterStatus, setFilterStatus] = useState('active');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleOpenNew = () => {
    setEditingGoal(null);
    setIsWizardOpen(true);
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
      setIsWizardOpen(false);
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
    <div className="page-container">
      {/* Ambient Background Orbs */}
      <div className="ambient-orb-primary w-[600px] h-[600px] -top-40 -right-40" />
      <div className="ambient-orb-secondary w-[400px] h-[400px] -bottom-40 -left-40" />

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
              <Target className="text-brand-400" size={22} />
            </div>
            My Goals
          </h1>
          <p className="page-subtitle">Track your progress and get AI-powered next steps.</p>
        </div>
        <Button onClick={handleOpenNew} className="shadow-glow-sm">
          <Plus size={18} /> New Goal
        </Button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-pill-group">
          {['active', 'completed', 'all'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={filterStatus === status ? 'filter-pill-active' : 'filter-pill-inactive'}
            >
              {status}
            </button>
          ))}
        </div>

        <select 
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/20 backdrop-blur-md capitalize transition-all duration-300 cursor-pointer"
        >
          <option value="all">All Categories</option>
          {goalCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
          {/* Include legacy options just in case */}
          <option value="health">Health</option>
          <option value="learning">Learning</option>
          <option value="personal">Personal</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Content */}
      <div className="page-content">
        {isLoading && goals.length === 0 ? (
          <PageSkeleton title="My Goals" showHeader={false} />
        ) : filteredGoals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Target size={44} className="text-brand-400 opacity-60" />
            </div>
            <h3 className="empty-state-title">🎯 No goals yet</h3>
            <p className="empty-state-description">
              {filterStatus === 'active' 
                ? "Create your first goal and start building momentum." 
                : "Try changing your filters to see more goals."}
            </p>
            <Button onClick={handleOpenNew} variant="primary">Create Your First Goal</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredGoals.map(goal => (
              <GoalCard 
                key={goal._id} 
                goal={goal} 
                onClickEdit={handleOpenEdit}
                onUpdateMilestone={updateMilestone}
                onGenerateAiSuggestions={generateAiSuggestions}
                onLogActivity={logActivity}
              />
            ))}
          </div>
        )}
      </div>

      {/* Editing Modal */}
      <GoalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveGoal}
        goal={editingGoal}
      />

      {/* Creation Wizard */}
      <GoalWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSave={handleSaveGoal}
      />
    </div>
  );
};

export default GoalsPage;
