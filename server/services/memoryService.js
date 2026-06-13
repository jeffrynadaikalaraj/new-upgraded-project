const Memory = require('../models/Memory');
const groqProvider = require('./llm/groqProvider');

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
- 'fact': Stable background information
- 'preference': Likes, dislikes, favorite things
- 'event': Significant upcoming plans, scheduled events
- 'insight': Behavioral patterns, mood traits
- 'profile': Core identity elements (name, age, profession)

Rules:
1. Only extract information useful for future interactions.
2. Formulate "content" as a clear, concise, third-person statement.
3. Assign an "importance" score from 1 to 10.
4. Extract structured key-value pairs if applicable (e.g., key: "favorite_language", value: "Java", category: "tech"). Category can be: personal, education, career, health, tech, lifestyle, social, general.
5. Provide relevant search tags.
6. Return a valid JSON array of objects.
7. Do not wrap output in markdown code blocks.

Output format:
[
  {
    "type": "fact|preference|event|insight|profile",
    "content": "Statement in third person",
    "key": "specific_attribute_name_optional",
    "value": "attribute_value_optional",
    "category": "general",
    "importance": 1-10,
    "tags": ["tag1", "tag2"],
    "expiresAfterDays": 30
  }
]`;

    const prompt = `User said: "${userMessage}"
AI responded: "${aiResponse}"

Extract any memories worth saving:`;

    const responseText = await groqProvider.generateResponse(prompt, systemInstruction);

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
        key: item.key,
        value: item.value,
        category: item.category || 'general',
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

/**
 * Get aggregated user profile from memories.
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} Aggregated profile object
 */
exports.getUserProfile = async (userId) => {
  try {
    const profileMemories = await Memory.find({ userId, type: 'profile' }).sort({ createdAt: -1 });
    const preferences = await Memory.find({ userId, type: 'preference' }).sort({ createdAt: -1 });
    const insights = await Memory.find({ userId, type: 'insight' }).sort({ createdAt: -1 });
    const facts = await Memory.find({ userId, type: 'fact' }).sort({ createdAt: -1 });

    const profile = {};
    profileMemories.forEach(m => { if (m.key) profile[m.key] = m.value; });

    const prefs = {};
    preferences.forEach(m => { if (m.key) prefs[m.key] = m.value; });
    
    const identityVectors = insights.map(i => i.content).concat(facts.map(f => f.content));

    return { ...profile, preferences: prefs, identityVectors };
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return {};
  }
};
