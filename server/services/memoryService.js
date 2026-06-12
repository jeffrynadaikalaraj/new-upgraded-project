const Memory = require('../models/Memory');
const geminiProvider = require('./llm/geminiProvider');

/**
 * Extract memories from user message and AI response using Gemini and save them.
 * @param {string} userMessage - The last message sent by the user
 * @param {string} aiResponse - The AI's response
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} The saved memory documents
 */
exports.extractMemories = async (userMessage, aiResponse, userId) => {
  try {
    const systemInstruction = `You are AI LifeOS's Memory Extraction System.
Your job is to analyze the conversation between the user and the AI, and extract key information to remember about the user.

Types of memories to extract:
- 'fact': Stable background information (e.g., job, location, family, skills, programming languages they use, etc.)
- 'preference': Likes, dislikes, favorite things, core choices.
- 'event': Significant upcoming plans, scheduled events, past milestones.
- 'insight': Behavioral patterns, mood traits, learning style, psychological insights.

Rules:
1. Only extract information that is useful for future interactions (e.g., favorite coding language, diet preference, career goals, habits, etc.). Avoid generic pleasantries or short-lived context.
2. Formulate the "content" of the memory in clear, concise, third-person statements (e.g., "User's favorite programming language is Java", "User goes to the gym every morning", "User wants to become an AI Engineer").
3. Assign an "importance" score from 1 (trivial/transient) to 10 (critical personal context like name, major goals).
4. Provide relevant search tags (e.g., ["programming", "fitness", "career", "personal"]).
5. If the information is temporary, specify "expiresAfterDays" as an integer. Otherwise, omit it.
6. Return a valid JSON array of objects. If no useful memories can be extracted, return an empty array [].
7. Do not wrap the output in markdown code blocks like \`\`\`json. Just return raw JSON.

Output format:
[
  {
    "type": "fact|preference|event|insight",
    "content": "Statement in third person",
    "importance": 1-10,
    "tags": ["tag1", "tag2"],
    "expiresAfterDays": 30
  }
]`;

    const prompt = `User said: "${userMessage}"
AI responded: "${aiResponse}"

Extract any memories worth saving:`;

    const responseText = await geminiProvider.generateResponse(prompt, systemInstruction);

    // Parse the response
    let text = responseText.trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }

    if (!text) {
      return [];
    }

    let extractedList = [];
    try {
      extractedList = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse Gemini response for memory extraction:', text, parseError);
      return [];
    }

    if (!Array.isArray(extractedList)) {
      return [];
    }

    const savedMemories = [];
    for (const item of extractedList) {
      if (!item.content || !item.type) continue;

      let expiresAt = null;
      if (item.expiresAfterDays && typeof item.expiresAfterDays === 'number') {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + item.expiresAfterDays);
      }

      // De-duplication: check if a memory with exact same content already exists for this user
      const exists = await Memory.findOne({
        userId,
        content: item.content
      });

      if (exists) {
        exists.importance = item.importance || exists.importance;
        exists.tags = Array.isArray(item.tags) ? item.tags.map(t => t.toLowerCase()) : exists.tags;
        exists.expiresAt = expiresAt;
        await exists.save();
        savedMemories.push(exists);
        continue;
      }

      const memory = await Memory.create({
        userId,
        type: item.type,
        content: item.content,
        source: 'chat',
        importance: item.importance || 5,
        tags: Array.isArray(item.tags) ? item.tags.map(t => t.toLowerCase()) : [],
        expiresAt
      });
      savedMemories.push(memory);
    }

    return savedMemories;
  } catch (err) {
    console.error('Error in extractMemories:', err);
    return [];
  }
};

/**
 * Retrieve top relevant memories for a user based on their current message.
 * @param {string} userId - The user's ID
 * @param {string} currentMessage - The user's current message
 * @returns {Promise<Array>} List of relevant memory documents
 */
exports.getRelevantMemories = async (userId, currentMessage) => {
  try {
    // 1. Prune expired memories first
    await exports.pruneExpiredMemories();

    const activeFilter = {
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    if (!currentMessage) {
      // Return top 5 general high importance memories
      return await Memory.find({
        userId,
        ...activeFilter
      })
      .sort({ importance: -1, createdAt: -1 })
      .limit(5);
    }

    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'but', 'is', 'are', 'was', 'were', 'my', 'i', 'me', 'you', 'your',
      'he', 'she', 'they', 'it', 'to', 'in', 'on', 'at', 'of', 'for', 'with', 'about', 'against',
      'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up',
      'down', 'in', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'what',
      'who', 'where', 'why', 'how', 'which', 'this', 'that', 'these', 'those', 'am', 'been', 'has', 'have'
    ]);

    const keywords = currentMessage
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length >= 3 && !stopWords.has(word));

    let memories = [];
    if (keywords.length > 0) {
      const regexes = keywords.map(kw => new RegExp(kw, 'i'));
      memories = await Memory.find({
        userId,
        $and: [activeFilter],
        $or: [
          { content: { $in: regexes } },
          { tags: { $in: keywords } }
        ]
      })
      .sort({ importance: -1, createdAt: -1 })
      .limit(10);
    }

    // Fallback/Supplement: If we found fewer than 5 memories, pull the top general memories (importance >= 6)
    if (memories.length < 5) {
      const excludedIds = memories.map(m => m._id);
      const generalMemories = await Memory.find({
        userId,
        _id: { $nin: excludedIds },
        importance: { $gte: 6 },
        ...activeFilter
      })
      .sort({ importance: -1, createdAt: -1 })
      .limit(5 - memories.length);
      
      memories = [...memories, ...generalMemories];
    }

    return memories;
  } catch (err) {
    console.error('Error in getRelevantMemories:', err);
    return [];
  }
};

/**
 * Delete all memories that have expired.
 * @returns {Promise<number>} Number of deleted memories
 */
exports.pruneExpiredMemories = async () => {
  try {
    const result = await Memory.deleteMany({
      expiresAt: { $lte: new Date() }
    });
    if (result.deletedCount > 0) {
      console.log(`Pruned ${result.deletedCount} expired memories.`);
    }
    return result.deletedCount;
  } catch (err) {
    console.error('Error pruning expired memories:', err);
    return 0;
  }
};
