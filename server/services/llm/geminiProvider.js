const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/env');

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

const modelName = 'gemini-1.5-flash';

// Basic non-streaming call
exports.generateResponse = async (prompt, systemInstruction = '') => {
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
