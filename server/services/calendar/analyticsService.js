const Event = require('../../models/Event');
const { startOfWeek, endOfWeek, addDays, isSameDay } = require('date-fns');

exports.getAnalytics = async (userId, dateStr) => {
  const currentDate = new Date(`${dateStr}T00:00:00`);
  const startOfDay = new Date(currentDate);
  const endOfDay = new Date(`${dateStr}T23:59:59`);
  
  const tomorrowStart = addDays(startOfDay, 1);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  // Fetch all events for the week
  const weekEvents = await Event.find({
    userId,
    startTime: { $gte: weekStart, $lte: weekEnd }
  });

  // Today metrics
  let todayScheduledMs = 0;
  let todayCompletedTasks = 0;
  let todayTotalTasks = 0;
  let focusTimeSpent = 0;
  let studyHours = 0;
  let fitnessHours = 0;

  // Tomorrow metrics
  let tomorrowScheduledMs = 0;
  
  // Week metrics
  let weekScheduledMs = 0;
  let completedByDay = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 }; // Sunday=0
  
  weekEvents.forEach(e => {
    const duration = new Date(e.endTime) - new Date(e.startTime);
    weekScheduledMs += duration;

    if (e.isCompleted) {
      const dayOfWeek = new Date(e.startTime).getDay();
      completedByDay[dayOfWeek]++;
    }

    if (isSameDay(new Date(e.startTime), currentDate)) {
      todayTotalTasks++;
      todayScheduledMs += duration;
      if (e.isCompleted) todayCompletedTasks++;
      if (e.focusTimeSpent) focusTimeSpent += e.focusTimeSpent;
      if (e.category === 'Study') studyHours += duration;
      if (e.category === 'Fitness') fitnessHours += duration;
    }

    if (isSameDay(new Date(e.startTime), tomorrowStart)) {
      tomorrowScheduledMs += duration;
    }
  });

  // Calculate free time assuming 16 active hours per day
  const todayFreeTime = (16 - (todayScheduledMs / (1000 * 60 * 60))).toFixed(1);
  const tomorrowFreeTime = (16 - (tomorrowScheduledMs / (1000 * 60 * 60))).toFixed(1);
  const weekFreeTime = ((16 * 7) - (weekScheduledMs / (1000 * 60 * 60))).toFixed(1);

  const todayScheduledHours = (todayScheduledMs / (1000 * 60 * 60)).toFixed(1);
  const focusScore = todayTotalTasks === 0 ? 100 : Math.round((todayCompletedTasks / todayTotalTasks) * 100);

  // Most Productive Day
  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let maxCompleted = -1;
  let mostProductiveDay = 'None';
  for (const [day, count] of Object.entries(completedByDay)) {
    if (count > maxCompleted) {
      maxCompleted = count;
      mostProductiveDay = daysMap[day];
    }
  }

  return {
    focusScore,
    todayScheduledHours,
    todayCompletedTasks,
    remainingTasks: todayTotalTasks - todayCompletedTasks,
    freeTime: {
      today: todayFreeTime,
      tomorrow: tomorrowFreeTime,
      thisWeek: weekFreeTime
    },
    focusTimeSpent: (focusTimeSpent / 60).toFixed(1), // in hours
    studyHours: (studyHours / (1000 * 60 * 60)).toFixed(1),
    fitnessHours: (fitnessHours / (1000 * 60 * 60)).toFixed(1),
    mostProductiveDay
  };
};
