const asyncHandler = require('express-async-handler');
const WeeklyReport = require('../models/WeeklyReport');
const { generateWeeklyReportForUser } = require('../services/reportService');

// GET /api/reports
exports.getAllReports = asyncHandler(async (req, res, next) => {

    const reports = await WeeklyReport.find({ userId: req.user.id })
      .sort({ weekStartDate: -1 })
      .lean();
    res.status(200).json({ success: true, data: reports });
  
});

// GET /api/reports/latest
exports.getLatestReport = asyncHandler(async (req, res, next) => {

    const report = await WeeklyReport.findOne({ userId: req.user.id })
      .sort({ weekStartDate: -1 })
      .lean();
    res.status(200).json({ success: true, data: report || null });
  
});

// GET /api/reports/:id
exports.getReportById = asyncHandler(async (req, res, next) => {

    const report = await WeeklyReport.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).lean();
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.status(200).json({ success: true, data: report });
  
});

// POST /api/reports/generate  — manual trigger
exports.generateReport = asyncHandler(async (req, res, next) => {

    const report = await generateWeeklyReportForUser(req.user.id);
    res.status(201).json({ success: true, data: report });
  
});
