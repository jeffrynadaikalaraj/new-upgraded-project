const Event = require('../../models/Event');

exports.getAnalytics = async (userId, dateStr) => {
  const startOfDay = new Date(`${dateStr}T00:00:00`);
  const endOfDay = new Date(`${dateStr}T23:59:59`);
  
  const todayEvents = await Event.find({
    userId,
    startTime: { $gte: startOfDay, $lte: endOfDay }
  });
  
  let scheduledMs = 0;
  let completedTasks = 0;
  let totalTasks = todayEvents.length;
  
  todayEvents.forEach(e => {
    scheduledMs += (new Date(e.endTime) - new Date(e.startTime));
    if (e.isCompleted) completedTasks++;
  });
  
  const scheduledHours = (scheduledMs / (1000 * 60 * 60)).toFixed(1);
  const remainingTasks = totalTasks - completedTasks;
  const focusScore = totalTasks === 0 ? 100 : Math.round((completedTasks / totalTasks) * 100);
  const freeTime = (24 - scheduledHours).toFixed(1);
  
  return {
    focusScore,
    scheduledHours,
    completedTasks,
    remainingTasks,
    freeTime
  };
};
