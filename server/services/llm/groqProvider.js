const Groq = require('groq-sdk');
const config = require('../../config/env');

const groq = new Groq({
  apiKey: config.GROQ_API_KEY
});

const modelName = 'llama3-8b-8192'; // Using Meta's fast and free model on Groq

// Basic non-streaming call
exports.generateResponse = async (prompt, systemInstruction = '') => {
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const chatCompletion = await groq.chat.completions.create({
    messages,
    model: modelName,
  });

  return chatCompletion.choices[0]?.message?.content || '';
};

// Streaming call
exports.generateStream = async (messages, systemInstruction = '') => {
  const formattedMessages = [];
  
  if (systemInstruction) {
    formattedMessages.push({ role: 'system', content: systemInstruction });
  }
  
  // Add all history messages
  formattedMessages.push(...messages);

  const stream = await groq.chat.completions.create({
    messages: formattedMessages,
    model: modelName,
    stream: true,
  });

  return stream; // This returns an async iterable which orchestrator will handle
};
