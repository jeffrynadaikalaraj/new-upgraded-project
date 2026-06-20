import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, ListPlus } from 'lucide-react';
import Button from '../ui/Button';
import { goalCategories } from '../../data/goalCategories';

const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const GoalModal = ({ isOpen, onClose, onSave, goal = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'sports',
    subcategory: '',
    priority: 'medium',
    targetDate: '',
    status: 'active',
    milestones: []
  });
  
  const [newMilestone, setNewMilestone] = useState('');

  useEffect(() => {
    if (goal && isOpen) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        category: goal.category || 'sports',
        subcategory: goal.subcategory || '',
        priority: goal.priority || 'medium',
        targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
        status: goal.status || 'active',
        milestones: goal.milestones || []
      });
    } else if (isOpen) {
      // Reset form on open new
      setFormData({
        title: '',
        description: '',
        category: 'sports',
        subcategory: '',
        priority: 'medium',
        targetDate: '',
        status: 'active',
        milestones: []
      });
      setNewMilestone('');
    }
  }, [goal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: newMilestone.trim(), completed: false }]
    }));
    setNewMilestone('');
  };

  const removeMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Target size={20} className="text-indigo-400" />
            {goal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="goal-form" onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Goal Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="e.g. Learn React Native in 30 days"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none h-24"
                placeholder="Why do you want to achieve this?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const newCategory = e.target.value;
                    const defaultSub = goalCategories.find(c => c.id === newCategory)?.subcategories[0] || '';
                    setFormData({...formData, category: newCategory, subcategory: defaultSub});
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all capitalize"
                >
                  {goalCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                  <option value="other">Other</option>
                  <option value="career">Career</option>
                  <option value="health">Health</option>
                  <option value="finance">Finance</option>
                  <option value="learning">Learning</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subcategory / Focus Area</label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                >
                  {(() => {
                    const catObj = goalCategories.find(c => c.id === formData.category);
                    if (!catObj) return <option value={formData.subcategory || 'other'}>{formData.subcategory || 'Other'}</option>;
                    const subs = catObj.subcategories || [];
                    if (formData.subcategory && !subs.includes(formData.subcategory)) {
                      return (
                        <>
                          <option value={formData.subcategory}>{formData.subcategory}</option>
                          {subs.map(s => <option key={s} value={s}>{s}</option>)}
                        </>
                      );
                    }
                    return subs.map(s => <option key={s} value={s}>{s}</option>);
                  })()}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all capitalize"
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar size={14} /> Target Date
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              
              {goal && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Is the goal finished?</label>
                  <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, status: 'active'})}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.status !== 'completed'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      No (Active)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, status: 'completed'})}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.status === 'completed'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      Yes (Finished)
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ListPlus size={14} /> Milestones
              </label>
              
              <div className="space-y-2 mb-3">
                {formData.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                    <span className="flex-1 text-sm text-slate-200 truncate pl-2">{m.title}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMilestone(); } }}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="Add a milestone step..."
                />
                <button 
                  type="button"
                  onClick={addMilestone}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl transition-colors text-sm font-medium border border-slate-700"
                >
                  Add
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" form="goal-form" type="submit">
            {goal ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default GoalModal;
