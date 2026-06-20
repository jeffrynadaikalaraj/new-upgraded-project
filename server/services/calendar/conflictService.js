const Event = require('../../models/Event');

/**
 * Checks for event conflicts and suggests alternatives
 */
exports.checkConflicts = async (userId, startTime, endTime, excludeEventId = null) => {
  const query = {
    userId,
    $or: [
      { startTime: { $lt: endTime, $gte: startTime } },
      { endTime: { $gt: startTime, $lte: endTime } },
      { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
    ]
  };

  if (excludeEventId) {
    query._id = { $ne: excludeEventId };
  }

  const overlappingEvents = await Event.find(query);

  if (overlappingEvents.length === 0) {
    return { hasConflict: false };
  }

  // Suggest alternative slots based on the end of the conflict
  const suggestedSlots = [];
  const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
  
  // Find the latest end time among conflicting events
  let latestEndTime = new Date(startTime);
  overlappingEvents.forEach(e => {
    if (new Date(e.endTime) > latestEndTime) {
      latestEndTime = new Date(e.endTime);
    }
  });

  // Suggest 3 slots after the conflict ends
  for (let i = 0; i < 3; i++) {
    const newStart = new Date(latestEndTime.getTime() + (i * 60 * 60 * 1000)); // offset 1 hour each
    const newEnd = new Date(newStart.getTime() + duration);
    suggestedSlots.push({ startTime: newStart, endTime: newEnd });
  }

  return { 
    hasConflict: true, 
    conflictingEvents: overlappingEvents,
    suggestedSlots
  };
};
