const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const conflictService = require('../services/calendar/conflictService');
const calendarAIService = require('../services/calendar/calendarAIService');
const recurrenceService = require('../services/calendar/recurrenceService');
const plannerSyncService = require('../services/calendar/plannerSyncService');
const analyticsService = require('../services/calendar/analyticsService');

exports.getEvents = asyncHandler(async (req, res, next) => {

    const events = await Event.find({ userId: req.user.id }).sort('startTime');
    res.status(200).json({ success: true, count: events.length, data: events });
  
});

exports.createEvent = asyncHandler(async (req, res, next) => {

    req.body.userId = req.user.id;
    const { startTime, endTime, _id } = req.body;
    
    // Check conflict
    if (startTime && endTime) {
      const conflictResult = await conflictService.checkConflicts(req.user.id, startTime, endTime, _id);
      if (conflictResult.hasConflict && !req.body.ignoreConflict) {
        return res.status(409).json({ success: false, conflict: conflictResult });
      }
    }

    if (req.body.recurrenceRule) {
       const events = await recurrenceService.createRecurringEvents(req.user.id, req.body, req.body.recurrenceRule);
       return res.status(201).json({ success: true, data: events[0], count: events.length });
    } else {
       let event;
       if (_id) {
         event = await Event.findOneAndUpdate({ _id, userId: req.user.id }, req.body, { new: true });
       } else {
         event = await Event.create(req.body);
       }
       return res.status(201).json({ success: true, data: event });
    }
  
});

exports.updateEvent = asyncHandler(async (req, res, next) => {

    const event = await Event.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.body, { new: true });
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    res.status(200).json({ success: true, data: event });
  
});

exports.deleteEvent = asyncHandler(async (req, res, next) => {

    const event = await Event.findOne({ _id: req.params.id, userId: req.user.id });
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    await event.deleteOne();
    res.status(200).json({ success: true, data: {} });
  
});

// AI Generation
exports.generateDaily = asyncHandler(async (req, res, next) => {

    const { date, prompt } = req.body;
    const events = await calendarAIService.generateDailySchedule(req.user.id, date, prompt);
    res.status(200).json({ success: true, data: events });
  
});

exports.generateWeekly = asyncHandler(async (req, res, next) => {

    const { startDate, prompt } = req.body;
    const events = await calendarAIService.generateWeeklySchedule(req.user.id, startDate, prompt);
    res.status(200).json({ success: true, data: events });
  
});

exports.checkConflict = asyncHandler(async (req, res, next) => {

    const { startTime, endTime, excludeEventId } = req.body;
    const result = await conflictService.checkConflicts(req.user.id, startTime, endTime, excludeEventId);
    res.status(200).json({ success: true, data: result });
  
});

exports.syncPlanner = asyncHandler(async (req, res, next) => {

    const { date } = req.body;
    const result = await plannerSyncService.syncDailyPlan(req.user.id, date);
    if (!result.success) return res.status(404).json(result);
    res.status(200).json(result);
  
});

exports.getAnalytics = asyncHandler(async (req, res, next) => {

    const { date } = req.query; // format: YYYY-MM-DD
    const result = await analyticsService.getAnalytics(req.user.id, date || new Date().toISOString().split('T')[0]);
    res.status(200).json({ success: true, data: result });
  
});
