const Goal = require('../models/Goal');
const geminiProvider = require('../services/llm/geminiProvider');

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

    const prompt = `As an expert life coach, analyze the following goal and provide 3-5 actionable sub-tasks or milestones to help achieve it. 
    Format the output as a JSON array of strings. Do not include markdown blocks, just the JSON array.
    Goal Title: ${goal.title}
    Goal Description: ${goal.description || 'N/A'}
    Category: ${goal.category}
    Priority: ${goal.priority}`;

    const systemInstruction = 'You are AI LifeOS, an expert productivity coach. Respond ONLY with a valid JSON array of strings containing actionable sub-tasks.';
    
    const aiResponse = await geminiProvider.generateResponse(prompt, systemInstruction);
    
    let suggestions = [];
    try {
        // Clean up potential markdown formatting before parsing
        const cleanResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        suggestions = JSON.parse(cleanResponse);
    } catch (parseError) {
        console.error('Failed to parse AI suggestions as JSON:', aiResponse);
        // Fallback: split by newlines if JSON parsing fails
        suggestions = aiResponse.split('\n').map(s => s.replace(/^- /, '').replace(/^• /, '').trim()).filter(s => s.length > 0).slice(0, 5);
    }

    goal.aiSuggestions = suggestions;
    await goal.save();

    res.status(200).json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
};
