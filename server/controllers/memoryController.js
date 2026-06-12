const Memory = require('../models/Memory');

// @desc    Get all memories for user
// @route   GET /api/memories
// @access  Private
exports.getMemories = async (req, res, next) => {
  try {
    const memories = await Memory.find({ userId: req.user.id }).sort({ importance: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: memories.length, data: memories });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete single memory
// @route   DELETE /api/memories/:id
// @access  Private
exports.deleteMemory = async (req, res, next) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, userId: req.user.id });
    if (!memory) {
      return res.status(404).json({ success: false, error: 'Memory not found' });
    }
    await memory.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete all memories for user
// @route   DELETE /api/memories
// @access  Private
exports.clearMemories = async (req, res, next) => {
  try {
    const result = await Memory.deleteMany({ userId: req.user.id });
    res.status(200).json({ success: true, data: { deletedCount: result.deletedCount } });
  } catch (err) {
    next(err);
  }
};
