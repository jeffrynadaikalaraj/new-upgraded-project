const geminiProvider = require('./geminiProvider');
const memoryService = require('../memoryService');
// Import groqProvider and ollamaProvider in the future

const SYSTEM_PROMPT = `You are AI LifeOS, a personal AI operating system and mentor.
Your goal is to help the user plan, track, and execute their goals.
Be concise, practical, and empathetic. 
Use markdown formatting where appropriate.
If a user expresses strong emotions, acknowledge them before providing solutions.`;

// For MVP, we route everything to Gemini
exports.executeLLMStream = async (messages, res, userId, callback) => {
  try {
    let memories = [];
    let latestUserMessage = '';

    if (userId) {
      const latestUserMessageObj = [...messages].reverse().find(msg => msg.role === 'user');
      latestUserMessage = latestUserMessageObj ? latestUserMessageObj.content : '';
      memories = await memoryService.getRelevantMemories(userId, latestUserMessage);
    }

    let memoryContext = '';
    if (memories && memories.length > 0) {
      memoryContext = '\n\nThings I remember about this user:\n' + memories.map(m => `* ${m.content}`).join('\n');
    }

    const dynamicSystemPrompt = SYSTEM_PROMPT + memoryContext;
    const stream = await geminiProvider.generateStream(messages, dynamicSystemPrompt);
    
    let fullResponse = '';
    
    for await (const chunk of stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      
      // Send chunk via SSE
      res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
    }
    
    // Once done, execute callback to save to DB, extract memories, etc.
    if (callback) {
      await callback(fullResponse);
    }
    
    res.write(`data: [DONE]\n\n`);
    res.end();

    // Perform memory extraction in the background so we do not block client connection closing
    if (userId && latestUserMessage && fullResponse) {
      memoryService.extractMemories(latestUserMessage, fullResponse, userId).catch(err => {
        console.error('Failed to extract memories in background:', err);
      });
    }
  } catch (err) {
    console.error('LLM Streaming Error:', err);
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`);
    res.end();
  }
};

