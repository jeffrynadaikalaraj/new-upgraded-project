const Event = require('../models/Event');

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
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: req.user.id });
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    await event.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
