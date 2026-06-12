import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Settings, User, Palette, Globe, Moon, Sun, Monitor,
  Brain, Clock, Calendar, Download, Trash2, CheckCircle2,
  AlertTriangle, X, Zap, Shield, Cpu, ChevronRight, Check
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { PageSkeleton } from '../components/common/LoadingSkeleton';

// ─── Constants ────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
  '#84cc16', '#f97316', '#14b8a6', '#a855f7'
];

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Asia/Kolkata', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
];

const AI_MODES = [
  { value: 'auto', label: 'Auto', desc: 'Best model selected automatically', icon: Zap },
  { value: 'cloud', label: 'Cloud', desc: 'Always use Gemini cloud AI', icon: Cpu },
  { value: 'private', label: 'Private', desc: 'Prefer local/private models', icon: Shield },
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionCard = ({ title, icon: Icon, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl"
  >
    <h2 className="text-base font-bold text-slate-100 mb-5 flex items-center gap-2">
      <Icon size={18} className="text-indigo-400" />
      {title}
    </h2>
    {children}
  </motion.div>
);

const FieldRow = ({ label, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-slate-700/30 last:border-0">
    <label className="text-sm font-medium text-slate-300 flex-shrink-0 min-w-[140px]">{label}</label>
    <div className="flex-1">{children}</div>
  </div>
);

const StyledInput = ({ value, onChange, ...props }) => (
  <input
    value={value}
    onChange={onChange}
    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
    {...props}
  />
);

const StyledSelect = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
  >
    {children}
  </select>
);

// Delete Account Confirmation Modal
const DeleteModal = ({ onConfirm, onCancel, isDeleting }) => (
  <AnimatePresence>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl z-10"
      >
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 mx-auto mb-5">
          <AlertTriangle className="text-red-400" size={26} />
        </div>
        <h3 className="text-xl font-bold text-white text-center mb-2">Delete Account?</h3>
        <p className="text-slate-400 text-sm text-center mb-6">
          This will permanently delete your account, goals, habits, memories, chats, plans, and all reports.
          <strong className="text-red-400"> This action cannot be undone.</strong>
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2.5 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</>
            ) : (
              'Yes, Delete Everything'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  </AnimatePresence>
);

// Skeleton loader
const Skeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 animate-pulse">
        <div className="h-4 w-32 bg-slate-700 rounded mb-5" />
        {[1, 2, 3].map(j => (
          <div key={j} className="flex items-center justify-between py-3 border-b border-slate-700/20">
            <div className="h-3 w-28 bg-slate-700 rounded" />
            <div className="h-9 w-48 bg-slate-700 rounded-xl" />
          </div>
        ))}
      </div>
    ))}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const { profile, isLoading, isSaving, isExporting, isDeleting, error, successMessage, fetchProfile, updateProfile, exportData, deleteAccount } = useUserStore();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Local form state
  const [form, setForm] = useState({
    name: '',
    timezone: 'UTC',
    avatarColor: '#6366f1',
    theme: 'dark',
    aiMode: 'auto',
    dailyPlanTime: '06:00',
    weeklyReviewDay: 'sunday',
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Sync form with loaded profile
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        timezone: profile.timezone || 'UTC',
        avatarColor: profile.avatar?.color || '#6366f1',
        theme: profile.preferences?.theme || 'dark',
        aiMode: profile.preferences?.llmMode || 'auto',
        dailyPlanTime: profile.preferences?.dailyPlanTime || '06:00',
        weeklyReviewDay: profile.preferences?.weeklyReviewDay || 'sunday',
      });
    }
  }, [profile]);

  const handleSave = () => updateProfile(form);

  const handleDeleteConfirm = async () => {
    await deleteAccount();
    navigate('/login');
  };

  const handleExport = async () => {
    await exportData();
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  if (isLoading) {
    return <PageSkeleton title="Settings" showHeader={false} />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-900 w-full relative">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={isDeleting}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-8 pb-4 border-b border-slate-800 flex-shrink-0 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="text-indigo-400" size={32} />
            Settings
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Manage your profile and preferences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
        >
          {isSaving
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
            : <><Check size={16} />Save Changes</>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 pt-6 custom-scrollbar relative z-10">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Toast notifications */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm font-medium"
              >
                <CheckCircle2 size={16} />{successMessage}
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm font-medium"
              >
                <span className="flex items-center gap-2"><AlertTriangle size={16} />{error}</span>
                <button onClick={() => useUserStore.getState().clearMessages()}><X size={14} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 1. Profile */}
          <SectionCard title="Profile" icon={User} delay={0.05}>
            {/* Avatar preview */}
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-700/30">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg flex-shrink-0 transition-colors duration-300"
                style={{ backgroundColor: form.avatarColor }}
              >
                {form.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">{form.name || 'Your Name'}</p>
                <p className="text-xs text-slate-500">{profile?.email}</p>
                <p className="text-xs text-slate-600 mt-1">
                  Member since {profile?.stats?.memberSince ? new Date(profile.stats.memberSince).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '—'}
                </p>
              </div>
            </div>

            <FieldRow label="Display Name">
              <StyledInput
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Your name"
              />
            </FieldRow>

            <FieldRow label="Email">
              <StyledInput value={profile?.email || ''} disabled className="opacity-50 cursor-not-allowed" />
            </FieldRow>

            <FieldRow label="Avatar Color">
              <div className="flex flex-wrap gap-2">
                {AVATAR_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => set('avatarColor', color)}
                    className="w-8 h-8 rounded-lg transition-all hover:scale-110 ring-offset-2 ring-offset-slate-800 flex items-center justify-center"
                    style={{
                      backgroundColor: color,
                      boxShadow: form.avatarColor === color ? `0 0 0 2px ${color}` : undefined,
                      outline: form.avatarColor === color ? '2px solid white' : undefined
                    }}
                    title={color}
                  >
                    {form.avatarColor === color && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            </FieldRow>

            <FieldRow label="Timezone">
              <StyledSelect value={form.timezone} onChange={e => set('timezone', e.target.value)}>
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </StyledSelect>
            </FieldRow>
          </SectionCard>

          {/* 2. Preferences */}
          <SectionCard title="Preferences" icon={Palette} delay={0.1}>
            <FieldRow label="Theme">
              <div className="flex gap-2">
                {[
                  { v: 'dark', icon: Moon, label: 'Dark' },
                  { v: 'light', icon: Sun, label: 'Light' },
                  { v: 'system', icon: Monitor, label: 'System' }
                ].map(({ v, icon: Icon, label }) => (
                  <button
                    key={v}
                    onClick={() => set('theme', v)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      form.theme === v
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400'
                        : 'bg-slate-700/30 border-slate-600/30 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <Icon size={14} />{label}
                  </button>
                ))}
              </div>
            </FieldRow>

            <FieldRow label="Daily Plan Time">
              <StyledInput
                type="time"
                value={form.dailyPlanTime}
                onChange={e => set('dailyPlanTime', e.target.value)}
              />
            </FieldRow>

            <FieldRow label="Weekly Review Day">
              <StyledSelect value={form.weeklyReviewDay} onChange={e => set('weeklyReviewDay', e.target.value)}>
                {DAYS.map(d => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </StyledSelect>
            </FieldRow>
          </SectionCard>

          {/* 3. AI Settings */}
          <SectionCard title="AI Settings" icon={Brain} delay={0.15}>
            <p className="text-xs text-slate-500 mb-4">Choose how AI LifeOS processes your data.</p>
            <div className="space-y-2">
              {AI_MODES.map(({ value, label, desc, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => set('aiMode', value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    form.aiMode === value
                      ? 'bg-indigo-600/10 border-indigo-500/40 text-white'
                      : 'bg-slate-700/20 border-slate-700/30 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    form.aiMode === value ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-500'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                  {form.aiMode === value && <Check size={16} className="text-indigo-400 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* 4. Connected Services */}
          <SectionCard title="Connected Services" icon={Cpu} delay={0.2}>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-700/20 rounded-xl border border-slate-700/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Zap size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Google Gemini</p>
                    <p className="text-xs text-slate-500">gemini-1.5-flash · AI provider</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/20 rounded-xl border border-slate-700/30 opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-600 flex items-center justify-center">
                    <Cpu size={16} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-400">Groq API</p>
                    <p className="text-xs text-slate-600">Coming soon · Private inference</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-700 px-2.5 py-1 rounded-full">Soon</span>
              </div>
            </div>
          </SectionCard>

          {/* 5. Privacy & Data */}
          <SectionCard title="Privacy & Data" icon={Shield} delay={0.25}>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/memories')}
                className="w-full flex items-center justify-between p-4 bg-slate-700/20 hover:bg-slate-700/40 rounded-xl border border-slate-700/30 hover:border-slate-600 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Brain size={18} className="text-indigo-400" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-200">View AI Memories</p>
                    <p className="text-xs text-slate-500">Manage what AI LifeOS remembers about you</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
              </button>

              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full flex items-center justify-between p-4 bg-slate-700/20 hover:bg-slate-700/40 disabled:opacity-50 rounded-xl border border-slate-700/30 hover:border-slate-600 transition-all group"
              >
                <div className="flex items-center gap-3">
                  {isExporting
                    ? <div className="w-4.5 h-4.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                    : <Download size={18} className="text-indigo-400" />}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-200">Export My Data</p>
                    <p className="text-xs text-slate-500">Download all your data as a JSON file</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-between p-4 bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Trash2 size={18} className="text-red-400" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-red-400">Delete Account</p>
                    <p className="text-xs text-red-400/60">Permanently erase all your data</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-red-500/40 group-hover:text-red-400 transition-colors" />
              </button>
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
