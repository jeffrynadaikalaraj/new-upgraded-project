const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const config = require('../config/env');

/**
 * Transcribe an audio/video file using Groq's Whisper API.
 * @param {string} filePath - Absolute path to the temp file
 * @param {string} originalName - Original filename to pass to the API
 * @returns {Promise<string>} - The transcribed text
 */
exports.transcribeAudio = async (filePath, originalName) => {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath), { filename: originalName || 'audio.mp3' });
  formData.append('model', 'whisper-large-v3');

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${config.GROQ_API_KEY}`,
        ...formData.getHeaders()
      }
    });
    
    return response.data.text;
  } catch (err) {
    console.error('[AudioService] Transcription error:', err?.response?.data || err.message);
    throw new Error('Failed to transcribe audio file.');
  }
};
