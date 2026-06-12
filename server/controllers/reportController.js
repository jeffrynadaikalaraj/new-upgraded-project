const WeeklyReport = require('../models/WeeklyReport');
const { generateWeeklyReportForUser } = require('../services/reportService');

// GET /api/reports
exports.getAllReports = async (req, res, next) => {
  try {
    const reports = await WeeklyReport.find({ userId: req.user.id })
      .sort({ weekStartDate: -1 })
      .lean();
    res.status(200).json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/latest
exports.getLatestReport = async (req, res, next) => {
  try {
    const report = await WeeklyReport.findOne({ userId: req.user.id })
      .sort({ weekStartDate: -1 })
      .lean();
    res.status(200).json({ success: true, data: report || null });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/:id
exports.getReportById = async (req, res, next) => {
  try {
    const report = await WeeklyReport.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).lean();
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

// POST /api/reports/generate  — manual trigger
exports.generateReport = async (req, res, next) => {
  try {
    const report = await generateWeeklyReportForUser(req.user.id);
    res.status(201).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};
