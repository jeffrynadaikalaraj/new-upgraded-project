const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/env');

let genAI = null;
if (config.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
} else {
  console.warn('[WARNING] GEMINI_API_KEY is not set. Gemini features will fail if called.');
}

const modelName = 'gemini-1.5-flash';

// Basic non-streaming call
exports.generateResponse = async (prompt, systemInstruction = '') => {
  if (!genAI) throw new Error('GEMINI_API_KEY is missing. Gemini is disabled.');
  
  const model = genAI.getGenerativeModel({
    model: modelName,

    systemInstruction: systemInstruction
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

// Streaming call
exports.generateStream = async (messages, systemInstruction = '') => {
  if (!genAI) throw new Error('GEMINI_API_KEY is missing. Gemini is disabled.');

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemInstruction
  });

  // Convert generic messages to Gemini format
  const history = messages.slice(0, -1).map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const latestMessage = messages[messages.length - 1].content;

  const chat = model.startChat({ history });

  const result = await chat.sendMessageStream(latestMessage);
  return result.stream;
};

// Generate vector embedding for a piece of text
exports.generateEmbedding = async (text) => {
  if (!genAI) throw new Error('GEMINI_API_KEY is missing. Gemini is disabled.');

  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
  return result.embedding.values;
};
