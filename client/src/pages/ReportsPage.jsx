import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileBarChart, Sparkles, Zap, CheckCircle2, AlertTriangle,
  Lightbulb, ChevronDown, ChevronUp, Calendar, RefreshCw, Download
} from 'lucide-react';
import { useReportStore } from '../stores/reportStore';
import { PageSkeleton } from '../components/common/LoadingSkeleton';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDateRange = (start, end) => {
  if (!start || !end) return '';
  const opts = { month: 'short', day: 'numeric' };
  return `${new Date(start).toLocaleDateString(undefined, opts)} – ${new Date(end).toLocaleDateString(undefined, { ...opts, year: 'numeric' })}`;
};

// ─── Score Ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#6366f1' : '#f59e0b';

  return (
    <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
      <svg className="-rotate-90 w-36 h-36" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} stroke="#1e293b" strokeWidth="10" fill="transparent" />
        <circle
          cx="70" cy="70" r={r}
          stroke={color} strokeWidth="10" fill="transparent"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease-out, stroke 0.5s' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-black text-white">{score}%</span>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Score</span>
      </div>
    </div>
  );
};

// ─── Insight Card ─────────────────────────────────────────────────────────────
const InsightCard = ({ items, title, icon: Icon, colorScheme, delay }) => {
  const schemes = {
    green:  { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', icon: 'text-emerald-400', tag: 'bg-emerald-500/20 text-emerald-300', dot: 'bg-emerald-500' },
    amber:  { border: 'border-amber-500/20',   bg: 'bg-amber-500/10',   icon: 'text-amber-400',   tag: 'bg-amber-500/20 text-amber-300',   dot: 'bg-amber-500'   },
    blue:   { border: 'border-blue-500/20',    bg: 'bg-blue-500/10',    icon: 'text-blue-400',    tag: 'bg-blue-500/20 text-blue-300',    dot: 'bg-blue-500'    },
  };
  const s = schemes[colorScheme] || schemes.green;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className={`bg-slate-800/50 backdrop-blur-xl border ${s.border} rounded-2xl p-6 shadow-xl`}
    >
      <h3 className={`text-base font-bold mb-4 flex items-center gap-2 ${s.icon}`}>
        <Icon size={18} />
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-slate-500 text-sm">Nothing to show yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
              <span className="text-sm text-slate-200 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

// ─── Archive Item ─────────────────────────────────────────────────────────────
const ArchiveItem = ({ report, index }) => {
  const [open, setOpen] = useState(false);
  const score = report.productivityScore;
  const scoreColor = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-indigo-400' : 'text-amber-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      className="bg-slate-800/40 border border-slate-700/40 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-700/20 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Calendar size={16} className="text-slate-400 flex-shrink-0" />
          <span className="text-sm font-medium text-slate-200">
            {formatDateRange(report.weekStartDate, report.weekEndDate)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold ${scoreColor}`}>{score}%</span>
          {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-700/30 pt-4">
              <p className="text-sm text-slate-300 leading-relaxed">{report.summary}</p>
              {report.highlights.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Highlights</p>
                  <ul className="space-y-1">
                    {report.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-emerald-400 mt-0.5">✓</span>{h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ onGenerate, isGenerating }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center text-center py-24 px-8"
  >
    <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
      <FileBarChart size={36} className="text-indigo-400" />
    </div>
    <h2 className="text-2xl font-bold text-white mb-3">No Reports Yet</h2>
    <p className="text-slate-400 max-w-sm mb-8">
      Generate your first AI-powered weekly report to see your productivity insights, highlights, and recommendations.
    </p>
    <button
      onClick={onGenerate}
      disabled={isGenerating}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
    >
      {isGenerating
        ? <><RefreshCw size={18} className="animate-spin" /> Generating...</>
        : <><Sparkles size={18} /> Generate Weekly Report</>}
    </button>
  </motion.div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const ReportsPage = () => {
  const { latestReport, reports, isLoading, isGenerating, fetchLatestReport, fetchReports, generateReport } = useReportStore();

  useEffect(() => {
    fetchLatestReport();
    fetchReports();
  }, [fetchLatestReport, fetchReports]);

  const handleGenerate = async () => {
    try {
      await generateReport();
    } catch (_) {
      // error handled in store
    }
  };

  if (isLoading) {
    return <PageSkeleton title="Weekly Reports" showHeader={false} />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-900 w-full relative">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between p-8 pb-4 relative z-10 border-b border-slate-800 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileBarChart className="text-indigo-400" size={32} />
            Weekly Reports
          </h1>
          <p className="text-slate-400 mt-1 text-sm">AI-powered weekly productivity reviews.</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 print:hidden">
          {latestReport && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all border border-slate-700/50 shadow-lg"
            >
              <Download size={16} />
              Download PDF
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            {isGenerating
              ? <><RefreshCw size={16} className="animate-spin" /> Generating...</>
              : <><Sparkles size={16} /> Generate Report</>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 pt-6 relative z-10 custom-scrollbar">
        <div className="max-w-5xl mx-auto">

          {/* No reports yet */}
          {!latestReport && !isGenerating && <EmptyState onGenerate={handleGenerate} isGenerating={isGenerating} />}

          {/* Latest Report Hero */}
          {latestReport && (
            <motion.div
              key={latestReport._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl p-8 mb-8 shadow-xl shadow-indigo-500/10"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">
                    <Zap size={14} />
                    Latest Report · {formatDateRange(latestReport.weekStartDate, latestReport.weekEndDate)}
                  </div>
                  <p className="text-slate-200 text-base leading-relaxed max-w-2xl">{latestReport.summary}</p>
                </div>
                <ScoreRing score={latestReport.productivityScore} />
              </div>
            </motion.div>
          )}

          {/* Insights Grid */}
          {latestReport && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <InsightCard
                items={latestReport.highlights}
                title="Highlights"
                icon={CheckCircle2}
                colorScheme="green"
                delay={0.1}
              />
              <InsightCard
                items={latestReport.improvements}
                title="Areas to Improve"
                icon={AlertTriangle}
                colorScheme="amber"
                delay={0.2}
              />
              <InsightCard
                items={latestReport.recommendations}
                title="Recommendations"
                icon={Lightbulb}
                colorScheme="blue"
                delay={0.3}
              />
            </div>
          )}

          {/* Archive */}
          {reports.length > 1 && (
            <div>
              <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-slate-400" />
                Report Archive
              </h2>
              <div className="space-y-3">
                {/* Skip the first (latest) one since we already show it above */}
                {reports.slice(1).map((r, i) => (
                  <ArchiveItem key={r._id} report={r} index={i} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
