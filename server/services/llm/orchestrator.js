const geminiProvider = require('./geminiProvider');
// Import groqProvider and ollamaProvider in the future

const SYSTEM_PROMPT = `You are AI LifeOS, a personal AI operating system and mentor.
Your goal is to help the user plan, track, and execute their goals.
Be concise, practical, and empathetic. 
Use markdown formatting where appropriate.
If a user expresses strong emotions, acknowledge them before providing solutions.`;

// For MVP, we route everything to Gemini
exports.executeLLMStream = async (messages, res, callback) => {
  try {
    const stream = await geminiProvider.generateStream(messages, SYSTEM_PROMPT);
    
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
  } catch (err) {
    console.error('LLM Streaming Error:', err);
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`);
    res.end();
  }
};
