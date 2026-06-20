const Event = require('../models/Event');
const conflictService = require('../services/calendar/conflictService');
const calendarAIService = require('../services/calendar/calendarAIService');
const recurrenceService = require('../services/calendar/recurrenceService');
const plannerSyncService = require('../services/calendar/plannerSyncService');
const analyticsService = require('../services/calendar/analyticsService');

exports.getEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ userId: req.user.id }).sort('startTime');
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (err) {
    next(err);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.body, { new: true });
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: req.user.id });
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    await event.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// AI Generation
exports.generateDaily = async (req, res, next) => {
  try {
    const { date, prompt } = req.body;
    const events = await calendarAIService.generateDailySchedule(req.user.id, date, prompt);
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

exports.generateWeekly = async (req, res, next) => {
  try {
    const { startDate, prompt } = req.body;
    const events = await calendarAIService.generateWeeklySchedule(req.user.id, startDate, prompt);
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

exports.checkConflict = async (req, res, next) => {
  try {
    const { startTime, endTime, excludeEventId } = req.body;
    const result = await conflictService.checkConflicts(req.user.id, startTime, endTime, excludeEventId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.syncPlanner = async (req, res, next) => {
  try {
    const { date } = req.body;
    const result = await plannerSyncService.syncDailyPlan(req.user.id, date);
    if (!result.success) return res.status(404).json(result);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const { date } = req.query; // format: YYYY-MM-DD
    const result = await analyticsService.getAnalytics(req.user.id, date || new Date().toISOString().split('T')[0]);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
