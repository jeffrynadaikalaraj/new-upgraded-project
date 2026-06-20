const groqProvider = require('../llm/groqProvider');
const memoryService = require('../memoryService');

exports.generateDailySchedule = async (userId, targetDate, promptText) => {
  const memories = await memoryService.getRelevantMemories(userId, promptText || 'schedule calendar');
  const memoriesSummary = memories.map(m => `- ${m.content}`).join('\n');

  const systemInstruction = `You are a premium AI Calendar Assistant. Your task is to generate a structured daily schedule based on the user's prompt.
Respond ONLY with a valid JSON array of event objects. Do NOT include markdown blocks.
Each object must have:
- title: string
- description: string (brief)
- startTime: string (ISO 8601 full date-time format for ${targetDate})
- endTime: string (ISO 8601 full date-time format)
- category: string (must be exactly one of: "Study", "Fitness", "Work", "Personal", "Meeting", "Other")
- isAllDay: boolean

Use user memories to infer preferred times if not explicitly stated (e.g. if memory says "usually studies Java at 7PM", schedule it at 19:00).`;

  const prompt = `Target Date: ${targetDate}
User Request: ${promptText}

Memories:
${memoriesSummary || 'None'}

Return a JSON array only.`;

  const responseText = await groqProvider.generateResponse(prompt, systemInstruction);
  
  try {
    // Basic cleanup in case LLM wraps in ```json
    const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse calendar AI response:", e, responseText);
    return [];
  }
};

exports.generateWeeklySchedule = async (userId, startDate, promptText) => {
  const memories = await memoryService.getRelevantMemories(userId, promptText || 'weekly schedule');
  const memoriesSummary = memories.map(m => `- ${m.content}`).join('\n');

  const systemInstruction = `You are a premium AI Calendar Assistant. Your task is to generate a structured weekly schedule (7 days) starting from ${startDate} based on the user's prompt.
Respond ONLY with a valid JSON array of event objects. Do NOT include markdown blocks.

CRITICAL INSTRUCTION: Intelligent Time Blocking
If the user asks to "Study Java 10 hours this week", you must break this down into multiple 1.5 to 2-hour sessions spread across the week to total 10 hours.
Do not schedule a single 10-hour block. Avoid conflicts with typical sleep times.

Each object must have:
- title: string
- description: string
- startTime: string (ISO 8601 full date-time format)
- endTime: string (ISO 8601 full date-time format)
- category: string (must be exactly one of: "Study", "Fitness", "Work", "Personal", "Meeting", "Other")
- isAllDay: boolean`;

  const prompt = `Start Date: ${startDate}
User Request: ${promptText}

Memories:
${memoriesSummary || 'None'}

Return a JSON array only.`;

  const responseText = await groqProvider.generateResponse(prompt, systemInstruction);
  
  try {
    const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse weekly calendar AI response:", e);
    return [];
  }
};
