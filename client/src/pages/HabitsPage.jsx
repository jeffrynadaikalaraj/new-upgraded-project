import React, { useEffect, useState } from 'react';
import { Activity, Plus, Flame, TrendingUp, CheckCircle2, Archive } from 'lucide-react';
import { useHabitStore } from '../stores/habitStore';
import HabitCard from '../components/habits/HabitCard';
import HabitModal from '../components/habits/HabitModal';
import Button from '../components/ui/Button';
import { PageSkeleton } from '../components/common/LoadingSkeleton';
import { motion } from 'framer-motion';

// ── Quick stats bar ───────────────────────────────────────────────────────────
const StatPill = ({ icon: Icon, label, value, color }) => (
  <div className="premium-card-hover flex items-center gap-3 px-5 py-3.5">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner-glow ${color}`}>
      <Icon size={16} />
    </div>
    <div>
      <p className="text-xl font-bold text-white leading-none tracking-tight">{value}</p>
      <p className="text-2xs text-slate-500 mt-0.5 font-semibold uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

// ── Page ─────────────────────────────────────────────────────────────────────
const HabitsPage = () => {
  const {
    habits,
    isLoading,
    error,
    fetchHabits,
    createHabit,
    updateHabit,
    archiveHabit,
    completeHabit,
    uncompleteHabit,
    clearError,
  } = useHabitStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(null); // habit id

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleOpenNew = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    if (editingHabit) {
      await updateHabit(editingHabit._id, formData);
    } else {
      await createHabit(formData);
    }
  };

  const handleArchive = (id) => {
    setShowArchiveConfirm(id);
  };

  const confirmArchive = async () => {
    if (showArchiveConfirm) {
      await archiveHabit(showArchiveConfirm);
      setShowArchiveConfirm(null);
    }
  };

  // ── Derived stats ────────────────────────────────────────────────────────────

  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => h.todayCompleted).length;
  const onStreakCount = habits.filter((h) => (h.streak?.current ?? 0) > 0).length;
  const bestStreak = habits.reduce((best, h) => Math.max(best, h.streak?.longest ?? 0), 0);

  // ── Filtered list ─────────────────────────────────────────────────────────

  const CATEGORIES = ['all', 'health', 'fitness', 'productivity', 'mindfulness', 'learning', 'other'];

  const filteredHabits = habits.filter((h) =>
    filterCategory === 'all' ? true : h.category === filterCategory
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="page-container">
      {/* Ambient Background Orbs */}
      <div className="ambient-orb-primary w-[500px] h-[500px] -top-40 -right-40 bg-violet-500/[0.06]" />
      <div className="ambient-orb-secondary w-[400px] h-[400px] -bottom-40 -left-40 bg-emerald-500/[0.04]" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
              <Activity className="text-violet-400" size={22} />
            </div>
            My Habits
          </h1>
          <p className="page-subtitle">
            Build consistency one day at a time.
          </p>
        </div>
        <Button onClick={handleOpenNew} className="shadow-glow-sm">
          <Plus size={18} /> New Habit
        </Button>
      </div>

      {/* ── Quick stats ─────────────────────────────────────────────────────── */}
      {totalHabits > 0 && (
        <div className="px-6 md:px-8 pb-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatPill icon={Activity}    label="Total Habits"     value={totalHabits}     color="bg-violet-500/15 text-violet-400 border-violet-500/25" />
            <StatPill icon={CheckCircle2} label="Done Today"      value={`${completedToday}/${totalHabits}`} color="bg-emerald-500/15 text-emerald-400 border-emerald-500/25" />
            <StatPill icon={Flame}       label="On a Streak"      value={onStreakCount}    color="bg-orange-500/15 text-orange-400 border-orange-500/25" />
            <StatPill icon={TrendingUp}  label="Best Streak Ever" value={`${bestStreak}d`} color="bg-blue-500/15 text-blue-400 border-blue-500/25" />
          </div>
        </div>
      )}

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <div className="filter-bar">
        <div className="filter-pill-group">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={filterCategory === cat ? 'filter-pill-active' : 'filter-pill-inactive'}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="page-content">

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-sm font-medium">
            <span className="flex-1">{error}</span>
            <button onClick={clearError} className="text-rose-500 hover:text-rose-300 transition-colors font-bold">✕</button>
          </div>
        )}

        {/* Loading */}
        {isLoading && habits.length === 0 ? (
          <PageSkeleton title="My Habits" showHeader={false} />
        ) : filteredHabits.length === 0 ? (
          /* Empty state */
          <div className="empty-state">
            <div className="empty-state-icon">
              <Activity size={40} className="text-violet-400 opacity-60" />
              <div className="absolute -right-1 -top-1 w-8 h-8 bg-orange-500/15 border border-orange-500/20 rounded-full flex items-center justify-center text-base">🔥</div>
            </div>
            <h3 className="empty-state-title">
              {filterCategory === 'all' ? '🔥 No habits created' : `No ${filterCategory} habits`}
            </h3>
            <p className="empty-state-description">
              {filterCategory === 'all'
                ? 'Small daily actions create massive results.'
                : `Try another category or create your first ${filterCategory} habit.`}
            </p>
            {filterCategory === 'all' && (
              <Button onClick={handleOpenNew} variant="primary">
                <Plus size={16} /> Create Your First Habit
              </Button>
            )}
          </div>
        ) : (
          /* Habit grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredHabits.map((habit) => (
              <HabitCard
                key={habit._id}
                habit={habit}
                onEdit={handleOpenEdit}
                onArchive={handleArchive}
                onComplete={completeHabit}
                onUncomplete={uncompleteHabit}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        habit={editingHabit}
      />

      {/* Archive confirm */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="premium-card p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/20 rounded-xl flex items-center justify-center">
                <Archive size={20} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Archive Habit?</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              This habit will be archived and removed from your active list. Your streak history will be preserved.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowArchiveConfirm(null)}>Cancel</Button>
              <button
                onClick={confirmArchive}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 text-sm shadow-md shadow-amber-500/20 active:scale-[0.97]"
              >
                Archive
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HabitsPage;
