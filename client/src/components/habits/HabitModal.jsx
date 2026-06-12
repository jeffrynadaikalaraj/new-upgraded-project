import React, { useState, useEffect } from 'react';
import { X, Activity, Clock, Tag, Palette } from 'lucide-react';
import Button from '../ui/Button';

const CATEGORIES = ['health', 'fitness', 'productivity', 'mindfulness', 'learning', 'other'];
const FREQUENCIES = ['daily', 'weekly', 'custom'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PRESET_ICONS = ['✅', '💪', '🧘', '📚', '🏃', '💧', '🥗', '🧠', '✍️', '🎯', '🌟', '🔥', '🎸', '💤', '🏋️'];

const PRESET_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
  '#14b8a6', // teal
  '#f97316', // orange
  '#a855f7', // purple
];

const INITIAL_FORM = {
  title: '',
  description: '',
  frequency: 'daily',
  customDays: [],
  category: 'health',
  icon: '✅',
  color: '#6366f1',
  remindAt: '',
};

const HabitModal = ({ isOpen, onClose, onSave, habit = null }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (habit) {
        setFormData({
          title: habit.title || '',
          description: habit.description || '',
          frequency: habit.frequency || 'daily',
          customDays: habit.customDays || [],
          category: habit.category || 'health',
          icon: habit.icon || '✅',
          color: habit.color || '#6366f1',
          remindAt: habit.remindAt || '',
        });
      } else {
        setFormData(INITIAL_FORM);
      }
    }
  }, [isOpen, habit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch {
      // error handled by store
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCustomDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      customDays: prev.customDays.includes(day)
        ? prev.customDays.filter((d) => d !== day)
        : [...prev.customDays, day],
    }));
  };

  const set = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity size={20} className="text-indigo-400" />
            {habit ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="habit-form" onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Habit Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => set('title', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="e.g. Meditate for 10 minutes"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Description <span className="normal-case font-normal text-slate-600">(optional)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => set('description', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none h-20"
                placeholder="Why is this habit important to you?"
              />
            </div>

            {/* Icon & Color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Icon</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_ICONS.map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => set('icon', ico)}
                      className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${
                        formData.icon === ico
                          ? 'bg-indigo-600 ring-2 ring-indigo-400 shadow-md shadow-indigo-500/30'
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Palette size={12} /> Color
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => set('color', col)}
                      className={`w-7 h-7 rounded-full transition-all ${
                        formData.color === col ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
                {/* Preview */}
                <div
                  className="mt-3 h-1.5 rounded-full transition-all"
                  style={{ backgroundColor: formData.color }}
                />
              </div>
            </div>

            {/* Category & Frequency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag size={12} /> Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all capitalize"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Frequency
                </label>
                <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 gap-0.5">
                  {FREQUENCIES.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => set('frequency', f)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                        formData.frequency === f
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom days picker */}
            {formData.frequency === 'custom' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Active Days
                </label>
                <div className="flex gap-2">
                  {DAY_NAMES.map((name, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleCustomDay(idx)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                        formData.customDays.includes(idx)
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'
                      }`}
                    >
                      {name[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reminder */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock size={12} /> Reminder Time <span className="normal-case font-normal text-slate-600">(optional)</span>
              </label>
              <input
                type="time"
                value={formData.remindAt}
                onChange={(e) => set('remindAt', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                style={{ colorScheme: 'dark' }}
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" form="habit-form" type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : habit ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HabitModal;
