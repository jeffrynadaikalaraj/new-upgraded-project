const groqProvider = require('./groqProvider');
const memoryService = require('../memoryService');
const { executeAction } = require('../actionExecutor');
const Document = require('../../models/Document');
const { semanticSearch } = require('../vectorService');

const SYSTEM_PROMPT = `You are AI LifeOS, a personal AI operating system and mentor.
Your goal is to help the user plan, track, and execute their goals.
Be concise, practical, and empathetic. 
Use markdown formatting where appropriate.
If a user expresses strong emotions, acknowledge them before providing solutions.

## ACTIONS
When the user asks you to DO something (not just talk about it), you MUST include
an action marker in your response. Format:
<!--ACTION:{"type":"create_goal","payload":{"title":"Learn Java","category":"learning"}}-->

Available actions:
- create_goal: { title, description?, category?, priority?, targetDate? }
- create_habit: { title, description?, frequency?, category? }
- add_task: { title, date?, startTime?, endTime? }
- save_note: { content, tags? }
- update_goal_progress: { goalTitle, progress }
- complete_habit: { habitTitle }
- search_documents: { query }
- generate_plan: { date? }
- schedule_event: { title, description?, startTime, endTime, type, isAllDay? }

IMPORTANT: Always confirm the action to the user naturally in your response.
Example: "I've created a new goal 'Learn Java' for you! 🎯"`;

// Using Groq for MVP
exports.executeLLMStream = async (messages, res, userId, callback) => {
  try {
    let memories = [];
    let latestUserMessage = '';

    let memoryContext = '';
    let personalityContext = '';

    if (userId) {
      const latestUserMessageObj = [...messages].reverse().find(msg => msg.role === 'user');
      latestUserMessage = latestUserMessageObj ? latestUserMessageObj.content : '';
      memories = await memoryService.getRelevantMemories(userId, latestUserMessage);
      
      const userProfile = await memoryService.getUserProfile(userId);
      const name = userProfile?.name || 'the user';
      
      // ── AI Personality Model Injection ──
      personalityContext = `\n\n## PERSONALITY MODEL & USER IDENTITY
You are talking to ${name}.
Adopt a deeply personalized mentoring persona tailored specifically to their goals, preferences, and traits.
Identity Vectors (Use these to shape your tone and advice):
${userProfile.identityVectors?.slice(0, 10).map(v => `- ${v}`).join('\n') || '- No specific identity data yet.'}
Preferences: ${JSON.stringify(userProfile.preferences || {})}
Address them by name occasionally. If they are slacking, gently push them based on their known goals.`;
    }

    if (memories && memories.length > 0) {
      memoryContext = '\n\n## RECENT MEMORIES:\n' + memories.map(m => `* ${m.content}`).join('\n');
    }

    let documentContext = '';
    if (userId && latestUserMessage.length > 10) {
      try {
        const userDocs = await Document.find({ userId, 'chunks.0': { $exists: true } }).select('+chunks.embedding filename originalName chunks');
        let allChunks = [];
        userDocs.forEach(doc => {
          if (doc.chunks) {
            doc.chunks.forEach(chunk => {
              if (chunk.embedding && chunk.embedding.length > 0) {
                allChunks.push({
                  text: chunk.text,
                  embedding: chunk.embedding,
                  source: doc.originalName || doc.filename
                });
              }
            });
          }
        });

        if (allChunks.length > 0) {
          const topChunks = await semanticSearch(latestUserMessage, allChunks, 3);
          // Only include if score is decent (e.g. > 0.5)
          const relevantChunks = topChunks.filter(c => c.score > 0.5);
          if (relevantChunks.length > 0) {
            documentContext = '\n\nRelevant Document Excerpts (Use this to answer if applicable):\n' + 
              relevantChunks.map(c => `[Source: ${c.source}]: ${c.text}`).join('\n\n');
          }
        }
      } catch (err) {
        console.error('RAG Error:', err);
      }
    }

    const dynamicSystemPrompt = SYSTEM_PROMPT + personalityContext + memoryContext + documentContext;
    
    // Switch to Groq provider
    const stream = await groqProvider.generateStream(messages, dynamicSystemPrompt);
    
    let fullResponse = '';
    
    // Iterate over Groq's async iterable stream
    for await (const chunk of stream) {
      const chunkText = chunk.choices[0]?.delta?.content || '';
      if (chunkText) {
        fullResponse += chunkText;
        // Send chunk via SSE
        res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
      }
    }
    
    // Check for actions in the complete response
    const actionRegex = /<!--ACTION:(.*?)-->/g;
    let match;
    const detectedActions = [];
    while ((match = actionRegex.exec(fullResponse)) !== null) {
      try {
        const actionData = JSON.parse(match[1]);
        detectedActions.push(actionData);
      } catch (err) {
        console.error('Failed to parse action JSON:', match[1], err);
      }
    }

    const actionResults = [];
    for (const act of detectedActions) {
      if (act.type && act.payload) {
        const result = await executeAction(userId, act.type, act.payload);
        actionResults.push({ type: act.type, result });
        // Stream the action back to the client
        res.write(`data: ${JSON.stringify({ action: { type: act.type, result } })}\n\n`);
      }
    }
    
    // Once done, execute callback to save to DB, extract memories, etc.
    if (callback) {
      await callback(fullResponse, actionResults);
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

