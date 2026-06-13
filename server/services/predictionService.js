const groqProvider = require('./llm/groqProvider');

/**
 * Predict goal success, ETA, and risk of failure.
 * @param {Object} goal - The Goal object
 * @param {Array} relatedHabits - Array of Habit objects related to the goal category
 * @param {Array} relatedTasks - Array of Task objects related to the goal
 * @returns {Promise<Object>} The prediction object { estimatedCompletion: string, successRate: number, riskLevel: string, insight: string }
 */
exports.predictGoalOutcome = async (goal, relatedHabits, relatedTasks) => {
  const systemInstruction = `You are the AI Goal Prediction Engine for AI LifeOS.
Analyze the user's goal, along with their related habits and tasks, to predict their outcome.
Output strictly in the following JSON format and nothing else:
{
  "estimatedCompletion": "string (e.g., '14 days' or 'Delayed')",
  "successRate": number (0-100),
  "riskLevel": "Low" | "Medium" | "High",
  "insight": "1 short sentence explaining the prediction."
}`;

  // Simplify data for LLM context limits
  const dataContext = JSON.stringify({
    goal: { title: goal.title, progress: goal.progress, targetDate: goal.targetDate },
    habits: relatedHabits.map(h => ({ title: h.title, streak: h.currentStreak, completionRate: h.completionRates })),
    tasks: { total: relatedTasks.length, completed: relatedTasks.filter(t => t.completed).length }
  });

  const prompt = `Analyze this data and provide a prediction:\n${dataContext}`;

  try {
    const responseText = await groqProvider.generateResponse(prompt, systemInstruction);
    const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Goal Prediction Error:', err);
    return {
      estimatedCompletion: "Unknown",
      successRate: 50,
      riskLevel: "Medium",
      insight: "Not enough data to form a confident prediction."
    };
  }
};
