/**
 * Premium UI Sound Effects using Web Audio API
 * Synthesizes soft, elegant "glassy" sounds to match the glassmorphism UI.
 */

class SoundEffects {
  constructor() {
    this.audioCtx = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  // Soft pop for sending a message
  playSendMsg() {
    if (!this.audioCtx) this.init();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    
    // Quick pitch drop for a "pop"
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);

    // ADSR Volume envelope
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Gentle chime for receiving a message
  playReceiveMsg() {
    if (!this.audioCtx) this.init();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    
    // Higher pitch, rising slightly
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.linearRampToValueAtTime(900, t + 0.1);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  // Ambient backing tracks during speech based on theme
  playSpeechAmbience(theme) {
    if (!this.audioCtx) this.init();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.stopSpeechAmbience();

    const t = this.audioCtx.currentTime;
    this.ambienceOsc = this.audioCtx.createOscillator();
    this.ambienceGain = this.audioCtx.createGain();

    if (theme === 'jarvis' || theme === 'cyber') {
      // Deep robotic drone
      this.ambienceOsc.type = 'sawtooth';
      this.ambienceOsc.frequency.setValueAtTime(50, t); // Low drone
      
      // LFO for data-processing warble effect
      const lfo = this.audioCtx.createOscillator();
      lfo.frequency.value = theme === 'cyber' ? 15 : 8; // Faster warble for cyber
      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.value = 10;
      lfo.connect(lfoGain);
      lfoGain.connect(this.ambienceOsc.frequency);
      lfo.start(t);
      this.ambienceLfo = lfo;

      this.ambienceGain.gain.setValueAtTime(0, t);
      this.ambienceGain.gain.linearRampToValueAtTime(0.03, t + 0.5); // Very quiet, just felt
    } else if (theme === 'anime') {
      // High pitched magical hum
      this.ambienceOsc.type = 'sine';
      this.ambienceOsc.frequency.setValueAtTime(600, t);
      
      const lfo = this.audioCtx.createOscillator();
      lfo.frequency.value = 4; // Magic vibrato
      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.value = 50;
      lfo.connect(lfoGain);
      lfoGain.connect(this.ambienceOsc.frequency);
      lfo.start(t);
      this.ambienceLfo = lfo;

      this.ambienceGain.gain.setValueAtTime(0, t);
      this.ambienceGain.gain.linearRampToValueAtTime(0.015, t + 0.5);
    } else if (theme === 'male') {
      // Deep warm bass undertone — reinforces bold masculine voice
      this.ambienceOsc.type = 'sine';
      this.ambienceOsc.frequency.setValueAtTime(60, t); // Deep bass hum

      this.ambienceGain.gain.setValueAtTime(0, t);
      this.ambienceGain.gain.linearRampToValueAtTime(0.018, t + 0.4);
    } else if (theme === 'female') {
      // Soft warm harmonic — subtle feminine warmth
      this.ambienceOsc.type = 'sine';
      this.ambienceOsc.frequency.setValueAtTime(220, t); // Warm mid-range

      const lfo = this.audioCtx.createOscillator();
      lfo.frequency.value = 2; // Very gentle vibrato
      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.value = 15;
      lfo.connect(lfoGain);
      lfoGain.connect(this.ambienceOsc.frequency);
      lfo.start(t);
      this.ambienceLfo = lfo;

      this.ambienceGain.gain.setValueAtTime(0, t);
      this.ambienceGain.gain.linearRampToValueAtTime(0.012, t + 0.5);
    } else {
      // No ambience for minimal or unknown
      return;
    }

    this.ambienceOsc.connect(this.ambienceGain);
    this.ambienceGain.connect(this.audioCtx.destination);
    this.ambienceOsc.start(t);
  }

  stopSpeechAmbience() {
    if (this.ambienceGain && this.audioCtx) {
      const t = this.audioCtx.currentTime;
      this.ambienceGain.gain.cancelScheduledValues(t);
      this.ambienceGain.gain.setValueAtTime(this.ambienceGain.gain.value, t);
      this.ambienceGain.gain.linearRampToValueAtTime(0, t + 0.3);
      
      if (this.ambienceOsc) {
        this.ambienceOsc.stop(t + 0.3);
      }
      if (this.ambienceLfo) {
        this.ambienceLfo.stop(t + 0.3);
      }
      this.ambienceGain = null;
      this.ambienceOsc = null;
      this.ambienceLfo = null;
    }
  }
}

export const sfx = new SoundEffects();
