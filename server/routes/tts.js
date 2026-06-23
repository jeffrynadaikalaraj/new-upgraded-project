const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');

// Add specific rate limiting if needed, but we'll use apiLimiter in app.js
router.post('/', protect, async (req, res) => {
  try {
    const { text, theme } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      // Fallback gracefully: instruct frontend to use browser TTS
      return res.status(200).json({ success: true, useBrowserTTS: true });
    }

    // Assign voice IDs based on theme
    // Replace these with actual high-quality ElevenLabs voice IDs
    // Default Male (e.g., Antony/Josh) and Female (e.g., Rachel/Bella)
    let voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Default Bella (Female)
    
    if (theme === 'male' || theme === 'jarvis') {
      voiceId = 'pNInz6obpgDQGcFmaJgB'; // Default Adam (Male)
    } else if (theme === 'anime') {
      voiceId = 'LcfcDJNUP1GQjkzn1xUU'; // Emily (Younger female)
    }

    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
    
    const response = await axios.post(elevenLabsUrl, {
      text: text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    }, {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      responseType: 'arraybuffer' // We need binary data for the audio file
    });

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': response.data.length
    });
    
    return res.status(200).send(response.data);

  } catch (error) {
    console.error('TTS Error:', error?.response?.data || error.message);
    // Even on error, tell frontend to fallback rather than breaking chat
    res.status(200).json({ success: true, useBrowserTTS: true, message: 'ElevenLabs failed' });
  }
});

module.exports = router;
