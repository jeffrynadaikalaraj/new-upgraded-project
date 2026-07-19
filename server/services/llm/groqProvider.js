const Groq = require('groq-sdk');
const config = require('../../config/env');

const groq = new Groq({
  apiKey: config.GROQ_API_KEY
});

const modelName = 'llama-3.1-8b-instant'; // Using Meta's latest fast model on Groq

// Prompt version — increment on every system prompt change for observability
const PROMPT_VERSION = 'v2.1';

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
    temperature: 0.7,
    max_tokens: 1024,
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
    temperature: 0.7,
    max_tokens: 1024,
  });

  return stream; // This returns an async iterable which orchestrator will handle
};

// Export prompt version for logging/observability
exports.PROMPT_VERSION = PROMPT_VERSION;
