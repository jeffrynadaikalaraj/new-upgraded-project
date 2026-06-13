const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const DailyPlan = require('../models/DailyPlan');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Memory = require('../models/Memory');
const WeeklyReport = require('../models/WeeklyReport');
const groqProvider = require('./llm/groqProvider');

/**
 * Generates a weekly AI report for a single user.
 * @param {string} userId
 * @returns {Promise<WeeklyReport>} The saved report document.
 */
const generateWeeklyReportForUser = async (userId) => {
  const now = new Date();
  const weekEndDate = new Date(now);
  const weekStartDate = new Date(now);
  weekStartDate.setDate(weekStartDate.getDate() - 7);

  const startStr = weekStartDate.toISOString().split('T')[0];

  // ───────────────────────────────────────────────
  // 1. Fetch Data
  // ───────────────────────────────────────────────

  // Goals
  const goals = await Goal.find({ userId });
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  let totalMilestones = 0;
  let completedMilestones = 0;
  goals.forEach(g => {
    totalMilestones += g.milestones.length;
    completedMilestones += g.milestones.filter(m => m.completed).length;
  });

  // Habits (last 7 days)
  const habits = await Habit.find({ userId, isArchived: false });
  let scheduledHabits = 0;
  let completedHabitsCount = 0;
  const habitStats = habits.map(h => {
    const recentLogs = h.completionLog.filter(l => {
      return new Date(l.date) >= weekStartDate;
    });
    const completed = recentLogs.filter(l => l.completed).length;
    scheduledHabits += recentLogs.length;
    completedHabitsCount += completed;
    return {
      title: h.title,
      completed,
      total: recentLogs.length,
      streak: h.streak?.current || 0
    };
  });

  // Daily Plans (last 7 days)
  const plans = await DailyPlan.find({
    userId,
    date: { $gte: startStr }
  });
  let totalPlannerBlocks = 0;
  let completedPlannerBlocks = 0;
  const planScores = [];
  plans.forEach(p => {
    totalPlannerBlocks += p.blocks.length;
    completedPlannerBlocks += p.blocks.filter(b => b.completed).length;
    planScores.push(p.score);
  });
  const avgPlannerScore = planScores.length
    ? Math.round(planScores.reduce((a, b) => a + b, 0) / planScores.length)
    : 0;

  // Chats (last 7 days)
  const recentChats = await Chat.find({
    userId,
    updatedAt: { $gte: weekStartDate }
  });
  let totalMessages = 0;
  if (recentChats.length > 0) {
    const chatIds = recentChats.map(c => c._id);
    totalMessages = await Message.countDocuments({
      chatId: { $in: chatIds },
      createdAt: { $gte: weekStartDate }
    });
  }

  // Memories (last 7 days)
  const newMemories = await Memory.countDocuments({
    userId,
    createdAt: { $gte: weekStartDate }
  });
  const importantMemories = await Memory.countDocuments({
    userId,
    importance: { $gte: 4 },
    createdAt: { $gte: weekStartDate }
  });

  // ───────────────────────────────────────────────
  // 2. Calculate Productivity Score
  // ───────────────────────────────────────────────
  const totalCompleted = completedHabitsCount + completedMilestones + completedPlannerBlocks;
  const totalScheduled = scheduledHabits + totalMilestones + totalPlannerBlocks;
  const productivityScore = totalScheduled > 0
    ? Math.min(100, Math.max(0, Math.round((totalCompleted / totalScheduled) * 100)))
    : 0;

  // ───────────────────────────────────────────────
  // 3. Generate AI Report with Gemini
  // ───────────────────────────────────────────────
  const systemInstruction = `You are the AI LifeOS weekly analyst. You receive a structured summary of a user's productivity data for the past 7 days and you must generate a thoughtful weekly report. 
You MUST respond ONLY with a single, valid JSON object — no markdown, no code fences, no extra text.
The JSON must have exactly these four fields:
- "summary": A 2-3 sentence overall summary of the week.
- "highlights": An array of 3-5 specific positive achievement strings (starting with an action verb).
- "improvements": An array of 2-4 specific areas that need work (starting with an action verb).
- "recommendations": An array of 3-5 actionable next-steps for the coming week (starting with an action verb).`;

  const prompt = `Here is the user's weekly productivity data:

PRODUCTIVITY SCORE: ${productivityScore}/100
AVERAGE PLANNER SCORE: ${avgPlannerScore}/100

GOALS:
- Total goals: ${goals.length}, Completed: ${completedGoals}
- Total milestones: ${totalMilestones}, Completed: ${completedMilestones}

HABITS (last 7 days):
${habitStats.length > 0
    ? habitStats.map(h => `- "${h.title}": completed ${h.completed}/${h.total} times, current streak: ${h.streak} days`).join('\n')
    : '- No active habits tracked.'}

DAILY PLANNER:
- Plans generated: ${plans.length}
- Total blocks: ${totalPlannerBlocks}, Completed: ${completedPlannerBlocks}

AI CHAT ACTIVITY:
- Conversations this week: ${recentChats.length}
- Total messages sent: ${totalMessages}

AI MEMORY:
- New memories captured: ${newMemories}
- Important memories: ${importantMemories}

Generate the weekly report JSON now.`;

  let summary = 'Great effort this week! Keep pushing toward your goals.';
  let highlights = ['Stayed active and engaged with your goals and habits.'];
  let improvements = ['Try to maintain more consistent daily planning.'];
  let recommendations = ['Review your goals at the start of next week.'];

  try {
    const raw = await groqProvider.generateResponse(prompt, systemInstruction);
    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.summary) summary = parsed.summary;
    if (Array.isArray(parsed.highlights)) highlights = parsed.highlights;
    if (Array.isArray(parsed.improvements)) improvements = parsed.improvements;
    if (Array.isArray(parsed.recommendations)) recommendations = parsed.recommendations;
  } catch (err) {
    console.error('[ReportService] Failed to parse Gemini JSON:', err.message);
    // Use fallback values set above
  }

  // ───────────────────────────────────────────────
  // 4. Save Report
  // ───────────────────────────────────────────────
  const report = await WeeklyReport.create({
    userId,
    weekStartDate,
    weekEndDate,
    summary,
    highlights,
    improvements,
    recommendations,
    productivityScore
  });

  return report;
};

module.exports = { generateWeeklyReportForUser };
