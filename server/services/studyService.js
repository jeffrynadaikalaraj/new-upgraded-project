const groqProvider = require('./llm/groqProvider');

/**
 * Generates MCQs from a given document text.
 */
exports.generateMCQs = async (documentText, count = 5) => {
  const systemInstruction = `You are an AI Study Companion.
Generate exactly ${count} multiple-choice questions based on the provided text.
Return the output strictly in the following JSON array format, and nothing else:
[
  {
    "question": "The question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0, // index of the correct option
    "explanation": "Why this is correct."
  }
]`;

  const prompt = `Document Text: ${documentText.slice(0, 15000)}`;

  try {
    const response = await groqProvider.generateResponse(prompt, systemInstruction);
    const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('generateMCQs error:', err);
    throw new Error('Failed to generate MCQs.');
  }
};

/**
 * Generates Flashcards from a given document text.
 */
exports.generateFlashcards = async (documentText, count = 10) => {
  const systemInstruction = `You are an AI Study Companion.
Generate exactly ${count} flashcards (Question/Answer pairs) based on the key concepts of the provided text.
Return the output strictly in the following JSON array format, and nothing else:
[
  {
    "front": "Concept or Question",
    "back": "Definition or Answer"
  }
]`;

  const prompt = `Document Text: ${documentText.slice(0, 15000)}`;

  try {
    const response = await groqProvider.generateResponse(prompt, systemInstruction);
    const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('generateFlashcards error:', err);
    throw new Error('Failed to generate Flashcards.');
  }
};

/**
 * Explains a specific topic or chapter using the document text as context.
 */
exports.explainTopic = async (documentText, topic) => {
  const systemInstruction = `You are an AI Study Companion.
Explain the requested topic using the provided document text as context.
If the document doesn't contain enough info, you can supplement it with general knowledge, but state that you are doing so.
Structure your explanation logically with clear headings and bullet points.`;

  const prompt = `Document Context: ${documentText.slice(0, 15000)}\n\nExplain Topic: ${topic}`;

  try {
    return await groqProvider.generateResponse(prompt, systemInstruction);
  } catch (err) {
    console.error('explainTopic error:', err);
    throw new Error('Failed to explain topic.');
  }
};
