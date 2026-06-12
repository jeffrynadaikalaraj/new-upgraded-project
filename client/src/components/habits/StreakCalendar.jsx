import React, { useMemo } from 'react';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * Returns a YYYY-MM-DD string in UTC for the given Date.
 */
const toDateKey = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Generate the last N days as YYYY-MM-DD strings.
 */
const generateDays = (n) => {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    days.push(toDateKey(d));
  }
  return days;
};

const StreakCalendar = ({ completionLog = [] }) => {
  const completedSet = useMemo(() => {
    const s = new Set();
    completionLog.forEach((e) => {
      if (e.completed) s.add(toDateKey(e.date));
    });
    return s;
  }, [completionLog]);

  // 7-day row view
  const last7 = useMemo(() => generateDays(7), []);

  // 12-week heatmap grid (84 days)
  const last84 = useMemo(() => generateDays(84), []);

  // Pad front so the first cell aligns to Sunday column
  const firstDayOfWeek = new Date(last84[0]).getUTCDay(); // 0-6
  const padded = [...Array(firstDayOfWeek).fill(null), ...last84];
  // Chunk into weeks
  const weeks = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  const todayKey = toDateKey(new Date());

  return (
    <div className="space-y-4">
      {/* 7-day strip */}
      <div>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Last 7 Days</p>
        <div className="flex gap-1.5">
          {last7.map((dateKey) => {
            const isToday = dateKey === todayKey;
            const done = completedSet.has(dateKey);
            const dayLabel = DAYS[new Date(dateKey + 'T00:00:00Z').getUTCDay()];
            return (
              <div key={dateKey} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[9px] text-slate-600 font-medium">{dayLabel}</span>
                <div
                  className={`w-full h-7 rounded-lg flex items-center justify-center transition-all ${
                    done
                      ? 'bg-emerald-500 shadow-md shadow-emerald-500/30'
                      : isToday
                      ? 'bg-slate-700 border border-indigo-500/50'
                      : 'bg-slate-800 border border-slate-700/50'
                  }`}
                >
                  {done && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {!done && isToday && (
                    <div className="w-1 h-1 rounded-full bg-indigo-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 12-week heatmap */}
      <div>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">12-Week Heatmap</p>
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1 flex-1">
              {week.map((dateKey, di) => {
                if (dateKey === null) {
                  return <div key={`pad-${di}`} className="h-3 rounded-sm" />;
                }
                const done = completedSet.has(dateKey);
                const isToday = dateKey === todayKey;
                return (
                  <div
                    key={dateKey}
                    title={`${dateKey}${done ? ' ✓' : ''}`}
                    className={`h-3 rounded-sm transition-all ${
                      done
                        ? 'bg-emerald-500/80 shadow-sm shadow-emerald-500/20'
                        : isToday
                        ? 'bg-indigo-600/40 ring-1 ring-indigo-500/50'
                        : 'bg-slate-700/60'
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        {/* Day labels */}
        <div className="flex mt-1 text-[9px] text-slate-600">
          {DAYS.map((d, i) => (
            <div key={i} className="flex-1 text-center">{d}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;
