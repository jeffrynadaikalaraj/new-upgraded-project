const User = require('../models/User');
const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const Memory = require('../models/Memory');
const DailyPlan = require('../models/DailyPlan');
const WeeklyReport = require('../models/WeeklyReport');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

// GET /api/users/me
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, timezone, avatarColor, theme, aiMode, dailyPlanTime, weeklyReviewDay } = req.body;

    // Build update object safely — only update fields provided
    const updateFields = {};
    if (name)            updateFields.name = name;
    if (timezone)        updateFields.timezone = timezone;
    if (avatarColor)     updateFields['avatar.color'] = avatarColor;
    if (theme)           updateFields['preferences.theme'] = theme;
    if (aiMode)          updateFields['preferences.llmMode'] = aiMode;
    if (dailyPlanTime)   updateFields['preferences.dailyPlanTime'] = dailyPlanTime;
    if (weeklyReviewDay) updateFields['preferences.weeklyReviewDay'] = weeklyReviewDay;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/me/export
exports.exportData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [user, goals, habits, memories, plans, reports, chats] = await Promise.all([
      User.findById(userId).select('-passwordHash -consent'),
      Goal.find({ userId }),
      Habit.find({ userId }),
      Memory.find({ userId }),
      DailyPlan.find({ userId }),
      WeeklyReport.find({ userId }),
      Chat.find({ userId })
    ]);

    // Fetch messages for all chats
    const chatIds = chats.map(c => c._id);
    const messages = await Message.find({ chatId: { $in: chatIds } });

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      profile: user,
      goals,
      habits,
      memories,
      dailyPlans: plans,
      weeklyReports: reports,
      chats: chats.map(chat => ({
        ...chat.toObject(),
        messages: messages.filter(m => m.chatId.toString() === chat._id.toString())
      }))
    };

    // Respond as a downloadable JSON file
    res.setHeader('Content-Disposition', `attachment; filename="ai-lifeos-export-${Date.now()}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(exportPayload);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/me
exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Delete all collections in parallel
    const chatDocs = await Chat.find({ userId }, '_id');
    const chatIds = chatDocs.map(c => c._id);

    await Promise.all([
      Goal.deleteMany({ userId }),
      Habit.deleteMany({ userId }),
      Memory.deleteMany({ userId }),
      DailyPlan.deleteMany({ userId }),
      WeeklyReport.deleteMany({ userId }),
      Chat.deleteMany({ userId }),
      Message.deleteMany({ chatId: { $in: chatIds } }),
      User.findByIdAndDelete(userId)
    ]);

    res.status(200).json({ success: true, message: 'Account and all associated data deleted.' });
  } catch (err) {
    next(err);
  }
};
