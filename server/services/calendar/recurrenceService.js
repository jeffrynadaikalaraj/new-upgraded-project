const Event = require('../../models/Event');

exports.createRecurringEvents = async (userId, baseEvent, rule, count = 12) => {
  const events = [];
  const duration = new Date(baseEvent.endTime).getTime() - new Date(baseEvent.startTime).getTime();
  
  for (let i = 0; i < count; i++) {
    const nextStart = new Date(baseEvent.startTime);
    if (rule === 'daily') nextStart.setDate(nextStart.getDate() + i);
    else if (rule === 'weekly') nextStart.setDate(nextStart.getDate() + (i * 7));
    else if (rule === 'monthly') nextStart.setMonth(nextStart.getMonth() + i);
    
    events.push({
      ...baseEvent,
      startTime: nextStart,
      endTime: new Date(nextStart.getTime() + duration),
      recurrenceRule: rule
    });
  }
  
  return await Event.insertMany(events);
};
