const DailyPlan = require('../models/DailyPlan');
const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const memoryService = require('../services/memoryService');
const groqProvider = require('../services/llm/groqProvider');

const calculatePlanScore = (blocks) => {
  if (!blocks || blocks.length === 0) return 0;
  const completed = blocks.filter(b => b.completed).length;
  return Math.round((completed / blocks.length) * 100);
};

// @desc    Generate daily plan
// @route   POST /api/planner/generate
// @access  Private
exports.generatePlan = async (req, res, next) => {
  try {
    const { date, customPrompt, wakeTime, sleepTime, priorityLevel } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // 1. Fetch active goals and incomplete milestones
    const goals = await Goal.find({ 
      userId: req.user.id,
      status: 'active' 
    });

    const activeGoalsSummary = goals.map(g => {
      const incompleteMilestones = g.milestones.filter(m => !m.completed).map(m => m.title);
      return `- ${g.title} (${g.category})` + (incompleteMilestones.length > 0 ? `: Next up: ${incompleteMilestones.join(', ')}` : '');
    }).join('\n');

    // 2. Fetch habits (unarchived)
    const habits = await Habit.find({ 
      userId: req.user.id,
      isArchived: false 
    });
    
    // Simplification: treating all active habits as relevant for today
    const habitsSummary = habits.map(h => `- ${h.title} (${h.category}, ${h.frequency})`).join('\n');

    // 3. Fetch memories
    const memories = await memoryService.getRelevantMemories(req.user.id, null);
    const memoriesSummary = memories.map(m => `- ${m.content}`).join('\n');

    // 4. Build Prompt
    const systemInstruction = `You are AI LifeOS's Daily Planner. Your job is to create a highly optimized, realistic daily schedule for the user based on their goals, habits, and personal memories/preferences.
Respond ONLY with a valid JSON array of block objects. Do NOT use markdown blocks like \`\`\`json.
Each block must have:
- startTime: string ("HH:MM" 24-hour format)
- endTime: string ("HH:MM" 24-hour format)
- title: string
- type: string (must be exactly one of: "habit", "goal_work", "break", "free", "custom")
- aiNotes: string (brief explanation of why this was scheduled here)

Keep the schedule realistic, include breaks, and respect user preferences.

CRITICAL INSTRUCTIONS FOR CUSTOMIZATION:
If the user provides a custom request or instructions, you MUST prioritize those requests.
Allocate the requested durations first. Then fill remaining time intelligently.
Do not ignore explicit time allocations.
Respect wake and sleep hours.
Return a complete daily schedule.`;

    const prompt = `Create a productive schedule for ${targetDate}.

User Wake Time: ${wakeTime || '07:00'}
User Sleep Time: ${sleepTime || '23:00'}
Today's Priority Level: ${priorityLevel || 'Balanced'}

${customPrompt ? `--- USER'S CUSTOM REQUEST FOR TODAY ---\n"${customPrompt}"\nMAKE SURE TO ALLOCATE THESE FIRST.` : ''}

Active Goals:
${activeGoalsSummary || 'None currently.'}

Habits to complete:
${habitsSummary || 'None currently.'}

User Memories & Preferences:
${memoriesSummary || 'None currently.'}

Return JSON array only.`;

    // 5. Call LLM
    const responseText = await groqProvider.generateResponse(prompt, systemInstruction);

    // 6. Parse JSON
    let blocks = [];
    try {
      let cleanText = responseText.trim();
      if (cleanText.startsWith('\`\`\`')) {
        cleanText = cleanText.replace(/^\`\`\`json\s*/i, '').replace(/\`\`\`$/, '').trim();
      }
      blocks = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse planner JSON:', responseText, parseError);
      return res.status(500).json({ success: false, error: 'Failed to generate a valid schedule format.' });
    }

    if (!Array.isArray(blocks)) {
      return res.status(500).json({ success: false, error: 'Generated schedule is not an array.' });
    }

    // Validate block types
    const validTypes = ['habit', 'goal_work', 'break', 'free', 'custom'];
    blocks = blocks.map(b => ({
      ...b,
      type: validTypes.includes(b.type) ? b.type : 'custom'
    }));

    // 7. Store in DB
    // Use findOneAndUpdate with upsert to replace existing plan for the day if regenerated
    const plan = await DailyPlan.findOneAndUpdate(
      { userId: req.user.id, date: targetDate },
      { 
        blocks,
        score: calculatePlanScore(blocks),
        generatedAt: Date.now()
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

// @desc    Get plan for a specific date
// @route   GET /api/planner/:date
// @access  Private
exports.getPlanByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const plan = await DailyPlan.findOne({ userId: req.user.id, date });
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found for this date.' });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

// @desc    Get today's plan
// @route   GET /api/planner/today
// @access  Private
exports.getTodayPlan = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const plan = await DailyPlan.findOne({ userId: req.user.id, date: today });
    
    // Return empty state if not found instead of 404, frontend can handle generation
    res.status(200).json({ success: true, data: plan || null });
  } catch (err) {
    next(err);
  }
};

// @desc    Update block completion
// @route   PUT /api/planner/:date/blocks/:blockId
// @access  Private
exports.updateBlock = async (req, res, next) => {
  try {
    const { date, blockId } = req.params;
    const { completed } = req.body;

    const plan = await DailyPlan.findOne({ userId: req.user.id, date });
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found.' });
    }

    const block = plan.blocks.id(blockId);
    if (!block) {
      return res.status(404).json({ success: false, error: 'Block not found.' });
    }

    if (completed !== undefined) {
      block.completed = completed;
    }

    // Recalculate score
    plan.score = calculatePlanScore(plan.blocks);
    await plan.save();

    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};
