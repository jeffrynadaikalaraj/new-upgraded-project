import React, { useEffect, useState, useMemo } from 'react';
import {
  Brain, Search, Trash2, X, AlertTriangle, Sparkles,
  Star, Tag, Clock, Zap, Heart, Lightbulb, Calendar
} from 'lucide-react';
import { useMemoryStore } from '../stores/memoryStore';
import Button from '../components/ui/Button';

/* ─────────── helpers ─────────── */
const TYPE_META = {
  fact:       { label: 'Fact',       color: 'text-sky-400',    bg: 'bg-sky-500/10  border-sky-500/20',    icon: Zap },
  preference: { label: 'Preference', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', icon: Heart },
  event:      { label: 'Event',      color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20',  icon: Calendar },
  insight:    { label: 'Insight',    color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/20', icon: Lightbulb },
};

const importanceMeta = (n) => {
  if (n >= 8) return { label: 'Critical',  color: 'text-rose-400',   bg: 'bg-rose-500/10   border-rose-500/20' };
  if (n >= 6) return { label: 'High',      color: 'text-amber-400',  bg: 'bg-amber-500/10  border-amber-500/20' };
  if (n >= 4) return { label: 'Medium',    color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' };
  return              { label: 'Low',      color: 'text-slate-400',  bg: 'bg-slate-500/10  border-slate-600/40' };
};

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

/* ─────────── sub-components ─────────── */
const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${className}`}>
    {children}
  </span>
);

const MemoryCard = ({ memory, onDelete }) => {
  const tm = TYPE_META[memory.type] || TYPE_META.fact;
  const im = importanceMeta(memory.importance);
  const TypeIcon = tm.icon;

  return (
    <div className="group relative glass rounded-2xl p-5 border border-slate-700/40 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col gap-3">
      {/* Delete button */}
      <button
        onClick={() => onDelete(memory._id)}
        title="Delete memory"
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg p-1"
      >
        <Trash2 size={14} />
      </button>

      {/* Type + Importance badges */}
      <div className="flex items-center gap-2 flex-wrap pr-6">
        <Badge className={`${tm.bg} ${tm.color}`}>
          <TypeIcon size={10} />
          {tm.label}
        </Badge>
        <Badge className={`${im.bg} ${im.color}`}>
          <Star size={10} />
          {im.label} ({memory.importance}/10)
        </Badge>
      </div>

      {/* Content */}
      <p className="text-slate-200 text-sm leading-relaxed flex-1">
        {memory.content}
      </p>

      {/* Tags */}
      {memory.tags && memory.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Tag size={11} className="text-slate-500 flex-shrink-0" />
          {memory.tags.map((tag) => (
            <span key={tag} className="text-[10px] text-slate-500 bg-slate-800/60 border border-slate-700/40 rounded-full px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Date */}
      <div className="flex items-center gap-1 text-[11px] text-slate-500 border-t border-slate-700/40 pt-2 mt-1">
        <Clock size={10} />
        {fmtDate(memory.createdAt)}
      </div>
    </div>
  );
};

/* ─────────── Confirm Modal ─────────── */
const ConfirmModal = ({ onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 bg-rose-500/5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-rose-400 flex items-center gap-2">
          <AlertTriangle size={18} />
          Clear All Memories
        </h2>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-white transition-colors w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-800"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 text-slate-300 text-sm leading-relaxed">
        This will permanently erase <span className="text-white font-semibold">all memories</span> AI LifeOS
        has stored about you. The AI will no longer recall any of your preferences, goals, or personal facts.
        <p className="mt-3 text-slate-500 text-xs">This action cannot be undone.</p>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-slate-800 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
          Yes, Clear All
        </Button>
      </div>
    </div>
  </div>
);

/* ─────────── Empty State ─────────── */
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto text-center py-20">
    {/* Animated brain graphic */}
    <div className="relative mb-8">
      <div className="w-28 h-28 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
        <Brain size={52} className="text-indigo-400 opacity-60" />
      </div>
      <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center animate-pulse">
        <Sparkles size={14} className="text-violet-400" />
      </div>
    </div>
    <h3 className="text-xl font-bold text-slate-200 mb-3">No memories stored yet</h3>
    <p className="text-slate-500 text-sm leading-relaxed">
      Start a conversation in <span className="text-indigo-400 font-medium">AI Chat</span> and share
      something personal — a goal, a preference, a habit. AI LifeOS will remember it here.
    </p>
    <div className="mt-8 grid grid-cols-2 gap-3 w-full text-left">
      {[
        { icon: Heart, text: '"My favorite language is Python"', color: 'text-violet-400' },
        { icon: Zap,   text: '"I wake up at 5 AM every day"',   color: 'text-sky-400' },
        { icon: Lightbulb, text: '"I want to become a founder"', color: 'text-emerald-400' },
        { icon: Calendar,  text: '"My birthday is March 15"',   color: 'text-amber-400' },
      ].map(({ icon: Icon, text, color }) => (
        <div key={text} className="glass rounded-xl p-3 border border-slate-700/40 flex items-start gap-2">
          <Icon size={13} className={`${color} flex-shrink-0 mt-0.5`} />
          <span className="text-xs text-slate-400 italic">{text}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────── Main Page ─────────── */
const MemoryPage = () => {
  const { memories, isLoading, error, fetchMemories, deleteMemory, clearMemories } = useMemoryStore();

  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState('all');
  const [showConfirm, setShowConfirm]   = useState(false);
  const [isClearing, setIsClearing]     = useState(false);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  /* ── filtered list (local, instant) ── */
  const filtered = useMemo(() => {
    let list = [...memories];

    if (typeFilter !== 'all') {
      list = list.filter((m) => m.type === typeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.content.toLowerCase().includes(q) ||
          (m.tags && m.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [memories, search, typeFilter]);

  const handleDelete = async (id) => {
    try {
      await deleteMemory(id);
    } catch {
      // error already in store
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await clearMemories();
      setShowConfirm(false);
    } catch {
      // error already in store
    } finally {
      setIsClearing(false);
    }
  };

  const typeFilters = ['all', 'fact', 'preference', 'event', 'insight'];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-900 w-full relative">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* ── Header ── */}
      <div className="flex items-center justify-between p-8 pb-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Brain className="text-indigo-400" size={22} />
            </div>
            AI Memory
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {memories.length > 0
              ? `${memories.length} memor${memories.length === 1 ? 'y' : 'ies'} stored — the AI uses these in every conversation.`
              : 'Start chatting to let AI LifeOS learn about you.'}
          </p>
        </div>

        {memories.length > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 size={14} className="mr-1.5" />
            Clear All
          </Button>
        )}
      </div>

      {/* ── Search + Type Filters ── */}
      <div className="px-8 pb-5 pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 relative z-10 border-b border-slate-800">
        {/* Search */}
        <div className="relative flex-1 min-w-0 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="memory-search"
            type="text"
            placeholder="Search memories or tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 backdrop-blur-md transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Type filter pills */}
        <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/50 backdrop-blur-md gap-0.5 flex-wrap">
          {typeFilters.map((t) => {
            const meta = t !== 'all' ? TYPE_META[t] : null;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  typeFilter === t
                    ? 'bg-slate-700 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {meta && React.createElement(meta.icon, { size: 11, className: meta.color })}
                {t === 'all' ? 'All' : meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && memories.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-5 border border-slate-700/40 animate-pulse">
                <div className="flex gap-2 mb-4">
                  <div className="h-5 w-20 bg-slate-700/60 rounded-full" />
                  <div className="h-5 w-24 bg-slate-700/60 rounded-full" />
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-slate-700/60 rounded w-full" />
                  <div className="h-3 bg-slate-700/60 rounded w-4/5" />
                  <div className="h-3 bg-slate-700/60 rounded w-3/5" />
                </div>
                <div className="h-3 bg-slate-700/40 rounded w-24" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && memories.length === 0 && <EmptyState />}

        {/* No results from filter */}
        {!isLoading && memories.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <Search size={28} className="text-slate-600" />
            </div>
            <h3 className="text-slate-300 font-semibold mb-1">No memories found</h3>
            <p className="text-slate-500 text-sm">Try a different search term or filter.</p>
          </div>
        )}

        {/* Results count when searching */}
        {!isLoading && memories.length > 0 && filtered.length > 0 && (search || typeFilter !== 'all') && (
          <p className="text-xs text-slate-500 mb-4">
            Showing {filtered.length} of {memories.length} memor{memories.length === 1 ? 'y' : 'ies'}
          </p>
        )}

        {/* Memory grid */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((memory) => (
              <MemoryCard key={memory._id} memory={memory} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Confirm Clear All Modal */}
      {showConfirm && (
        <ConfirmModal
          onConfirm={handleClearAll}
          onCancel={() => setShowConfirm(false)}
          isLoading={isClearing}
        />
      )}
    </div>
  );
};

export default MemoryPage;
