const Chat = require('../models/Chat');
const Message = require('../models/Message');
const orchestrator = require('../services/llm/orchestrator');

exports.streamChat = async (req, res, next) => {
  try {
    const { message, mode, chatId } = req.query;
    
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

    // Save user message
    const userMsg = await Message.create({
      chatId: chat._id,
      userId: req.user.id,
      role: 'user',
      content: message
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

    // Start LLM stream
    const startTime = Date.now();
    await orchestrator.executeLLMStream(formattedHistory, res, async (fullResponse) => {
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
};

exports.getChatHistory = async (req, res, next) => {
  try {
    const chats = await Chat.find({ userId: req.user.id })
      .sort({ lastMessageAt: -1 })
      .select('title lastMessageAt messageCount');
    
    res.status(200).json({ success: true, data: chats });
  } catch (err) {
    next(err);
  }
};

exports.getChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.id });
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    const messages = await Message.find({ chatId: chat._id }).sort({ timestamp: 1 });
    
    res.status(200).json({ success: true, data: { chat, messages } });
  } catch (err) {
    next(err);
  }
};

exports.deleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.id });
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    await Message.deleteMany({ chatId: chat._id });
    await chat.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
