const asyncHandler = require('express-async-handler');
const Habit = require('../models/Habit');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Return a Date set to midnight UTC for the given date (or today).
 */
const toDateKey = (date = new Date()) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Check whether two dates fall on the same UTC calendar day.
 */
const isSameDay = (a, b) => {
  return toDateKey(a).getTime() === toDateKey(b).getTime();
};

/**
 * Given the completionLog, recalculate the current streak from today backward.
 * A streak is an unbroken sequence of days with completed === true.
 */
/**
 * Check whether the habit is scheduled on a given UTC date.
 */
const isScheduledOn = (habit, date) => {
  if (habit.isArchived) return false;
  const dayOfWeek = date.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  if (habit.frequency === 'daily') return true;
  if (habit.frequency === 'weekly') {
    // Default weekly = every Monday (1)
    return dayOfWeek === 1;
  }
  if (habit.frequency === 'custom') {
    return habit.customDays.includes(dayOfWeek);
  }
  return false;
};

/**
 * Determine whether today is a scheduled day for the habit.
 */
const isScheduledToday = (habit) => {
  return isScheduledOn(habit, toDateKey());
};

/**
 * Given the habit, recalculate the current streak from today backward.
 * A streak is an unbroken sequence of scheduled days that are completed.
 */
const recalculateStreak = (habit) => {
  const completionLog = habit.completionLog || [];
  if (completionLog.length === 0) return 0;

  // Build a Set of day-keys (ms since epoch at midnight UTC) for quick lookup
  const completedDays = new Set(
    completionLog
      .filter((e) => e.completed)
      .map((e) => toDateKey(e.date).getTime())
  );

  const today = toDateKey();
  let streak = 0;
  let cursor = new Date(today);

  // Search backward up to 1000 days
  for (let i = 0; i < 1000; i++) {
    const cursorTime = cursor.getTime();

    if (isScheduledOn(habit, cursor)) {
      const isCompleted = completedDays.has(cursorTime);

      if (isCompleted) {
        streak++;
      } else {
        // If it is today and not completed, we don't break the streak yet (today is still active)
        const isCursorToday = cursorTime === today.getTime();
        if (!isCursorToday) {
          // It was scheduled in the past but not completed. Streak is broken!
          break;
        }
      }
    }

    // Go back one day in UTC
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
};

/**
 * Enrich a plain habit object with today's completion state and live stats.
 */
const enrichWithToday = (habit) => {
  const today = toDateKey();
  const todayEntry = habit.completionLog.find((e) =>
    isSameDay(e.date, today)
  );

  const currentStreak = recalculateStreak(habit);
  const longestStreak = Math.max(habit.streak?.longest || 0, currentStreak);

  return {
    ...habit.toObject(),
    streak: {
      ...habit.streak,
      current: currentStreak,
      longest: longestStreak,
    },
    todayCompleted: todayEntry ? todayEntry.completed : false,
    scheduledToday: isScheduledToday(habit),
  };
};

// ─── Controllers ────────────────────────────────────────────────────────────

// @desc    Create a habit
// @route   POST /api/habits
// @access  Private
exports.createHabit = asyncHandler(async (req, res, next) => {

    const { title, description, frequency, customDays, category, icon, color, remindAt } = req.body;

    const habit = await Habit.create({
      userId: req.user.id,
      title,
      description,
      frequency: frequency || 'daily',
      customDays: frequency === 'custom' ? (customDays || []) : [],
      category: category || 'other',
      icon: icon || '✅',
      color: color || '#6366f1',
      remindAt: remindAt || null,
    });

    res.status(201).json({ success: true, data: enrichWithToday(habit) });
  
});

// @desc    Get all habits for the authenticated user
// @route   GET /api/habits
// @access  Private
exports.getHabits = asyncHandler(async (req, res, next) => {

    const { archived } = req.query;
    const filter = { userId: req.user.id };

    // Default: only active habits; pass ?archived=true to see archived ones
    if (archived === 'true') {
      filter.isArchived = true;
    } else {
      filter.isArchived = false;
    }

    const habits = await Habit.find(filter).sort({ createdAt: -1 });
    const enriched = habits.map(enrichWithToday);

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  
});

// @desc    Get single habit
// @route   GET /api/habits/:id
// @access  Private
exports.getHabit = asyncHandler(async (req, res, next) => {

    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }
    res.status(200).json({ success: true, data: enrichWithToday(habit) });
  
});

// @desc    Update habit details
// @route   PUT /api/habits/:id
// @access  Private
exports.updateHabit = asyncHandler(async (req, res, next) => {

    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }

    const allowedFields = ['title', 'description', 'frequency', 'customDays', 'category', 'icon', 'color', 'remindAt'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        habit[field] = req.body[field];
      }
    });

    // Clear customDays if frequency is no longer custom
    if (req.body.frequency && req.body.frequency !== 'custom') {
      habit.customDays = [];
    }

    await habit.save();
    res.status(200).json({ success: true, data: enrichWithToday(habit) });
  
});

// @desc    Archive or delete a habit
// @route   DELETE /api/habits/:id
// @access  Private
// Query param: ?permanent=true to hard-delete; default = archive
exports.deleteHabit = asyncHandler(async (req, res, next) => {

    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }

    if (req.query.permanent === 'true') {
      await habit.deleteOne();
      return res.status(200).json({ success: true, data: {}, message: 'Habit permanently deleted' });
    }

    // Soft-delete: archive
    habit.isArchived = true;
    await habit.save();
    res.status(200).json({ success: true, data: habit, message: 'Habit archived' });
  
});

// @desc    Mark today as completed
// @route   POST /api/habits/:id/complete
// @access  Private
exports.completeHabit = asyncHandler(async (req, res, next) => {

    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }
    if (habit.isArchived) {
      return res.status(400).json({ success: false, error: 'Cannot complete an archived habit' });
    }

    const today = toDateKey();
    const existingIndex = habit.completionLog.findIndex((e) => isSameDay(e.date, today));

    if (existingIndex !== -1 && habit.completionLog[existingIndex].completed) {
      // Already completed today — idempotent
      return res.status(200).json({ success: true, data: enrichWithToday(habit), message: 'Already completed today' });
    }

    const note = req.body.note || '';

    if (existingIndex !== -1) {
      // Entry exists but was uncompleted — update it
      habit.completionLog[existingIndex].completed = true;
      habit.completionLog[existingIndex].note = note;
    } else {
      // New entry
      habit.completionLog.push({ date: today, completed: true, note });
    }

    // Recalculate streak
    const newStreak = recalculateStreak(habit);
    habit.streak.current = newStreak;
    habit.streak.longest = Math.max(habit.streak.longest, newStreak);
    habit.streak.lastCompletedAt = new Date();

    await habit.save();
    res.status(200).json({ success: true, data: enrichWithToday(habit), message: 'Habit completed for today!' });
  
});

// @desc    Undo today's completion
// @route   POST /api/habits/:id/uncomplete
// @access  Private
exports.uncompleteHabit = asyncHandler(async (req, res, next) => {

    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }

    const today = toDateKey();
    const existingIndex = habit.completionLog.findIndex((e) => isSameDay(e.date, today));

    if (existingIndex === -1 || !habit.completionLog[existingIndex].completed) {
      return res.status(200).json({ success: true, data: enrichWithToday(habit), message: 'Not completed today — nothing to undo' });
    }

    // Mark as not completed
    habit.completionLog[existingIndex].completed = false;

    // Recalculate streak
    const newStreak = recalculateStreak(habit);
    habit.streak.current = newStreak;
    // Longest stays as is

    // If streak is now 0, clear lastCompletedAt or set to last real completion
    const lastReal = [...habit.completionLog]
      .filter((e) => e.completed)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    habit.streak.lastCompletedAt = lastReal ? lastReal.date : null;

    await habit.save();
    res.status(200).json({ success: true, data: enrichWithToday(habit), message: 'Completion undone' });
  
});

// @desc    Get habit stats
// @route   GET /api/habits/:id/stats
// @access  Private
exports.getHabitStats = asyncHandler(async (req, res, next) => {

    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }

    const completedEntries = habit.completionLog.filter((e) => e.completed);
    const totalCompletions = completedEntries.length;

    // Completion rate over the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

    const recentEntries = habit.completionLog.filter(
      (e) => new Date(e.date) >= thirtyDaysAgo
    );
    const recentCompleted = recentEntries.filter((e) => e.completed).length;
    const completionRate = recentEntries.length > 0
      ? Math.round((recentCompleted / 30) * 100)
      : 0;

    // Last 84 days for heatmap (12 weeks)
    const eightyFourDaysAgo = new Date();
    eightyFourDaysAgo.setUTCDate(eightyFourDaysAgo.getUTCDate() - 83);
    eightyFourDaysAgo.setUTCHours(0, 0, 0, 0);

    const heatmapLog = habit.completionLog
      .filter((e) => new Date(e.date) >= eightyFourDaysAgo)
      .map((e) => ({ date: toDateKey(e.date).toISOString().split('T')[0], completed: e.completed }));

    // Recent 7-day log
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    const recentLog = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      d.setUTCHours(0, 0, 0, 0);
      const entry = habit.completionLog.find((e) => isSameDay(e.date, d));
      recentLog.push({
        date: d.toISOString().split('T')[0],
        completed: entry ? entry.completed : false,
      });
    }

    const liveStreak = recalculateStreak(habit);
    const liveLongest = Math.max(habit.streak.longest || 0, liveStreak);

    res.status(200).json({
      success: true,
      data: {
        currentStreak: liveStreak,
        longestStreak: liveLongest,
        totalCompletions,
        completionRate,
        recentLog,
        heatmapLog,
      },
    });
  
});
