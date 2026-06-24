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
    stability: 0.55,
    similarity_boost: 0.85,
    style: 0.4,                  // Very expressive and confident
    use_speaker_boost: true,
  },
  female: {
    voiceId: '21m00Tcm4TlvDq8ikWAM',   // Rachel – Warm, clear, confident female
    model: 'eleven_multilingual_v2',
    stability: 0.50,
    similarity_boost: 0.85,
    style: 0.45,                 // High warmth and expression
    use_speaker_boost: true,
  },
  jarvis: {
    voiceId: 'onwK4e9ZLuTAKqWW03F9',   // Daniel – British-accented male, calm & calculated
    model: 'eleven_multilingual_v2',
    stability: 0.85,             // High stability for precise, controlled, formal delivery
    similarity_boost: 0.95,
    style: 0.10,                 // Very low expression for that cool, professional AI assistant feel
    use_speaker_boost: true,
  },
  cyber: {
    voiceId: '2EiwWnXFnvU5JabPnv8n',   // Clyde – Gritty, deep, robotic-edged male
    model: 'eleven_multilingual_v2',
    stability: 0.95,             // Extreme stability forces a highly mechanical, unvarying delivery
    similarity_boost: 1.0,       // Absolute fidelity to the gritty source voice
    style: 0.0,                  // Zero emotion/style, pure cold robotic synthesis
    use_speaker_boost: false,    // Disabling boost keeps the voice flatter and more synthetic
  },
  minimal: {
    voiceId: 'ErXwobaYiN019PkySvjV',   // Antoni – Calm, neutral, clean
    model: 'eleven_multilingual_v2',
    stability: 0.75,
    similarity_boost: 0.80,
    style: 0.2,                  // Very subdued emotional expression
    use_speaker_boost: false,
  },
  anime: {
    voiceId: 'EXAVITQu4vr4xnSDxMaL',   // Bella – High-pitched, enthusiastic, sweet
    model: 'eleven_multilingual_v2',
    stability: 0.35,             // Low stability for lively, highly dynamic pitch changes
    similarity_boost: 0.70,
    style: 0.85,                 // Maximum expressiveness for animated, theatrical personality
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
