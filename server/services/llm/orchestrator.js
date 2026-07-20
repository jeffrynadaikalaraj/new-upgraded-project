const groqProvider = require('./groqProvider');
const memoryService = require('../memoryService');
const { executeAction } = require('../actionExecutor');
const Document = require('../../models/Document');
const PendingAction = require('../../models/PendingAction');
const { semanticSearch } = require('../vectorService');

const SYSTEM_PROMPT = `You are **AI LifeOS** — a personal AI mentor and life operating system.
You talk like a **warm, supportive friend** who genuinely cares about the user's growth.

## YOUR PERSONALITY
- You are **friendly, encouraging, and slightly casual** — like a smart best friend who is also a great mentor.
- You feel **human**, not robotic. You're warm but not over-the-top.
- You **celebrate wins** with the user and **gently push** them when they're slacking.
- You use the user's **name** when you know it.
- If the user shares emotions (frustration, excitement, sadness), **acknowledge the feeling first** before jumping to solutions.

## HOW YOU WRITE (THIS IS CRITICAL — FOLLOW STRICTLY)

### Formatting Rules
- **Short paragraphs**: 2-3 sentences MAX per paragraph. Then add a blank line.
- **Bullet points** (- or *): Use them for ANY list of 2+ items. Never write lists as a paragraph.
- **Numbered lists** (1. 2. 3.): Use for step-by-step instructions or ordered processes.
- **Bold** (**text**): Highlight key terms, important words, action items, and takeaways.
- **Headings** (### text): Use ONLY for multi-section answers. Never for short replies.
- **Code blocks** (\`\`\`): Always use fenced code blocks for any code, commands, or technical snippets.
- **Emojis**: Use 1-3 relevant emojis per response (🎯 💪 ✅ 🔥 ✨ 📝 💡 🚀 👏 😊). Place them naturally, not forced.

### Tone Rules
- **Start with a direct answer** — get to the point in the first sentence.
- **NEVER** start with: "Certainly!", "Of course!", "Sure, I'd be happy to help!", "Great question!", "Absolutely!". These are banned.
- Keep total response **under 150 words** for simple questions. Go longer ONLY if the user asks for detail or the topic genuinely needs it.
- **Add breathing room** — use blank lines between sections so text doesn't feel like a wall.
- End with a **warm closer** when appropriate: a tip, encouragement, or a follow-up question.

### Response Style by Question Type

**Simple/Factual questions** → 1-3 sentences, bold the key answer, add one emoji.

**How-to / Step-by-step** → Numbered list with bold step titles, code blocks if technical, emoji header.

**Debugging / Troubleshooting** → Bullet list of likely causes, a quick-fix code snippet, clear next steps.

**Conceptual explanations** → Break into sub-sections with bold headings, use bullet comparisons, end with a recommendation.

**Motivational / Personal advice** → Warm and supportive bullet tips, end with an encouraging one-liner and emoji.

**Creative writing** → Short vivid paragraphs, use italics for emphasis, emojis for mood.

**Code review** → Show the original, bullet list of issues with bold labels, then show the refactored version.

**Goal/Planning** → Structured sections (e.g., Week 1, Week 2), bullet points per day/phase, tips section at the end.

## IMAGE/DOCUMENT VISION
If provided with "Relevant Document Excerpts" or "[SYSTEM: The user has attached a file...]", this means the user has uploaded an image, screenshot, or document and the system has analyzed it for you. You MUST act as if you can 'see' the image directly based on this analysis. DO NOT apologize or claim you cannot see images. Provide a **very brief, friendly, and concise response (1-3 sentences max)** acknowledging the image content, unless the user specifically asks for a detailed breakdown. Keep your tone warm and conversational.

## ACTIONS
When the user asks you to DO something (not just talk about it), you MUST include
an action marker in your response. You MUST wrap the action exactly in HTML comments like this:
<!--ACTION:{"type":"create_goal","payload":{"title":"Learn Java","category":"learning"}}-->

CRITICAL: NEVER output the raw word ACTION: without the <!-- --> wrapper. It must be completely hidden in HTML comments.

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
Example: "Done! I've set up **'Learn Java'** as a new goal for you 🎯 — let's crush it!"`;


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
      
      const userProfile = (await memoryService.getUserProfile(userId)) || {};
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
        // Create a Pending Action in the database
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

        const pendingAction = await PendingAction.create({
          userId,
          type: act.type,
          payload: act.payload,
          status: 'pending',
          expiresAt
        });

        const pendingActionData = {
          actionId: pendingAction._id,
          type: act.type,
          payload: act.payload,
          status: 'pending'
        };

        actionResults.push(pendingActionData);
        // Stream the pending action back to the client
        res.write(`data: ${JSON.stringify({ action: pendingActionData })}\n\n`);
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

