const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');

// ─── ElevenLabs Voice Configuration per AI Theme ──────────────────────────────
// Each theme maps to a distinct voice with tailored settings for personality.
const VOICE_CONFIG = {
  male: {
    voiceId: 'pNInz6obpgDQGcFmaJgB',   // Adam – Deep, bold, authoritative male
    model: 'eleven_multilingual_v2',
    stability: 0.6,
    similarity_boost: 0.85,
    style: 0.3,
    use_speaker_boost: true,
  },
  female: {
    voiceId: '21m00Tcm4TlvDq8ikWAM',   // Rachel – Warm, clear, confident female
    model: 'eleven_multilingual_v2',
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.35,
    use_speaker_boost: true,
  },
  jarvis: {
    voiceId: 'onwK4e9ZLuTAKqWW03F9',   // Daniel – British-accented male, calm & calculated
    model: 'eleven_multilingual_v2',
    stability: 0.75,             // High stability for precise, controlled delivery
    similarity_boost: 0.9,
    style: 0.15,                 // Minimal expressiveness for AI assistant feel
    use_speaker_boost: true,
  },
  cyber: {
    voiceId: '2EiwWnXFnvU5JabPnv8n',   // Clyde – Gritty, deep, robotic-edged male
    model: 'eleven_multilingual_v2',
    stability: 0.85,             // Very high stability for robotic precision
    similarity_boost: 0.95,
    style: 0.05,                 // Near-zero expression for cold robotic feel
    use_speaker_boost: false,    // No boost keeps it flatter/more synthetic
  },
  minimal: {
    voiceId: 'ErXwobaYiN019PkySvjV',   // Antoni – Calm, neutral, clean
    model: 'eleven_multilingual_v2',
    stability: 0.7,
    similarity_boost: 0.7,
    style: 0.1,                  // Minimal emotional expression
    use_speaker_boost: false,
  },
  anime: {
    voiceId: 'LcfcDJNUP1GQjkzn1xUU',   // Emily – Young, energetic, expressive female
    model: 'eleven_multilingual_v2',
    stability: 0.3,              // Low stability for lively, expressive delivery
    similarity_boost: 0.65,
    style: 0.8,                  // High expressiveness for animated personality
    use_speaker_boost: true,
  },
};

const DEFAULT_CONFIG = VOICE_CONFIG.female;

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

    // Get theme-specific voice configuration
    const config = VOICE_CONFIG[theme] || DEFAULT_CONFIG;

    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}?output_format=mp3_44100_128`;
    
    const response = await axios.post(elevenLabsUrl, {
      text: text,
      model_id: config.model,
      voice_settings: {
        stability: config.stability,
        similarity_boost: config.similarity_boost,
        style: config.style || 0,
        use_speaker_boost: config.use_speaker_boost !== false,
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
