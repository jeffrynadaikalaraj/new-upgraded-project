const Goal = require('../models/Goal');
const groqProvider = require('../services/llm/groqProvider');

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: goals.length, data: goals });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
exports.getGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Goal not found' });
    }
    res.status(200).json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
};

// @desc    Create goal
// @route   POST /api/goals
// @access  Private
exports.createGoal = async (req, res, next) => {
  try {
    req.body.userId = req.user.id;
    const goal = await Goal.create(req.body);
    res.status(201).json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Goal not found' });
    }

    if (req.body.status === 'completed' && goal.status !== 'completed') {
        req.body.completedAt = Date.now();
        req.body.progress = 100;
    }

    goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Goal not found' });
    }
    await goal.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// @desc    Add milestone to goal
// @route   POST /api/goals/:id/milestones
// @access  Private
exports.addMilestone = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Goal not found' });
    }
    
    goal.milestones.push(req.body);
    await goal.save();
    
    res.status(200).json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
};

// @desc    Update milestone
// @route   PUT /api/goals/:id/milestones/:milestoneId
// @access  Private
exports.updateMilestone = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Goal not found' });
    }
    
    const milestone = goal.milestones.id(req.params.milestoneId);
    if (!milestone) {
        return res.status(404).json({ success: false, error: 'Milestone not found' });
    }

    if (req.body.completed !== undefined) {
        milestone.completed = req.body.completed;
        milestone.completedAt = req.body.completed ? Date.now() : null;
    }
    if (req.body.title !== undefined) {
        milestone.title = req.body.title;
    }

    // Auto calculate progress based on milestones
    if (goal.milestones.length > 0) {
        const completedCount = goal.milestones.filter(m => m.completed).length;
        goal.progress = Math.round((completedCount / goal.milestones.length) * 100);
        
        if (goal.progress === 100 && goal.status !== 'completed') {
            goal.status = 'completed';
            goal.completedAt = Date.now();
        } else if (goal.progress < 100 && goal.status === 'completed') {
            goal.status = 'active';
            goal.completedAt = null;
        }
    }

    await goal.save();
    res.status(200).json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate AI suggestions for a goal
// @route   POST /api/goals/:id/ai-suggest
// @access  Private
exports.generateAiSuggestions = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Goal not found' });
    }

    let prompt;
    if (goal.targetValue && goal.targetMetric) {
      // Numeric goal — suggest milestone breakpoints
      const remaining = goal.targetValue - (goal.currentValue || 0);
      prompt = `As an expert life coach, the user has a goal: "${goal.title}".
Target: ${goal.targetValue} ${goal.targetMetric}
Current progress: ${goal.currentValue || 0} ${goal.targetMetric} (${goal.progress}% done)
Remaining: ${remaining} ${goal.targetMetric}

Provide 3-5 suggested milestones as numeric checkpoints to help them reach the target.
If they already have milestones, suggest actionable steps instead.
Existing milestones: ${goal.milestones?.map(m => `${m.title}${m.targetValue ? ` (${m.targetValue} ${goal.targetMetric})` : ''}`).join(', ') || 'None'}

Format the output as a JSON array of strings. Each string should mention the numeric target.
Example: ["Reach 25 minutes (Beginner)", "Reach 50 minutes (Halfway)", "Reach 75 minutes (Almost There)", "Complete 100 minutes (Goal Achieved!)"]
Do not include markdown blocks, just the JSON array.`;
    } else {
      prompt = `As an expert life coach, analyze the following goal and provide 3-5 actionable sub-tasks or milestones to help achieve it. 
Format the output as a JSON array of strings. Do not include markdown blocks, just the JSON array.
Goal Title: ${goal.title}
Goal Description: ${goal.description || 'N/A'}
Category: ${goal.category}
Priority: ${goal.priority}`;
    }

    const systemInstruction = 'You are AI LifeOS, an expert productivity coach. Respond ONLY with a valid JSON array of strings containing actionable sub-tasks or milestones.';
    
    const aiResponse = await groqProvider.generateResponse(prompt, systemInstruction);
    
    let suggestions = [];
    try {
        const cleanResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        suggestions = JSON.parse(cleanResponse);
    } catch (parseError) {
        console.error('Failed to parse AI suggestions as JSON:', aiResponse);
        suggestions = aiResponse.split('\n').map(s => s.replace(/^- /, '').replace(/^• /, '').trim()).filter(s => s.length > 0).slice(0, 5);
    }

    goal.aiSuggestions = suggestions;
    await goal.save();

    res.status(200).json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
};



// @desc    Log activity for a goal
// @route   POST /api/goals/:id/activity
// @access  Private
exports.logActivity = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Goal not found' });
    }

    const { text, metric, value, type } = req.body;
    
    if (!text && value === undefined) {
      return res.status(400).json({ success: false, error: 'Please provide activity text or a value' });
    }

    const newActivity = {
      text: text || `Logged ${value} ${metric || 'units'}`,
      date: Date.now()
    };

    if (type) newActivity.type = type;
    if (metric) newActivity.metric = metric;
    if (value !== undefined) newActivity.value = value;

    // ── Auto-increment currentValue & recalculate progress ──
    if (value !== undefined && typeof value === 'number' && goal.targetValue) {
      goal.currentValue = (goal.currentValue || 0) + value;

      // Clamp progress to 100
      goal.progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));

      // Auto-complete milestones whose targetValue has been reached
      if (goal.milestones && goal.milestones.length > 0) {
        goal.milestones.forEach(ms => {
          if (ms.targetValue && !ms.completed && goal.currentValue >= ms.targetValue) {
            ms.completed = true;
            ms.completedAt = Date.now();
          }
        });
      }

      // Auto-complete goal if progress hits 100%
      if (goal.progress >= 100 && goal.status !== 'completed') {
        goal.status = 'completed';
        goal.completedAt = Date.now();
      }
    }

    // ── Generate AI feedback with actual progress context ──
    try {
      const progressContext = goal.targetValue
        ? `\nCurrent progress: ${goal.currentValue || 0}/${goal.targetValue} ${goal.targetMetric || 'units'} (${goal.progress}%).`
        : '';

      const prompt = `You are an encouraging AI life coach. The user just logged a new activity for their goal "${goal.title}" (Category: ${goal.category}, Subcategory: ${goal.subcategory || 'N/A'}).
The activity they logged is: "${newActivity.text}".
${type && value !== undefined && metric ? `Specifically, they recorded: ${type} - ${value} ${metric}.` : ''}${progressContext}

Provide a very brief (1-2 sentences max), highly encouraging feedback message that references their actual numeric progress. Do not use markdown, just return the text.`;
      
      const systemInstruction = 'You are AI LifeOS, an expert productivity coach. Respond ONLY with a 1-2 sentence feedback string.';
      const feedback = await groqProvider.generateResponse(prompt, systemInstruction);
      newActivity.aiFeedback = feedback.replace(/"/g, '').trim();
    } catch (aiError) {
      console.error('Failed to generate AI feedback for activity:', aiError);
    }

    goal.activityLog.push(newActivity);
    await goal.save();


    res.status(200).json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
};

// @desc    Get activity log for a goal
// @route   GET /api/goals/:id/activity
// @access  Private
exports.getActivity = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Goal not found' });
    }

    // Sort activity log by date descending
    const sortedActivity = goal.activityLog.sort((a, b) => b.date - a.date);

    res.status(200).json({ success: true, data: sortedActivity });
  } catch (err) {
    next(err);
  }
};
