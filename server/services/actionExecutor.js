const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const DailyPlan = require('../models/DailyPlan');
const Memory = require('../models/Memory');
const Event = require('../models/Event');

const executeAction = async (userId, actionType, payload) => {
  console.log(`[ActionExecutor] Executing ${actionType} for user ${userId}`, payload);
  try {
    switch (actionType) {
      case 'create_goal':
        const goal = await Goal.create({
          userId,
          title: payload.title,
          description: payload.description || '',
          category: payload.category || 'other',
          priority: payload.priority || 'medium',
          targetDate: payload.targetDate ? new Date(payload.targetDate) : undefined,
          aiGenerated: true
        });
        return { success: true, message: `Created goal: ${goal.title}`, data: goal };
        
      case 'create_habit':
        const habit = await Habit.create({
          userId,
          title: payload.title,
          description: payload.description || '',
          frequency: payload.frequency || 'daily',
          category: payload.category || 'other'
        });
        return { success: true, message: `Created habit: ${habit.title}`, data: habit };
        
      case 'add_task':
        const targetDate = payload.date || new Date().toISOString().split('T')[0];
        const plan = await DailyPlan.findOne({ userId, date: targetDate });
        const newBlock = {
          title: payload.title,
          startTime: payload.startTime || '09:00',
          endTime: payload.endTime || '10:00',
          type: 'custom',
          aiNotes: 'Added via chat'
        };
        
        if (plan) {
          plan.blocks.push(newBlock);
          await plan.save();
          return { success: true, message: `Added task to plan for ${targetDate}`, data: plan };
        } else {
          const newPlan = await DailyPlan.create({
            userId,
            date: targetDate,
            blocks: [newBlock],
            score: 0
          });
          return { success: true, message: `Created plan for ${targetDate} with new task`, data: newPlan };
        }
        
      case 'save_note':
        const memory = await Memory.create({
          userId,
          type: 'fact',
          content: payload.content,
          source: 'manual',
          tags: payload.tags || [],
          importance: 5
        });
        return { success: true, message: `Note saved`, data: memory };
        
      case 'update_goal_progress':
        // Simplistic match by title
        const matchGoal = await Goal.findOne({ userId, title: { $regex: new RegExp(payload.goalTitle, 'i') } });
        if (matchGoal) {
          matchGoal.progress = payload.progress;
          if (payload.progress >= 100) {
            matchGoal.status = 'completed';
            matchGoal.completedAt = Date.now();
          }
          await matchGoal.save();
          return { success: true, message: `Goal progress updated`, data: matchGoal };
        }
        return { success: false, message: `Goal not found: ${payload.goalTitle}` };

      case 'complete_habit':
        const matchHabit = await Habit.findOne({ userId, title: { $regex: new RegExp(payload.habitTitle, 'i') } });
        if (matchHabit) {
          const today = new Date();
          matchHabit.completionLog.push({ date: today, completed: true });
          
          if (!matchHabit.streak) matchHabit.streak = { current: 0, longest: 0 };
          matchHabit.streak.current += 1;
          matchHabit.streak.longest = Math.max(matchHabit.streak.longest, matchHabit.streak.current);
          matchHabit.streak.lastCompletedAt = today;
          
          await matchHabit.save();
          return { success: true, message: `Marked habit as complete`, data: matchHabit };
        }
        return { success: false, message: `Habit not found: ${payload.habitTitle}` };

      case 'schedule_event':
        // Basic conflict detection (if existing event starts exactly then)
        const conflict = await Event.findOne({
          userId,
          startTime: new Date(payload.startTime)
        });
        
        let warning = '';
        if (conflict) {
          warning = ` Note: Conflicts with existing event '${conflict.title}'`;
        }

        const newEvent = await Event.create({
          userId,
          title: payload.title,
          description: payload.description || '',
          startTime: new Date(payload.startTime),
          endTime: new Date(payload.endTime),
          isAllDay: payload.isAllDay || false,
          type: payload.type || 'task'
        });
        return { success: true, message: `Scheduled event: ${newEvent.title}.${warning}`, data: newEvent };

      default:
        return { success: false, message: `Unknown action type: ${actionType}` };
    }
  } catch (err) {
    console.error(`[ActionExecutor] Error executing ${actionType}:`, err);
    return { success: false, message: `Failed to execute ${actionType}` };
  }
};

module.exports = { executeAction };
