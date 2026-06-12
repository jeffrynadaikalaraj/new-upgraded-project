import React, { useEffect, useState } from 'react';
import { Activity, Plus, Flame, TrendingUp, CheckCircle2, Archive } from 'lucide-react';
import { useHabitStore } from '../stores/habitStore';
import HabitCard from '../components/habits/HabitCard';
import HabitModal from '../components/habits/HabitModal';
import Button from '../components/ui/Button';
import { PageSkeleton } from '../components/common/LoadingSkeleton';

// ── Quick stats bar ───────────────────────────────────────────────────────────
const StatPill = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl px-5 py-3">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-xl font-bold text-slate-100 leading-none">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
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
    <div className="flex flex-col h-full overflow-hidden bg-slate-900 w-full relative">
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/6 rounded-full blur-3xl pointer-events-none" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-8 pb-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="text-violet-400" size={32} />
            My Habits
          </h1>
          <p className="text-slate-400 mt-1.5 text-sm">
            Build consistency one day at a time.
          </p>
        </div>
        <Button onClick={handleOpenNew} className="shadow-lg shadow-violet-500/20">
          <Plus size={18} /> New Habit
        </Button>
      </div>

      {/* ── Quick stats ─────────────────────────────────────────────────────── */}
      {totalHabits > 0 && (
        <div className="px-8 pb-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatPill icon={Activity}    label="Total Habits"     value={totalHabits}     color="bg-violet-500/20 text-violet-400" />
            <StatPill icon={CheckCircle2} label="Done Today"      value={`${completedToday}/${totalHabits}`} color="bg-emerald-500/20 text-emerald-400" />
            <StatPill icon={Flame}       label="On a Streak"      value={onStreakCount}    color="bg-orange-500/20 text-orange-400" />
            <StatPill icon={TrendingUp}  label="Best Streak Ever" value={`${bestStreak}d`} color="bg-blue-500/20 text-blue-400" />
          </div>
        </div>
      )}

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <div className="px-8 pb-5 pt-1 flex items-center gap-3 relative z-10 border-b border-slate-800/80 overflow-x-auto">
        <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/50 backdrop-blur-md gap-0.5 flex-shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-sm">
            <span className="flex-1">{error}</span>
            <button onClick={clearError} className="text-rose-500 hover:text-rose-300 transition-colors font-bold">✕</button>
          </div>
        )}

        {/* Loading */}
        {isLoading && habits.length === 0 ? (
          <PageSkeleton title="My Habits" showHeader={false} />
        ) : filteredHabits.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto text-center">
            <div className="w-24 h-24 bg-violet-500/10 rounded-full flex items-center justify-center mb-6 relative">
              <Activity size={44} className="text-violet-400 opacity-50" />
              <div className="absolute -right-1 -top-1 w-7 h-7 bg-orange-500/20 rounded-full flex items-center justify-center text-base">🔥</div>
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">
              {filterCategory === 'all' ? '🔥 No habits created' : `No ${filterCategory} habits`}
            </h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
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
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm shadow-md shadow-amber-500/20"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitsPage;
