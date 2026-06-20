import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Target, Calendar, ListPlus, Trash2, Search, Zap, Ruler } from 'lucide-react';
import Button from '../ui/Button';
import { goalCategories } from '../../data/goalCategories';

const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const GoalWizard = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    targetDate: '',
    targetValue: '',
    targetMetric: '',
    milestones: []
  });
  const [newMilestone, setNewMilestone] = useState('');
  const [newMilestoneTarget, setNewMilestoneTarget] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSearchQuery('');
      setSelectedCategoryId('');
      setSelectedSubcategory('');
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        targetDate: '',
        targetValue: '',
        targetMetric: '',
        milestones: []
      });
      setNewMilestone('');
      setNewMilestoneTarget('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSearchQuery('');
    setStep(2);
  };

  const handleSubcategorySelect = (sub) => {
    setSelectedSubcategory(sub);
    setFormData(prev => ({
      ...prev,
      title: `My ${sub} Goal`
    }));
    setStep(3);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setSearchQuery('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      category: selectedCategoryId,
      subcategory: selectedSubcategory,
      status: 'active'
    };
    // Convert target value to number if provided
    if (payload.targetValue) {
      payload.targetValue = Number(payload.targetValue);
    } else {
      delete payload.targetValue;
      delete payload.targetMetric;
    }
    // Convert milestone targetValues to numbers
    payload.milestones = payload.milestones.map(m => ({
      ...m,
      targetValue: m.targetValue ? Number(m.targetValue) : undefined
    }));
    onSave(payload);
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    const ms = { title: newMilestone.trim(), completed: false };
    if (newMilestoneTarget) {
      ms.targetValue = Number(newMilestoneTarget);
    }
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, ms]
    }));
    setNewMilestone('');
    setNewMilestoneTarget('');
  };

  const removeMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  // Filtered categories
  const filteredCategories = goalCategories.filter(c => 
    c.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.subcategories.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentCategory = goalCategories.find(c => c.id === selectedCategoryId);
  const filteredSubcategories = currentCategory?.subcategories.filter(s => 
    s.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh] max-h-[800px]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30 shrink-0">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button 
                onClick={handleBack}
                className="text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Target size={20} className="text-indigo-400" />
                {step === 1 ? 'Choose a Category' : 
                 step === 2 ? 'Choose a Focus Area' : 
                 'Goal Details'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">Step {step} of 3</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar for Step 1 & 2 */}
        {(step === 1 || step === 2) && (
          <div className="px-6 pt-4 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder={step === 1 ? "Search categories..." : `Search in ${currentCategory?.label}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          
          {/* STEP 1: Categories */}
          {step === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredCategories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="flex flex-col items-center justify-center p-6 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/50 rounded-2xl transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <span className="font-semibold text-slate-200 text-center text-sm">{category.label}</span>
                  </button>
                );
              })}
              {filteredCategories.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">
                  No categories found. Try a different search term.
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Subcategories */}
          {step === 2 && currentCategory && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredSubcategories.map(sub => (
                <button
                  key={sub}
                  onClick={() => handleSubcategorySelect(sub)}
                  className="p-4 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/50 rounded-xl transition-all text-left group"
                >
                  <span className="font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">{sub}</span>
                </button>
              ))}
              {filteredSubcategories.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">
                  No focus areas found.
                </div>
              )}
              {/* Option to create custom subcategory if not found */}
              {searchQuery && filteredSubcategories.length === 0 && (
                <button
                  onClick={() => handleSubcategorySelect(searchQuery)}
                  className="col-span-full p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400 font-medium hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Zap size={16} /> Create custom focus: "{searchQuery}"
                </button>
              )}
            </div>
          )}

          {/* STEP 3: Form */}
          {step === 3 && (
            <form id="wizard-form" onSubmit={handleSubmit} className="space-y-6">
              
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
                {currentCategory && (
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentCategory.color} flex items-center justify-center shrink-0`}>
                    <currentCategory.icon className="text-white" size={20} />
                  </div>
                )}
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Category Selected</div>
                  <div className="text-slate-200 font-medium">{currentCategory?.label} <span className="text-slate-500 mx-1">›</span> {selectedSubcategory}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Goal Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="e.g. Run a 5k under 25 mins"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all resize-none h-24"
                  placeholder="Why is this important to you?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar size={14} /> Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.targetDate}
                    onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                
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

              {/* Target Value & Metric */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Ruler size={14} /> Measurable Target (Optional)
                </label>
                <p className="text-xs text-slate-500 mb-3">Set a numeric target to track concrete progress (e.g. 100 minutes, 50 km).</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="1"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="Target value (e.g. 100)"
                  />
                  <input
                    type="text"
                    value={formData.targetMetric}
                    onChange={(e) => setFormData({...formData, targetMetric: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="Unit (e.g. minutes, km)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ListPlus size={14} /> Initial Milestones (Optional)
                </label>
                
                <div className="space-y-2 mb-3">
                  {formData.milestones.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                      <span className="flex-1 text-sm text-slate-200 truncate pl-2">
                        {m.title}
                        {m.targetValue && (
                          <span className="ml-2 text-xs text-indigo-400 font-medium">
                            @ {m.targetValue} {formData.targetMetric || 'units'}
                          </span>
                        )}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => removeMilestone(idx)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
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
                  {formData.targetValue && (
                    <input
                      type="number"
                      min="1"
                      max={formData.targetValue}
                      value={newMilestoneTarget}
                      onChange={(e) => setNewMilestoneTarget(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMilestone(); } }}
                      className="w-28 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder={`@ ${formData.targetMetric || 'val'}`}
                    />
                  )}
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
          )}

        </div>

        {/* Footer */}
        {step === 3 && (
          <div className="p-5 border-t border-slate-800 bg-slate-900 flex justify-end gap-3 shrink-0">
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button variant="primary" form="wizard-form" type="submit">
              Create Goal
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default GoalWizard;
