const asyncHandler = require('express-async-handler');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Document = require('../models/Document');
const orchestrator = require('../services/llm/orchestrator');

exports.streamChat = asyncHandler(async (req, res, next) => {
  try {
    // Read from body (POST) or query (GET fallback)
    const message = req.body.message || req.query.message;
    const mode = req.body.mode || req.query.mode;
    const chatId = req.body.chatId || req.query.chatId;
    const attachedDocId = req.body.attachedDocId || req.query.attachedDocId;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let chat;
    if (chatId && chatId !== 'undefined') {
      chat = await Chat.findById(chatId);
    } 

    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        userId: req.user.id,
        title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
        messageCount: 0
      });
      // Tell client the new chatId immediately
      res.write(`data: ${JSON.stringify({ chatId: chat._id })}\n\n`);
    }

    // Save user message (clean message, no huge text blob)
    const userMsg = await Message.create({
      chatId: chat._id,
      userId: req.user.id,
      role: 'user',
      content: message,
      attachedDocument: attachedDocId || undefined
    });

    // Fetch conversation history for context (last 20 messages)
    const history = await Message.find({ chatId: chat._id })
      .sort({ timestamp: -1 })
      .limit(20);
    
    // Reverse to chronological order
    const formattedHistory = history.reverse().map(m => ({
      role: m.role,
      content: m.content
    }));

    // If an attached document exists, append its content to the prompt temporarily
    if (attachedDocId) {
      const doc = await Document.findOne({ _id: attachedDocId, userId: req.user.id });
      if (doc) {
        const MAX_DOC_CHARS = 30000; // ~8k tokens safety limit
        let docText = doc.extractedText || doc.summary || 'No text could be extracted.';
        
        // Token-limit safety: truncate if too large (like GPT does)
        if (docText.length > MAX_DOC_CHARS) {
          docText = docText.substring(0, MAX_DOC_CHARS) + '\n\n[... Document truncated due to length. Only the first portion is shown.]';
        }
        
        const fileContext = `\n\n[SYSTEM: The user has attached a file named "${doc.originalName}" (${doc.mimeType}, ${Math.round(doc.size / 1024)}KB). Here is the extracted content:\n${docText}\n]`;
        
        // Append it to the last user message in the formatted history sent to LLM
        if (formattedHistory.length > 0) {
           formattedHistory[formattedHistory.length - 1].content += fileContext;
        }
      }
    }

    // Start LLM stream
    const startTime = Date.now();
    await orchestrator.executeLLMStream(formattedHistory, res, req.user.id, async (fullResponse, actionResults) => {
      // Callback executed after stream completes
      const latencyMs = Date.now() - startTime;
      
      // Save AI message
      await Message.create({
        chatId: chat._id,
        userId: req.user.id,
        role: 'assistant',
        content: fullResponse,
        model: 'gemini-1.5-flash',
        latencyMs,
        actions: actionResults || [],
      });

      // Update chat metadata
      chat.messageCount += 2;
      chat.lastMessageAt = Date.now();
      await chat.save();
    });

  } catch (err) {
    console.error('Chat stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error during streaming' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Server error during stream generation' })}\n\n`);
      res.end();
    }
  }
});

exports.getChatHistory = asyncHandler(async (req, res, next) => {
    const chats = await Chat.find({ userId: req.user.id })
      .sort({ lastMessageAt: -1 })
      .select('title lastMessageAt messageCount');
    
    res.status(200).json({ success: true, data: chats });
});

exports.getChat = asyncHandler(async (req, res, next) => {

    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.id });
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    const messages = await Message.find({ chatId: chat._id }).sort({ timestamp: 1 });
    
    res.status(200).json({ success: true, data: { chat, messages } });
  
});

exports.deleteChat = asyncHandler(async (req, res, next) => {

    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.id });
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    await Message.deleteMany({ chatId: chat._id });
    await chat.deleteOne();

    res.status(200).json({ success: true, data: {} });
  
});
