const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const DailyPlan = require('../models/DailyPlan');
const User = require('../models/User');
const groqProvider = require('./llm/groqProvider');

const generateDailyReview = async (userId) => {
  const today = new Date().toISOString().split('T')[0];

  // Fetch today's data
  const habits = await Habit.find({ userId, isArchived: false });
  const plan = await DailyPlan.findOne({ userId, date: today });
  const goals = await Goal.find({ userId, status: 'active' });

  let completedHabits = 0;
  let totalHabits = habits.length;
  let habitHighlights = [];
  let habitMisses = [];

  habits.forEach(h => {
    const todayLog = h.completionLog.find(l => l.date.toISOString().split('T')[0] === today);
    if (todayLog && todayLog.completed) {
      completedHabits++;
      habitHighlights.push(`${h.title} (Streak: ${h.streak?.current || 1} days)`);
    } else {
      habitMisses.push(h.title);
    }
  });

  let completedTasks = 0;
  let totalTasks = plan ? plan.blocks.length : 0;
  let missedTasks = [];
  
  if (plan) {
    plan.blocks.forEach(b => {
      if (b.completed) {
        completedTasks++;
      } else {
        missedTasks.push(b.title);
      }
    });
  }

  // Use LLM to generate a personalized review
  const prompt = `Generate a short daily review for the user.
Stats:
- Habits: ${completedHabits}/${totalHabits} completed.
- Highlights: ${habitHighlights.join(', ') || 'None'}
- Missed Habits: ${habitMisses.join(', ') || 'None'}
- Tasks: ${completedTasks}/${totalTasks} completed.
- Missed Tasks: ${missedTasks.join(', ') || 'None'}

Write a friendly, encouraging 3-sentence summary highlighting achievements and gently suggesting areas to focus on tomorrow. Don't use markdown.`;

  const systemInstruction = `You are a productivity coach. Keep it very concise and encouraging.`;

  try {
    let aiReview = await groqProvider.generateResponse(prompt, systemInstruction);
    aiReview = aiReview.replace(/```/g, '').trim();
    
    return {
      date: today,
      stats: {
        completedHabits,
        totalHabits,
        completedTasks,
        totalTasks
      },
      summary: aiReview
    };
  } catch (err) {
    console.error('[DailyReviewService] Error generating review:', err);
    return {
      date: today,
      stats: { completedHabits, totalHabits, completedTasks, totalTasks },
      summary: "You had a solid day today! Let's get ready for tomorrow."
    };
  }
};

module.exports = { generateDailyReview };
