import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useChatStore } from '../../stores/chatStore';

// ─── Theme Palettes ────────────────────────────────────────────
const THEMES = {
  female:  { primary: '#ec4899', secondary: '#a855f7', accent: '#f59e0b', glow: 'rgba(236,72,153,0.35)', skin: '#fde1c3', skinShadow: '#f6c49e', hair: '#3a2218', cheek: 'rgba(249,140,160,0.65)', lip: '#e8597a' },
  male:    { primary: '#3b82f6', secondary: '#0ea5e9', accent: '#f59e0b', glow: 'rgba(59,130,246,0.35)', skin: '#f0d0a8', skinShadow: '#dbb88a', hair: '#2c1e10', cheek: 'rgba(220,160,140,0.45)', lip: '#c27a5a' },
  jarvis:  { primary: '#eab308', secondary: '#f97316', accent: '#ef4444', glow: 'rgba(234,179,8,0.4)', skin: '#e8dcc8', skinShadow: '#d4c8a8', hair: '#1a1a2e', cheek: 'rgba(234,179,8,0.2)', lip: '#c49a3c' },
  cyber:   { primary: '#22c55e', secondary: '#14b8a6', accent: '#3b82f6', glow: 'rgba(34,197,94,0.35)', skin: '#c8e6d0', skinShadow: '#a8d4b4', hair: '#0a2018', cheek: 'rgba(34,197,94,0.25)', lip: '#2ea060' },
  minimal: { primary: '#94a3b8', secondary: '#cbd5e1', accent: '#64748b', glow: 'rgba(148,163,184,0.25)', skin: '#e8e0d8', skinShadow: '#d0c8c0', hair: '#404040', cheek: 'rgba(180,160,150,0.35)', lip: '#9a8a7a' },
  anime:   { primary: '#f472b6', secondary: '#60a5fa', accent: '#a78bfa', glow: 'rgba(244,114,182,0.35)', skin: '#fff0e8', skinShadow: '#fcd8c0', hair: '#6030a0', cheek: 'rgba(255,130,180,0.55)', lip: '#e060a0' },
};

// ─── Floating Particles ────────────────────────────────────────
const Particles = React.memo(({ color, state }) => {
  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      dur: 6 + Math.random() * 8,
      delay: Math.random() * 5,
      opacity: 0.15 + Math.random() * 0.3,
    })),
  []);

  const isActive = state === 'thinking' || state === 'speaking' || state === 'excited' || state === 'happy';

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      {particles.map((p) => (
        <motion.circle
          key={p.id}
          cx={`${p.x}%`}
          r={p.size}
          fill={color}
          initial={{ cy: `${p.y}%`, opacity: 0 }}
          animate={{
            cy: [`${p.y}%`, `${p.y - 20 - Math.random() * 30}%`, `${p.y}%`],
            opacity: isActive ? [0, p.opacity * 1.5, 0] : [0, p.opacity, 0],
            scale: isActive ? [1, 1.4, 1] : [1, 1.1, 1],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </svg>
  );
});

// ─── Status Label ──────────────────────────────────────────────
const StatusLabel = ({ state, color }) => {
  const labels = {
    idle: null,
    listening: '👂 Listening...',
    thinking: '💭 Thinking...',
    speaking: '💬 Speaking...',
    happy: '😊 Happy!',
    excited: '🎉 Excited!',
    error: '😵 Confused',
    concerned: '🤔 Hmm...',
  };
  const label = labels[state];
  if (!label) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
    >
      <div
        className="px-5 py-2 rounded-full text-sm font-semibold backdrop-blur-xl border shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${color}18, ${color}08)`,
          borderColor: `${color}40`,
          color: color,
        }}
      >
        {label}
      </div>
    </motion.div>
  );
};

// ─── Main Motion Face ──────────────────────────────────────────
const AIAvatar = ({ size = 'large' }) => {
  const { isStreaming, isThinking, isUserTyping, avatarTheme, avatarEmotion, isSpeakingAudio } = useChatStore();

  // Resolve active state
  let activeState = 'idle';
  if (isThinking) activeState = 'thinking';
  else if (isSpeakingAudio || isStreaming) activeState = 'speaking';
  else if (isUserTyping) activeState = 'listening';
  else if (avatarEmotion && avatarEmotion !== 'neutral') activeState = avatarEmotion;

  const theme = THEMES[avatarTheme] || THEMES.female;
  
  const getThemeShapes = () => {
    switch (avatarTheme) {
      case 'male':
        return {
          head: "M 36 100 A 64 64 0 0 1 164 100 Q 164 145 145 175 Q 125 185 100 185 Q 75 185 55 175 Q 36 145 36 100 Z",
          torso: ["M 5 220 Q 100 120 195 220 Z", "M 5 220 Q 100 115 195 220 Z", "M 5 220 Q 100 120 195 220 Z"],
          hasLashes: false,
          hasNose: true,
          mouthStyle: 'human',
          backHair: null,
          frontHair: (
            <>
              <path d="M 5 50 Q 100 -20 195 50 L 195 90 Q 150 40 100 45 Q 50 40 5 90 Z" fill="url(#hairGrad)" />
              <path d="M 40 45 Q 70 20 100 45" fill={theme.hair} opacity="0.6" />
              <path d="M 95 45 Q 130 20 160 48" fill={theme.hair} opacity="0.5" />
            </>
          ),
          eyeStyle: 'human',
        };
      case 'jarvis':
        return {
          head: "M 60 100 L 75 45 L 125 45 L 140 100 L 115 155 L 85 155 Z",
          torso: ["M 30 220 L 100 140 L 170 220 Z", "M 30 220 L 100 135 L 170 220 Z", "M 30 220 L 100 140 L 170 220 Z"],
          hasLashes: false,
          hasNose: false,
          mouthStyle: 'glow',
          backHair: (
            <motion.g animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: '100px 105px' }}>
              <circle cx="100" cy="105" r="75" fill="none" stroke={theme.primary} strokeWidth="1" strokeDasharray="10 20 50 10" opacity="0.5" />
              <circle cx="100" cy="105" r="85" fill="none" stroke={theme.secondary} strokeWidth="2" strokeDasharray="20 40 10 30" opacity="0.3" />
            </motion.g>
          ),
          frontHair: null,
          eyeStyle: 'visor',
        };
      case 'cyber':
        return {
          head: "M 45 90 L 155 90 L 145 140 L 100 180 L 55 140 Z",
          torso: ["M 10 220 L 40 150 L 160 150 L 190 220 Z", "M 10 220 L 40 145 L 160 145 L 190 220 Z", "M 10 220 L 40 150 L 160 150 L 190 220 Z"],
          hasLashes: false,
          hasNose: true,
          mouthStyle: 'human',
          backHair: null,
          frontHair: (
            <>
              {/* Neon face circuits */}
              <path d="M 55 140 L 70 120 L 90 120" fill="none" stroke={theme.accent} strokeWidth="2" opacity="0.7" />
              <path d="M 145 140 L 130 110 L 110 110" fill="none" stroke={theme.primary} strokeWidth="2" opacity="0.7" />
              <circle cx="90" cy="120" r="2" fill={theme.accent} />
              <circle cx="110" cy="110" r="2" fill={theme.primary} />
              {/* Edgy Spikes */}
              <path d="M 25 90 L 45 30 L 65 70 L 95 20 L 115 60 L 145 10 L 165 60 L 180 90 Z" fill="url(#hairGrad)" />
              <path d="M 45 90 L 75 40 L 105 60 L 145 30 L 165 90 Z" fill={theme.hair} opacity="0.6" />
              <path d="M 25 90 L 45 30 L 65 70 L 95 20 L 115 60 L 145 10 L 165 60 L 180 90 Z" fill="none" stroke={theme.accent} strokeWidth="1" opacity="0.5" />
            </>
          ),
          eyeStyle: 'cyber',
        };
      case 'minimal':
        return {
          head: "M 45 100 A 55 55 0 0 1 155 100 A 55 55 0 0 1 45 100 Z",
          torso: ["M 85 220 L 85 160 L 115 160 L 115 220 Z", "M 85 220 L 85 155 L 115 155 L 115 220 Z", "M 85 220 L 85 160 L 115 160 L 115 220 Z"],
          hasLashes: false,
          hasNose: false,
          mouthStyle: 'dot',
          backHair: null,
          frontHair: (
            <>
              {/* Glossy glass orb shine */}
              <ellipse cx="80" cy="70" rx="30" ry="15" fill="white" opacity="0.4" filter="blur(3px)" transform="rotate(-25 80 70)" />
              <ellipse cx="130" cy="130" rx="20" ry="10" fill="white" opacity="0.15" filter="blur(2px)" transform="rotate(-25 130 130)" />
            </>
          ),
          eyeStyle: 'dot',
        };
      case 'anime':
        return {
          head: "M 35 100 A 65 60 0 0 1 165 100 Q 165 145 130 165 L 100 195 L 70 165 Q 35 145 35 100 Z",
          torso: ["M 35 220 Q 100 140 165 220 Z", "M 35 220 Q 100 135 165 220 Z", "M 35 220 Q 100 140 165 220 Z"],
          hasLashes: true,
          hasNose: true,
          mouthStyle: 'human',
          backHair: (
             <path d="M 0 100 Q -10 160 10 220 L 190 220 Q 210 160 200 100 Z" fill="url(#hairGrad)" />
          ),
          frontHair: (
            <>
              {/* Flowing spiky anime bangs */}
              <path d="M -20 50 Q 100 -60 220 50 L 210 120 Q 160 40 100 50 Q 40 40 -10 120 Z" fill="url(#hairGrad)" />
              <path d="M 10 60 Q 60 -10 110 50" fill={theme.hair} opacity="0.6" stroke={theme.hair} strokeWidth="4" />
              <path d="M 90 50 Q 140 -10 190 60" fill={theme.hair} opacity="0.5" stroke={theme.hair} strokeWidth="4" />
              {/* Hair highlights */}
              <path d="M 20 40 Q 100 10 180 40" fill="none" stroke="white" strokeWidth="6" opacity="0.15" strokeLinecap="round" filter="blur(2px)" />
            </>
          ),
          eyeStyle: 'anime',
        };
      case 'female':
      default:
        return {
          head: "M 42 100 A 58 60 0 0 1 158 100 Q 158 140 135 165 Q 115 178 100 180 Q 85 178 65 165 Q 42 140 42 100 Z",
          torso: ["M 25 220 Q 100 135 175 220 Z", "M 25 220 Q 100 130 175 220 Z", "M 25 220 Q 100 135 175 220 Z"],
          hasLashes: true,
          hasNose: true,
          mouthStyle: 'human',
          backHair: (
            <path d="M 25 100 Q 15 190 40 210 L 160 210 Q 185 190 175 100 Z" fill="url(#hairGrad)" />
          ),
          frontHair: (
            <>
              <path d="M -15 30 Q 100 -30 215 30 L 215 140 Q 150 20 100 25 Q 50 20 -15 140 Z" fill="url(#hairGrad)" />
              <path d="M 25 55 Q 65 15 105 40" fill={theme.hair} opacity="0.6" stroke={theme.hair} strokeWidth="3" />
              <path d="M 95 40 Q 135 15 175 55" fill={theme.hair} opacity="0.5" stroke={theme.hair} strokeWidth="3" />
            </>
          ),
          eyeStyle: 'human',
        };
    }
  };

  const shapes = getThemeShapes();

  // ─── Mouse tracking with spring physics ──────────────────────
  const rawEyeX = useMotionValue(0);
  const rawEyeY = useMotionValue(0);
  const eyeX = useSpring(rawEyeX, { stiffness: 150, damping: 20 });
  const eyeY = useSpring(rawEyeY, { stiffness: 150, damping: 20 });
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handle = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      rawEyeX.set(nx * 6);
      rawEyeY.set(ny * 4);
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, [rawEyeX, rawEyeY]);

  useEffect(() => {
    const unsub1 = eyeX.on('change', (v) => setEyePos((p) => ({ ...p, x: v })));
    const unsub2 = eyeY.on('change', (v) => setEyePos((p) => ({ ...p, y: v })));
    return () => { unsub1(); unsub2(); };
  }, [eyeX, eyeY]);

  // ─── Blinking ────────────────────────────────────────────────
  const [blinkScale, setBlinkScale] = useState(1);
  useEffect(() => {
    let timeoutId;
    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 3000;
      timeoutId = setTimeout(() => {
        setBlinkScale(0.05);
        setTimeout(() => {
          setBlinkScale(1);
          scheduleBlink();
        }, 120);
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(timeoutId);
  }, []);

  // ─── Speaking mouth animation ────────────────────────────────
  const [mouthOpen, setMouthOpen] = useState(0);
  useEffect(() => {
    if (activeState !== 'speaking') { setMouthOpen(0); return; }
    let frame;
    const animate = () => {
      // Rapid randomized mouth movement for realistic lip sync
      setMouthOpen(Math.random() * 0.8 + 0.1);
      frame = requestAnimationFrame(() => {
        setTimeout(() => { frame = requestAnimationFrame(animate); }, 60 + Math.random() * 80);
      });
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [activeState]);

  // ─── Sizing ──────────────────────────────────────────────────
  const isFullPanel = size === 'full';
  const containerClass = isFullPanel
    ? 'w-full h-full'
    : size === 'large'
    ? 'w-40 h-40'
    : size === 'medium'
    ? 'w-20 h-20'
    : 'w-10 h-10';

  // ─── Derived face properties by state ────────────────────────
  const getFaceProps = () => {
    switch (activeState) {
      case 'thinking':
        return {
          headAnim: { y: [0, -3, 0], rotate: [0, 4, -3, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
          browL: -3, browR: 1, mouthW: 6, mouthH: 5, mouthY: 0, mouthX: -3,
          eyeSquint: 0.85, cheekGlow: 0.4,
        };
      case 'speaking':
        return {
          headAnim: { y: [0, -5, -2, -4, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
          browL: 0, browR: 0, mouthW: 5 + mouthOpen * 8, mouthH: 2 + mouthOpen * 10, mouthY: 0, mouthX: 0,
          eyeSquint: 1, cheekGlow: 0.5,
        };
      case 'listening':
        return {
          headAnim: { y: [0, -2, 0], rotate: [0, 3, 3, 0], scale: [1, 1.01, 1], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
          browL: 2, browR: 2, mouthW: 7, mouthH: 2, mouthY: 0, mouthX: 0,
          eyeSquint: 1.1, cheekGlow: 0.35,
        };
      case 'happy':
        return {
          headAnim: { y: [0, -8, 0], rotate: [0, -4, 4, 0], transition: { duration: 0.7, ease: 'easeOut' } },
          browL: 3, browR: 3, mouthW: 12, mouthH: 7, mouthY: -1, mouthX: 0,
          eyeSquint: 0.7, cheekGlow: 0.9,
        };
      case 'excited':
        return {
          headAnim: { y: [0, -14, 0], transition: { duration: 0.5, repeat: 2, ease: 'easeOut' } },
          browL: 5, browR: 5, mouthW: 14, mouthH: 10, mouthY: -2, mouthX: 0,
          eyeSquint: 1.2, cheekGlow: 1,
        };
      case 'error':
        return {
          headAnim: { x: [-3, 3, -3, 3, 0], rotate: [0, -4, 0], transition: { duration: 0.5, ease: 'easeInOut' } },
          browL: -4, browR: -2, mouthW: 6, mouthH: 3, mouthY: 2, mouthX: 0,
          eyeSquint: 0.85, cheekGlow: 0.2,
        };
      case 'concerned':
        return {
          headAnim: { y: [0, -2, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
          browL: -3, browR: 1, mouthW: 7, mouthH: 2, mouthY: 1, mouthX: 0,
          eyeSquint: 0.9, cheekGlow: 0.25,
        };
      default: // idle
        return {
          headAnim: { y: [0, -5, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } },
          browL: 0, browR: 0, mouthW: 8, mouthH: 2, mouthY: 0, mouthX: 0,
          eyeSquint: 1, cheekGlow: 0.5,
        };
    }
  };

  const fp = getFaceProps();

  // Should eyes track? Only when idle or listening
  const eyesTrack = activeState === 'idle' || activeState === 'listening';
  const ex = eyesTrack ? eyePos.x : (activeState === 'thinking' ? 3 : 0);
  const ey = eyesTrack ? eyePos.y : (activeState === 'thinking' ? -3 : 0);
  const finalBlinkScale = (activeState === 'idle' || activeState === 'listening') ? blinkScale : 1;

  // ─── Aura glow color per state ───────────────────────────────
  const auraColor = activeState === 'speaking'
    ? theme.primary
    : activeState === 'thinking'
    ? theme.secondary
    : activeState === 'excited' || activeState === 'happy'
    ? theme.accent
    : activeState === 'error'
    ? '#ef4444'
    : theme.primary;

  const auraIntensity = activeState === 'idle' ? 0.15 : activeState === 'speaking' || activeState === 'excited' ? 0.5 : 0.3;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${containerClass}`}>
      {/* Ambient Background Glow */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          background: `radial-gradient(ellipse at 50% 45%, ${auraColor}${Math.round(auraIntensity * 255).toString(16).padStart(2, '0')} 0%, transparent 65%)`,
        }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />

      {/* Pulsing Aura Ring */}
      <motion.div
        className="absolute z-0 rounded-full"
        style={{
          width: isFullPanel ? '320px' : '85%',
          aspectRatio: '1/1',
          maxWidth: '85vw',
          border: `2px solid ${auraColor}`,
          filter: `blur(1px)`,
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [auraIntensity * 0.4, auraIntensity * 0.8, auraIntensity * 0.4],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute z-0 rounded-full"
        style={{
          width: isFullPanel ? '360px' : '95%',
          aspectRatio: '1/1',
          maxWidth: '95vw',
          border: `1px solid ${auraColor}`,
          filter: `blur(3px)`,
        }}
        animate={{
          scale: [1.05, 1, 1.05],
          opacity: [auraIntensity * 0.2, auraIntensity * 0.5, auraIntensity * 0.2],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />

      {/* Floating Particles */}
      <Particles color={auraColor} state={activeState} />

      {/* Face Container */}
      <motion.div
        className="relative z-10"
        style={{ width: isFullPanel ? '60%' : '100%', maxWidth: isFullPanel ? 320 : undefined }}
        animate={fp.headAnim}
      >
        {/* Breathing idle scale */}
        <motion.div
          animate={
            activeState === 'idle'
              ? { scale: [1, 1.015, 1], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }
              : { scale: 1 }
          }
          className="w-full h-full"
        >
          <svg viewBox="0 0 200 220" className="w-full h-full overflow-visible" style={{ filter: 'drop-shadow(0 8px 30px rgba(0,0,0,0.3))' }}>
            <defs>
              {/* Gradient definitions */}
              <radialGradient id="skinGrad" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor={theme.skin} />
                <stop offset="100%" stopColor={theme.skinShadow} />
              </radialGradient>
              <radialGradient id="cheekGradL" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={theme.cheek} />
                <stop offset="100%" stopColor={theme.cheek} stopOpacity="0" />
              </radialGradient>
              <radialGradient id="cheekGradR" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={theme.cheek} />
                <stop offset="100%" stopColor={theme.cheek} stopOpacity="0" />
              </radialGradient>
              <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.hair} />
                <stop offset="100%" stopColor={theme.hair} stopOpacity="0.85" />
              </linearGradient>
              <clipPath id="headClip">
                <path d={shapes.head} />
              </clipPath>
              {/* Eye shine */}
              <radialGradient id="eyeShine" cx="35%" cy="30%" r="50%">
                <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="torsoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={theme.primary} stopOpacity="0.8" />
                <stop offset="100%" stopColor={theme.secondary} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Drop Shadow Under Head */}
            <ellipse cx="100" cy="185" rx="45" ry="8" fill="rgba(0,0,0,0.08)" />

            {/* Torso / Shoulders with Breathing Animation */}
            <motion.path 
              fill="url(#torsoGrad)" 
              animate={
                activeState === 'idle' 
                  ? { d: shapes.torso } 
                  : { d: shapes.torso[0] }
              }
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Back Hair (Drawn BEHIND head) */}
            {shapes.backHair}

            {/* Ears */}
            <ellipse cx="36" cy="110" rx="12" ry="16" fill={theme.skinShadow} />
            <ellipse cx="36" cy="110" rx="7" ry="10" fill={theme.skin} opacity="0.5" />
            <ellipse cx="164" cy="110" rx="12" ry="16" fill={theme.skinShadow} />
            <ellipse cx="164" cy="110" rx="7" ry="10" fill={theme.skin} opacity="0.5" />

            {/* Head Shape */}
            <path 
              d={shapes.head} 
              fill="url(#skinGrad)" 
            />

            {/* Hair */}
            <g clipPath="url(#headClip)">
              {shapes.frontHair}
            </g>

            {/* Cheeks */}
            <motion.ellipse
              cx="62" cy="122" rx="14" ry="8"
              fill="url(#cheekGradL)"
              animate={{ opacity: fp.cheekGlow }}
              transition={{ duration: 0.5 }}
            />
            <motion.ellipse
              cx="138" cy="122" rx="14" ry="8"
              fill="url(#cheekGradR)"
              animate={{ opacity: fp.cheekGlow }}
              transition={{ duration: 0.5 }}
            />

            {/* ─── Eyes Group ─────────────────────────────────── */}
            <g
              transform={`translate(${ex}, ${ey})`}
              style={{ transition: 'transform 0.1s ease-out' }}
            >
              {['left', 'right'].map((side) => {
                const isLeft = side === 'left';
                const tx = isLeft ? 73 : 127;
                return (
                  <g key={side} transform={`translate(${tx}, 95) scale(1, ${finalBlinkScale * fp.eyeSquint})`}>
                    {shapes.eyeStyle === 'human' && (
                      <>
                        {/* Eye white */}
                        <ellipse cx="0" cy="0" rx="11" ry="10" fill="white" />
                        {/* Iris */}
                        <ellipse cx="0" cy="1" rx="7" ry="7" fill="#2c1810" />
                        {/* Pupil */}
                        <motion.ellipse cx="0" cy="1" rx="4" ry="4" fill="#0a0a0a" animate={activeState === 'excited' ? { ry: [4, 5, 4] } : {}} transition={{ duration: 0.5, repeat: Infinity }} />
                        {/* Shine */}
                        <circle cx="-2" cy="-2" r="2.5" fill="white" opacity="0.9" />
                        <circle cx="2" cy="2" r="1.2" fill="white" opacity="0.5" />
                        {/* Upper eyelid line */}
                        <path d="M -11 -2 Q 0 -12 11 -2" stroke={theme.hair} strokeWidth={shapes.hasLashes ? "2" : "2.5"} fill="none" strokeLinecap="round" />
                        {shapes.hasLashes && (
                          isLeft ? (
                            <>
                              <path d="M -10 -2 Q -15 -8 -18 -6" stroke={theme.hair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                              <path d="M -6 -9 Q -10 -15 -14 -14" stroke={theme.hair} strokeWidth="2" fill="none" strokeLinecap="round" />
                              <path d="M -2 -11 Q -4 -16 -6 -16" stroke={theme.hair} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                            </>
                          ) : (
                            <>
                              <path d="M 10 -2 Q 15 -8 18 -6" stroke={theme.hair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                              <path d="M 6 -9 Q 10 -15 14 -14" stroke={theme.hair} strokeWidth="2" fill="none" strokeLinecap="round" />
                              <path d="M 2 -11 Q 4 -16 6 -16" stroke={theme.hair} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                            </>
                          )
                        )}
                      </>
                    )}
                    {shapes.eyeStyle === 'anime' && (
                      <>
                        <ellipse cx="0" cy="0" rx="14" ry="17" fill="white" />
                        <ellipse cx="0" cy="1" rx="11" ry="14" fill={theme.accent} />
                        {/* Gradient anime pupil */}
                        <motion.ellipse cx="0" cy="2" rx="7" ry="9" fill="#0a0a0a" animate={activeState === 'excited' ? { ry: [9, 11, 9] } : {}} transition={{ duration: 0.5, repeat: Infinity }} />
                        <ellipse cx="0" cy="8" rx="5" ry="3" fill={theme.primary} opacity="0.8" filter="blur(1px)" />
                        {/* Huge Shines */}
                        <circle cx="-5" cy="-6" r="5" fill="white" opacity="0.95" />
                        <circle cx="6" cy="6" r="2.5" fill="white" opacity="0.8" />
                        {/* Thick Eyeliner */}
                        <path d="M -15 -4 Q 0 -22 15 -4" stroke={theme.hair} strokeWidth="4" fill="none" strokeLinecap="round" />
                        <path d="M -15 -4 L -18 -2" stroke={theme.hair} strokeWidth="3" fill="none" strokeLinecap="round" />
                        <path d="M 15 -4 L 18 -2" stroke={theme.hair} strokeWidth="3" fill="none" strokeLinecap="round" />
                        {/* Lashes */}
                        {isLeft ? (
                          <>
                            <path d="M -13 -4 Q -20 -10 -24 -6" stroke={theme.hair} strokeWidth="3.5" fill="none" strokeLinecap="round" />
                            <path d="M -9 -11 Q -15 -18 -18 -16" stroke={theme.hair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                          </>
                        ) : (
                          <>
                            <path d="M 13 -4 Q 20 -10 24 -6" stroke={theme.hair} strokeWidth="3.5" fill="none" strokeLinecap="round" />
                            <path d="M 9 -11 Q 15 -18 18 -16" stroke={theme.hair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                          </>
                        )}
                      </>
                    )}
                    {shapes.eyeStyle === 'visor' && (
                      <>
                         {/* Visor glowing frame */}
                         <rect x="-18" y="-6" width="36" height="12" rx="3" fill="none" stroke={theme.primary} strokeWidth="2" opacity="0.9" />
                         <rect x="-15" y="-4" width="30" height="8" rx="2" fill={theme.accent} opacity="0.8" filter="blur(2px)" />
                         <rect x="-15" y="-4" width="30" height="8" rx="2" fill={theme.accent} opacity="0.9" />
                         {/* Cylon/Knight Rider moving eye element */}
                         <motion.rect 
                           x="-10" y="-2" width="12" height="4" rx="1" fill="white" 
                           animate={{ x: [-8, 8, -8], opacity: activeState === 'speaking' ? [0.6, 1, 0.6] : 0.9 }} 
                           transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} 
                         />
                      </>
                    )}
                    {shapes.eyeStyle === 'cyber' && (
                      isLeft ? (
                        <>
                          <ellipse cx="0" cy="0" rx="11" ry="10" fill="#111" />
                          <ellipse cx="0" cy="0" rx="4" ry="4" fill={theme.accent} />
                          <circle cx="0" cy="0" r="1.5" fill="white" />
                          <path d="M -15 -10 L 15 -10 L 10 10 L -10 10 Z" stroke={theme.accent} strokeWidth="1" fill="none" />
                        </>
                      ) : (
                        <>
                          <ellipse cx="0" cy="0" rx="11" ry="10" fill="white" />
                          <ellipse cx="0" cy="1" rx="7" ry="7" fill={theme.secondary} />
                          <motion.ellipse cx="0" cy="1" rx="4" ry="4" fill="#0a0a0a" animate={activeState === 'excited' ? { ry: [4, 5, 4] } : {}} transition={{ duration: 0.5, repeat: Infinity }} />
                          <circle cx="-2" cy="-2" r="2.5" fill="white" opacity="0.9" />
                          <path d="M -11 -2 Q 0 -12 11 -2" stroke={theme.hair} strokeWidth="2" fill="none" strokeLinecap="round" />
                        </>
                      )
                    )}
                    {shapes.eyeStyle === 'dot' && (
                      <circle cx="0" cy="0" r="6" fill={theme.hair} />
                    )}
                  </g>
                );
              })}

              {/* Eyebrows */}
              {shapes.eyeStyle !== 'visor' && shapes.eyeStyle !== 'dot' && (
                <>
                  <motion.path
                    d={`M 58 ${80 - fp.browL} Q 73 ${72 - fp.browL} 88 ${80 - fp.browL}`}
                    stroke={theme.hair}
                    strokeWidth={shapes.hasLashes ? "3" : "4.5"}
                    fill="none"
                    strokeLinecap="round"
                    animate={{ d: `M 58 ${80 - fp.browL} Q 73 ${72 - fp.browL} 88 ${80 - fp.browL}` }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.path
                    d={`M 112 ${80 - fp.browR} Q 127 ${72 - fp.browR} 142 ${80 - fp.browR}`}
                    stroke={theme.hair}
                    strokeWidth={shapes.hasLashes ? "3" : "4.5"}
                    fill="none"
                    strokeLinecap="round"
                    animate={{ d: `M 112 ${80 - fp.browR} Q 127 ${72 - fp.browR} 142 ${80 - fp.browR}` }}
                    transition={{ duration: 0.3 }}
                  />
                </>
              )}
            </g>

            {/* Nose */}
            {shapes.hasNose && (
              <path d="M 97 112 Q 100 118 103 112" stroke={theme.skinShadow} strokeWidth="2" fill="none" strokeLinecap="round" />
            )}

            {/* ─── Mouth ──────────────────────────────────────── */}
            <motion.g
              animate={{ x: fp.mouthX, y: fp.mouthY }}
              transition={{ duration: 0.2 }}
            >
              {/* Mouth shape based on style */}
              {shapes.mouthStyle === 'human' && (
                fp.mouthH > 3 ? (
                  <>
                    <motion.ellipse
                      cx="100"
                      cy="135"
                      fill={theme.lip}
                      animate={{ rx: fp.mouthW, ry: fp.mouthH }}
                      transition={{ duration: activeState === 'speaking' ? 0.08 : 0.3 }}
                    />
                    {/* Teeth hint when mouth is very open */}
                    {fp.mouthH > 6 && (
                      <motion.rect
                        x={100 - fp.mouthW * 0.6}
                        y="130"
                        rx="2"
                        fill="white"
                        opacity="0.85"
                        animate={{ width: fp.mouthW * 1.2, height: Math.min(fp.mouthH * 0.4, 5) }}
                        transition={{ duration: 0.15 }}
                      />
                    )}
                  </>
                ) : (
                  <motion.path
                    d={`M ${100 - fp.mouthW} 135 Q 100 ${135 + fp.mouthH + 2} ${100 + fp.mouthW} 135`}
                    stroke={theme.lip}
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    animate={{
                      d: `M ${100 - fp.mouthW} 135 Q 100 ${135 + fp.mouthH + 2} ${100 + fp.mouthW} 135`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                )
              )}
              {shapes.mouthStyle === 'glow' && (
                <motion.rect
                   x={100 - fp.mouthW} y="133" rx="2" fill={theme.accent}
                   animate={{ width: fp.mouthW * 2, height: Math.max(2, fp.mouthH), opacity: activeState === 'speaking' ? [0.6, 1, 0.6] : 0.8 }}
                   transition={{ duration: activeState === 'speaking' ? 0.1 : 0.3, repeat: activeState === 'speaking' ? Infinity : 0 }}
                />
              )}
              {shapes.mouthStyle === 'dot' && (
                <circle cx="100" cy="135" r={Math.max(2, fp.mouthH)} fill={theme.hair} />
              )}
            </motion.g>

            {/* Thinking swirl */}
            {activeState === 'thinking' && (
              <motion.g
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                transition={{ rotate: { duration: 6, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.5 } }}
                style={{ transformOrigin: '165px 55px' }}
              >
                <circle cx="165" cy="55" r="6" fill="none" stroke={theme.secondary} strokeWidth="1.5" strokeDasharray="4 3" />
                <circle cx="175" cy="45" r="3" fill={theme.secondary} opacity="0.5" />
                <circle cx="158" cy="42" r="2" fill={theme.primary} opacity="0.4" />
              </motion.g>
            )}

            {/* Sparkle effects for happy/excited */}
            {(activeState === 'happy' || activeState === 'excited') && (
              <motion.g
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                {[
                  [45, 60], [155, 55], [30, 100], [170, 95],
                  [50, 45], [150, 42], [100, 35],
                ].map(([cx, cy], i) => (
                  <motion.g
                    key={i}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: 'easeInOut',
                    }}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  >
                    <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" />
                    <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" />
                  </motion.g>
                ))}
              </motion.g>
            )}

            {/* Error X-marks on eyes */}
            {activeState === 'error' && (
              <motion.g
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1], scale: [0.5, 1] }}
                transition={{ duration: 0.3 }}
              >
                <line x1="155" y1="52" x2="165" y2="62" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="165" y1="52" x2="155" y2="62" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
              </motion.g>
            )}
          </svg>
        </motion.div>
      </motion.div>

      {/* Status Label */}
      <AnimatePresence mode="wait">
        <StatusLabel key={activeState} state={activeState} color={theme.primary} />
      </AnimatePresence>
    </div>
  );
};

export default AIAvatar;
