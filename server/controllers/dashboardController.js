const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const DailyPlan = require('../models/DailyPlan');
const User = require('../models/User');
const memoryService = require('../services/memoryService');
const { generateDailyReview } = require('../services/dailyReviewService');
const groqProvider = require('../services/llm/groqProvider');

// Simple in-memory caches for expensive LLM generations
const insightCache = new Map();
const reviewCache = new Map();

// Helper to get past dates
const getPastDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

exports.getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = getPastDate(0);

    // 1. Stats Aggregation
    const activeGoals = await Goal.countDocuments({ userId, status: 'active' });
    const habitsToday = await Habit.countDocuments({ userId, isArchived: false }); // Simplifying "today" as active habits
    
    // Find highest current streak
    const allHabits = await Habit.find({ userId, isArchived: false }).select('title streak completionLog category');
    const currentStreak = allHabits.reduce((max, h) => Math.max(max, h.streak?.current || 0), 0);
    
    // Today's Planner Score
    const todayPlan = await DailyPlan.findOne({ userId, date: today });
    const plannerScore = todayPlan ? todayPlan.score : 0;

    // 2. Weekly Chart Data (Last 7 days)
    const weeklyChart = [];
    const recentPlans = await DailyPlan.find({ 
      userId, 
      date: { $gte: getPastDate(6) } // Last 7 days including today
    }).sort({ date: 1 });

    const planMap = {};
    recentPlans.forEach(p => { planMap[p.date] = p.score; });

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      weeklyChart.push({
        day: daysOfWeek[d.getDay()],
        score: planMap[dateStr] || 0
      });
    }

    // 3. Recent Activity Aggregation
    let recentActivity = [];
    
    // Goals/Milestones Activity
    const recentGoals = await Goal.find({ userId }).sort({ updatedAt: -1 }).limit(10);
    recentGoals.forEach(g => {
      if (g.completedAt && (Date.now() - new Date(g.completedAt).getTime() < 7 * 24 * 60 * 60 * 1000)) {
         recentActivity.push({
           id: `goal_${g._id}`,
           text: `Completed Goal: ${g.title}`,
           timestamp: g.completedAt
         });
      }
      // Check milestones
      g.milestones.forEach(m => {
        if (m.completedAt && (Date.now() - new Date(m.completedAt).getTime() < 7 * 24 * 60 * 60 * 1000)) {
          recentActivity.push({
            id: `ms_${m._id}`,
            text: `Finished Milestone: ${m.title}`,
            timestamp: m.completedAt
          });
        }
      });
    });

    // Habits Activity
    allHabits.forEach(h => {
      h.completionLog.slice(-5).forEach(log => {
        if (log.completed) {
          recentActivity.push({
            id: `habit_${h._id}_${log.date}`,
            text: `Completed Habit: ${h.title}`,
            timestamp: log.date
          });
        }
      });
    });

    // Planner Activity
    recentPlans.forEach(p => {
      recentActivity.push({
        id: `plan_${p._id}`,
        text: `Generated Daily Plan`,
        timestamp: p.generatedAt || p.createdAt
      });
    });

    // Sort and limit recent activity
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    recentActivity = recentActivity.slice(0, 5); // top 5

    // 4. AI Insight Generation (Dynamically)
    // We pass some high level context to Gemini
    let aiInsight = "Keep up the good work! Remember to review your daily plan.";
    
    // In a real production app we might cache this to save API calls, but for MVP we generate it.
    try {
      if (insightCache.has(userId) && insightCache.get(userId).date === today) {
        aiInsight = insightCache.get(userId).insight;
      } else {
        const systemInstruction = `You are AI LifeOS's analytics engine. Provide a SINGLE short, highly actionable sentence (max 15 words) of productivity insight based on the user's weekly data. Make it encouraging but analytical. Do not use markdown.`;
        const prompt = `
        User Stats:
        Active Goals: ${activeGoals}
        Habits tracked: ${habitsToday}
        Best current streak: ${currentStreak}
        Average Weekly Score: ${Math.round(weeklyChart.reduce((sum, d) => sum + d.score, 0) / 7)}
        `;

        aiInsight = await groqProvider.generateResponse(prompt, systemInstruction);
        insightCache.set(userId, { insight: aiInsight, date: today });
      }
    } catch (e) {
      console.error('Failed to generate AI insight:', e);
    }

    const user = await User.findById(userId).select('name');
    const memories = await memoryService.getUserProfile(userId);
    
    let dailyReview;
    if (reviewCache.has(userId) && reviewCache.get(userId).date === today) {
      dailyReview = reviewCache.get(userId).review;
    } else {
      dailyReview = await generateDailyReview(userId);
      reviewCache.set(userId, { review: dailyReview, date: today });
    }

    // Provide a simple AI suggestion based on context
    const aiSuggestions = [
      "Review your upcoming tasks for tomorrow.",
      "Check your habit streaks."
    ];

    res.status(200).json({
      success: true,
      data: {
        user: { 
          name: user ? user.name : 'User',
          profile: memories
        },
        stats: {
          activeGoals,
          habitsToday,
          currentStreak,
          plannerScore
        },
        aiSuggestions,
        dailyReview,
        weeklyChart,
        recentActivity,
        aiInsight: aiInsight.trim()
      }
    });

  } catch (err) {
    next(err);
  }
};
