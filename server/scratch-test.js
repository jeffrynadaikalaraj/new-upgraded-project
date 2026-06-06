require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    console.log('Using Key:', process.env.GEMINI_API_KEY ? 'Set' : 'Not Set');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContentStream('hi');
    
    let text = '';
    for await (const chunk of result.stream) {
      text += chunk.text();
    }
    console.log('Success!', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
