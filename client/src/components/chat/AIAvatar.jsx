import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../stores/chatStore';

const AIAvatar = ({ size = 'large' }) => {
  const { isStreaming, isThinking, isUserTyping, avatarTheme, avatarEmotion } = useChatStore();

  // Determine actual state based on priorities
  let activeState = 'idle';
  if (isThinking) activeState = 'thinking';
  else if (isStreaming) activeState = 'speaking';
  else if (isUserTyping) activeState = 'listening';
  else if (avatarEmotion === 'happy' || avatarEmotion === 'error' || avatarEmotion === 'excited') activeState = avatarEmotion;
  else if (avatarEmotion !== 'neutral') activeState = avatarEmotion;

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [blinkScale, setBlinkScale] = useState(1);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate normalized mouse position relative to center of screen (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      
      // Map to small movement ranges for the eyes (e.g. -4 to 4 pixels)
      setMousePos({ x: x * 4, y: y * 4 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Random blinking
    const blinkInterval = setInterval(() => {
      setBlinkScale(0.1);
      setTimeout(() => setBlinkScale(1), 150);
    }, 3000 + Math.random() * 2000); // Blink every 3-5 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  // Sizing
  const dimensions = {
    small: { width: 40, height: 40, bubbleScale: 0.6, bubbleOffset: -10 },
    medium: { width: 80, height: 80, bubbleScale: 0.8, bubbleOffset: -5 },
    large: { width: 160, height: 160, bubbleScale: 1, bubbleOffset: 0 },
  };
  const { width, height, bubbleScale, bubbleOffset } = dimensions[size] || dimensions.large;

  // Colors based on the cute reference image
  const skinBase = "#fde1c3";
  const skinShadow = "#f6c49e";
  const cheekColor = "rgba(249, 168, 168, 0.7)";
  const featureColor = "#3a2e2e";
  
  // Theme accents (we can color the confetti based on theme, keeping the face neutral)
  const themes = {
    female: ['#ec4899', '#8b5cf6', '#f59e0b'],
    male: ['#3b82f6', '#0ea5e9', '#f59e0b'],
    jarvis: ['#eab308', '#f97316', '#ef4444'],
    cyber: ['#22c55e', '#14b8a6', '#3b82f6'],
    minimal: ['#94a3b8', '#cbd5e1', '#64748b'],
    anime: ['#f472b6', '#60a5fa', '#a78bfa']
  };
  const themeColors = themes[avatarTheme] || themes.female;

  // Animations
  const headVariants = {
    idle: { y: [0, -4, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } },
    thinking: { y: [0, -2, 0], rotate: [0, 3, -2, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
    speaking: { y: [0, -6, -2, -5, 0], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } },
    happy: { y: [0, -10, 0], rotate: [0, -5, 5, 0], transition: { duration: 0.6, ease: "easeOut" } },
    concerned: { x: [-3, 3, -3, 3, 0], transition: { duration: 0.5, ease: "easeInOut" } },
    listening: { y: [0, -2, 0], rotate: [0, 4, 4, 0], scale: [1, 1.02, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
    excited: { y: [0, -15, 0], transition: { duration: 0.4, repeat: 2, ease: "easeOut" } },
    error: { rotate: [0, -5, 0], x: [-2, 2, -2, 2, 0], transition: { duration: 0.5, ease: "easeInOut" } }
  };

  const mouthVariants = {
    idle: { rx: 6, ry: 1, y: 65, fill: featureColor },
    speaking: { 
      rx: [4, 6, 5, 7, 4], 
      ry: [2, 6, 3, 7, 2], 
      y: 65, 
      fill: featureColor,
      transition: { duration: 0.8, repeat: Infinity } 
    },
    thinking: { rx: 3, ry: 3, y: 63, x: -4, fill: featureColor },
    happy: { rx: 10, ry: 6, y: 64, fill: featureColor },
    concerned: { rx: 5, ry: 1, y: 67, fill: featureColor },
    listening: { rx: 4, ry: 2, y: 65, fill: featureColor },
    excited: { rx: 12, ry: 8, y: 63, fill: featureColor },
    error: { rx: 5, ry: 2, y: 67, rotate: -10, fill: featureColor }
  };

  const eyeVariants = {
    idle: { scaleY: 1, y: 0 },
    speaking: { scaleY: [1, 0.1, 1, 1], transition: { duration: 3, repeat: Infinity, times: [0, 0.05, 0.1, 1] } },
    thinking: { x: [-2, 2, -2], y: -4, transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
    happy: { scaleY: 1, y: -2 },
    concerned: { scaleY: 0.8, y: 2 },
    listening: { scaleY: 1.1, y: -1 },
    excited: { scaleY: 1.2, y: -3 },
    error: { scaleY: 0.9, y: 1 }
  };

  const decorationVariants = {
    idle: { opacity: 0, scale: 0.8, rotate: 0 },
    thinking: { opacity: 1, scale: 1, rotate: 180, transition: { duration: 8, repeat: Infinity, ease: "linear" } },
    speaking: { opacity: 0.6, scale: [0.9, 1.1, 0.9], transition: { duration: 2, repeat: Infinity } },
    happy: { opacity: 1, scale: [0.5, 1.2, 1], rotate: [0, 15, 0], transition: { duration: 0.6 } },
    concerned: { opacity: 0 },
    listening: { opacity: 0.3, scale: [0.9, 1, 0.9], transition: { duration: 2, repeat: Infinity } },
    excited: { opacity: 1, scale: [0.8, 1.3, 1], rotate: [0, 30, 0], transition: { duration: 0.4, repeat: 2 } },
    error: { opacity: 0 }
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width, height }}>
      <motion.div
        variants={headVariants}
        animate={activeState}
        className="w-full h-full relative"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          {/* Shadow */}
          <ellipse cx="50" cy="95" rx="30" ry="6" fill="rgba(0,0,0,0.06)" />

          {/* Sparkles / Confetti */}
          <motion.g variants={decorationVariants} animate={activeState} className="origin-center">
            <line x1="50" y1="12" x2="50" y2="2" stroke={themeColors[2]} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="28" y1="20" x2="20" y2="12" stroke={themeColors[2]} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="72" y1="20" x2="80" y2="12" stroke={themeColors[2]} strokeWidth="2.5" strokeLinecap="round" />
            
            <rect x="35" y="8" width="5" height="5" fill={themeColors[0]} transform="rotate(15 37 10)" />
            <rect x="62" y="5" width="4" height="4" fill={themeColors[1]} transform="rotate(45 64 7)" />
            <rect x="82" y="25" width="4" height="4" fill={themeColors[0]} transform="rotate(30 84 27)" />
            <rect x="14" y="25" width="5" height="5" fill={themeColors[1]} transform="rotate(60 16 27)" />
          </motion.g>

          {/* Ears */}
          <circle cx="18" cy="55" r="8" fill={skinShadow} />
          <circle cx="82" cy="55" r="8" fill={skinShadow} />

          {/* Head Base */}
          <circle cx="50" cy="50" r="32" fill={skinBase} />

          {/* Hair (clipped to head shape at the top, extending down the sides) */}
          <g clipPath="url(#head-clip)">
            <path d="M 0 0 L 100 0 L 100 55 C 80 35, 20 35, 0 55 Z" fill={featureColor} />
          </g>
          
          <defs>
            <clipPath id="head-clip">
              <circle cx="50" cy="50" r="32" />
            </clipPath>
          </defs>

          {/* Cheeks */}
          <ellipse cx="32" cy="58" rx="6" ry="3" fill={cheekColor} />
          <ellipse cx="68" cy="58" rx="6" ry="3" fill={cheekColor} />

          {/* Eyes Tracking Group */}
          <motion.g
            animate={{ 
              x: activeState === 'idle' || activeState === 'listening' ? mousePos.x : 0, 
              y: activeState === 'idle' || activeState === 'listening' ? mousePos.y : 0,
              scaleY: activeState === 'idle' || activeState === 'listening' ? blinkScale : 1 
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="origin-center"
          >
            {/* Eyes (Cute Arches) */}
            <motion.g variants={eyeVariants} animate={activeState}>
              <path d="M 28 46 Q 32 38 36 46" stroke={featureColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
              {activeState === 'error' ? (
                <path d="M 64 42 Q 68 36 72 42" stroke={featureColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
              ) : (
                <path d="M 64 46 Q 68 38 72 46" stroke={featureColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
              )}
            </motion.g>
          </motion.g>

          {/* Mouth */}
          <motion.ellipse 
            cx="50" cy="0" 
            variants={mouthVariants} 
            animate={activeState} 
          />
        </svg>

        {/* Floating Chat Bubbles based on state */}
        <AnimatePresence>
          {activeState === 'happy' && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0 }}
              animate={{ opacity: 1, y: 0, scale: bubbleScale }}
              exit={{ opacity: 0, scale: 0 }}
              style={{ bottom: bubbleOffset, right: bubbleOffset - 20 }}
              className="absolute bg-gradient-to-r from-orange-50 to-rose-50 text-orange-800 text-[11px] font-bold px-3 py-1.5 rounded-2xl shadow-lg border border-orange-200/50 whitespace-nowrap z-20 origin-bottom-left"
            >
              Nice! 😋
              <div className="absolute -bottom-1 left-4 w-2 h-2 bg-rose-50 rotate-45 border-r border-b border-orange-200/50"></div>
            </motion.div>
          )}

          {activeState === 'excited' && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0 }}
              animate={{ opacity: 1, y: 0, scale: bubbleScale }}
              exit={{ opacity: 0, scale: 0 }}
              style={{ bottom: bubbleOffset, right: bubbleOffset - 20 }}
              className="absolute bg-gradient-to-r from-purple-50 to-pink-50 text-purple-800 text-[11px] font-bold px-3 py-1.5 rounded-2xl shadow-lg border border-purple-200/50 whitespace-nowrap z-20 origin-bottom-left"
            >
              Wow! ✨
              <div className="absolute -bottom-1 left-4 w-2 h-2 bg-pink-50 rotate-45 border-r border-b border-purple-200/50"></div>
            </motion.div>
          )}

          {activeState === 'thinking' && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0 }}
              animate={{ opacity: 1, y: 0, scale: bubbleScale }}
              exit={{ opacity: 0, scale: 0 }}
              style={{ bottom: bubbleOffset, right: bubbleOffset - 10 }}
              className="absolute bg-white text-slate-600 text-[12px] font-bold px-3 py-2 rounded-2xl shadow-lg border border-slate-200 z-20 origin-bottom-left"
            >
              <span className="flex gap-1 items-center h-2">
                <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full"/>
                <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full"/>
                <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full"/>
              </span>
              <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white rotate-45 border-r border-b border-slate-200"></div>
            </motion.div>
          )}

          {activeState === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0 }}
              animate={{ opacity: 1, y: 0, scale: bubbleScale }}
              exit={{ opacity: 0, scale: 0 }}
              style={{ bottom: bubbleOffset, right: bubbleOffset - 10 }}
              className="absolute bg-red-50 text-red-600 text-[14px] font-bold px-3 py-1.5 rounded-2xl shadow-lg border border-red-200 z-20 origin-bottom-left"
            >
              ?
              <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-50 rotate-45 border-r border-b border-red-200"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AIAvatar;
