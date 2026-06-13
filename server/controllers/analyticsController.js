const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const DailyPlan = require('../models/DailyPlan');
const Mood = require('../models/Mood');

// Helper for date calculations
const getPastDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

exports.getOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch required data
    const goals = await Goal.find({ userId });
    const habits = await Habit.find({ userId, isArchived: false });
    const plans = await DailyPlan.find({ userId });

    // 1. Goal Completion Rate
    let completedGoals = 0;
    let totalMilestones = 0;
    let completedMilestones = 0;

    goals.forEach(g => {
      if (g.status === 'completed') completedGoals++;
      totalMilestones += g.milestones.length;
      completedMilestones += g.milestones.filter(m => m.completed).length;
    });

    const goalCompletionRate = goals.length ? Math.round((completedGoals / goals.length) * 100) : 0;

    // 2. Habit Success Rate & Tracking
    let habitsDue = 0;
    let completedHabits = 0;
    let bestStreak = 0;

    habits.forEach(h => {
      if (h.streak && h.streak.longest) {
        bestStreak = Math.max(bestStreak, h.streak.longest);
      } else if (h.streak && h.streak.current) {
        bestStreak = Math.max(bestStreak, h.streak.current);
      }
      
      const trackedDays = h.completionLog.length;
      const completedDays = h.completionLog.filter(log => log.completed).length;

      habitsDue += trackedDays;
      completedHabits += completedDays;
    });

    const habitSuccessRate = habitsDue ? Math.round((completedHabits / habitsDue) * 100) : 0;

    // 3. Productivity Score
    const totalDue = habitsDue + totalMilestones;
    const totalCompleted = completedHabits + completedMilestones;
    const productivityScore = totalDue ? Math.round((totalCompleted / totalDue) * 100) : 0;

    // 4. Most Productive Day
    let mostProductiveDay = "N/A";
    if (plans.length > 0) {
      // Find the day of the week with the highest average score
      const dayScores = { 'Sun': [], 'Mon': [], 'Tue': [], 'Wed': [], 'Thu': [], 'Fri': [], 'Sat': [] };
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      plans.forEach(p => {
        const d = new Date(p.date);
        dayScores[daysOfWeek[d.getDay()]].push(p.score);
      });

      let maxAvg = -1;
      for (const [day, scores] of Object.entries(dayScores)) {
        if (scores.length > 0) {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          if (avg > maxAvg) {
            maxAvg = avg;
            mostProductiveDay = day;
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        productivityScore,
        goalCompletionRate,
        habitSuccessRate,
        bestStreak,
        mostProductiveDay
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getWeekly = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const weeklyData = [];
    
    // Last 7 days
    const recentPlans = await DailyPlan.find({ 
      userId, 
      date: { $gte: getPastDate(6) } 
    });
    
    // Also fetch moods
    const recentMoods = await Mood.find({
      userId,
      date: { $gte: new Date(getPastDate(6)) }
    });

    const planMap = {};
    recentPlans.forEach(p => { planMap[p.date] = p.score; });
    
    const moodMap = {};
    recentMoods.forEach(m => {
      const dateStr = new Date(m.date).toISOString().split('T')[0];
      // keep the latest mood for the day if multiple
      moodMap[dateStr] = m.score;
    });

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      weeklyData.push({
        day: daysOfWeek[d.getDay()],
        score: planMap[dateStr] || 0,
        mood: moodMap[dateStr] || 0 // 0 means no data
      });
    }

    res.status(200).json({ success: true, data: weeklyData });
  } catch (err) {
    next(err);
  }
};

exports.getMonthly = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Current month data calculation (4 weeks approximation)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthPlans = await DailyPlan.find({
      userId,
      date: { $gte: firstDay.toISOString().split('T')[0] }
    }).sort({ date: 1 });

    const weeks = [
      { week: "Week 1", scores: [] },
      { week: "Week 2", scores: [] },
      { week: "Week 3", scores: [] },
      { week: "Week 4", scores: [] }
    ];

    monthPlans.forEach(p => {
      const pDate = new Date(p.date);
      const dateNum = pDate.getDate();
      const weekIdx = Math.min(Math.floor((dateNum - 1) / 7), 3);
      weeks[weekIdx].scores.push(p.score);
    });

    const monthlyData = weeks.map(w => ({
      week: w.week,
      score: w.scores.length > 0 ? Math.round(w.scores.reduce((a,b)=>a+b,0) / w.scores.length) : 0
    }));

    res.status(200).json({ success: true, data: monthlyData });
  } catch (err) {
    next(err);
  }
};

exports.getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user.id, isArchived: false });
    const habitsData = habits.map(h => {
      const totalDays = h.completionLog.length;
      const completedDays = h.completionLog.filter(l => l.completed).length;
      const completionRate = totalDays ? Math.round((completedDays / totalDays) * 100) : 0;
      
      return {
        title: h.title,
        completionRate,
        streak: h.streak?.current || 0
      };
    });

    // Sort by completion rate descending
    habitsData.sort((a, b) => b.completionRate - a.completionRate);

    res.status(200).json({ success: true, data: habitsData });
  } catch (err) {
    next(err);
  }
};

exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user.id });
    
    const categoryCounts = {
      career: 0,
      health: 0,
      finance: 0,
      learning: 0,
      personal: 0,
      other: 0
    };

    goals.forEach(g => {
      if (categoryCounts[g.category] !== undefined) {
        categoryCounts[g.category]++;
      } else {
        categoryCounts.other++;
      }
    });

    const goalsData = Object.keys(categoryCounts).map(category => ({
      category,
      percentage: goals.length ? Math.round((categoryCounts[category] / goals.length) * 100) : 0
    })).filter(g => g.percentage > 0);

    res.status(200).json({ success: true, data: goalsData });
  } catch (err) {
    next(err);
  }
};
