const Event = require('../../models/Event');
const DailyPlan = require('../../models/DailyPlan');

exports.syncDailyPlan = async (userId, date) => {
  const plan = await DailyPlan.findOne({ userId, date });
  if (!plan) return { success: false, message: "No daily plan found" };
  
  const eventsToCreate = plan.blocks.map(block => {
    // Handle time formatting carefully based on local timezone
    const startStr = `${date}T${block.startTime}:00`;
    const endStr = `${date}T${block.endTime}:00`;
    
    // Map block type to category
    let category = 'Other';
    if (block.type === 'goal_work') category = 'Work';
    if (block.title.toLowerCase().includes('study')) category = 'Study';
    if (block.title.toLowerCase().includes('fitness') || block.title.toLowerCase().includes('gym')) category = 'Fitness';
    
    return {
      userId,
      title: block.title,
      description: block.aiNotes,
      startTime: new Date(startStr),
      endTime: new Date(endStr),
      category: category,
      referenceId: plan._id,
      referenceType: 'DailyPlan'
    };
  });
  
  // Clear old daily plan events for this date to avoid duplicates
  const startOfDay = new Date(`${date}T00:00:00`);
  const endOfDay = new Date(`${date}T23:59:59`);
  await Event.deleteMany({ userId, referenceType: 'DailyPlan', startTime: { $gte: startOfDay, $lte: endOfDay } });
  
  await Event.insertMany(eventsToCreate);
  return { success: true, count: eventsToCreate.length };
};
