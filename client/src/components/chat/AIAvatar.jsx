import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../stores/chatStore';

const AIAvatar = ({ size = 'large' }) => {
  const { isStreaming, isUserTyping, avatarTheme, avatarEmotion } = useChatStore();

  // Determine actual state based on priorities
  let activeState = 'idle';
  if (isStreaming) activeState = 'speaking';
  else if (isUserTyping) activeState = 'thinking';
  else if (avatarEmotion !== 'neutral') activeState = avatarEmotion;

  // Theme Configurations
  const themes = {
    female: {
      primary: '#ec4899', // pink-500
      secondary: '#8b5cf6', // violet-500
      glow: 'rgba(236, 72, 153, 0.5)',
      shape: '50%',
    },
    male: {
      primary: '#3b82f6', // blue-500
      secondary: '#0ea5e9', // sky-500
      glow: 'rgba(59, 130, 246, 0.5)',
      shape: '50%',
    },
    jarvis: {
      primary: '#eab308', // yellow-500
      secondary: '#f97316', // orange-500
      glow: 'rgba(234, 179, 8, 0.5)',
      shape: '10%', // slightly square
    },
    cyber: {
      primary: '#22c55e', // green-500
      secondary: '#14b8a6', // teal-500
      glow: 'rgba(34, 197, 94, 0.5)',
      shape: '30%',
    },
    minimal: {
      primary: '#f8fafc', // slate-50
      secondary: '#cbd5e1', // slate-300
      glow: 'rgba(248, 250, 252, 0.3)',
      shape: '50%',
    },
    anime: {
      primary: '#f472b6', // pink-400
      secondary: '#60a5fa', // blue-400
      glow: 'rgba(244, 114, 182, 0.5)',
      shape: '50%',
    }
  };

  const currentTheme = themes[avatarTheme] || themes.female;

  // Sizing
  const dimensions = {
    small: { width: 40, height: 40 },
    medium: { width: 80, height: 80 },
    large: { width: 160, height: 160 },
  };
  const { width, height } = dimensions[size] || dimensions.large;

  // Animation Variants
  const containerVariants = {
    idle: {
      y: [0, -10, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    },
    thinking: {
      y: [0, -5, 0],
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    speaking: {
      scale: [1, 1.1, 1, 1.05, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },
    happy: {
      y: [0, -20, 0],
      rotate: [0, 10, -10, 0],
      transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
    },
    concerned: {
      x: [-5, 5, -5, 5, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const ringVariants = {
    idle: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.1, 0.3],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    },
    thinking: {
      scale: [1, 1.5, 1],
      opacity: [0.5, 0, 0.5],
      rotate: [0, 180, 360],
      transition: { duration: 3, repeat: Infinity, ease: "linear" }
    },
    speaking: {
      scale: [1, 1.4, 1.1, 1.3, 1],
      opacity: [0.6, 0.2, 0.5, 0.3, 0.6],
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const eyeVariants = {
    idle: { scaleY: [1, 0.1, 1], transition: { duration: 0.2, repeat: Infinity, repeatDelay: 4 } },
    thinking: { x: [-5, 5, -5], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
    speaking: { scaleY: 1, transition: { duration: 0.2 } },
    happy: { scaleY: 0.2, borderRadius: "50% 50% 0 0", transition: { duration: 0.3 } },
    concerned: { scaleY: 1, rotate: [0, 10, -10, 0], transition: { duration: 2, repeat: Infinity } }
  };

  const mouthVariants = {
    idle: { width: '10px', height: '2px', borderRadius: '2px' },
    thinking: { width: '8px', height: '8px', borderRadius: '50%' },
    speaking: { 
      width: ['10px', '20px', '15px', '25px', '10px'], 
      height: ['2px', '12px', '4px', '15px', '2px'],
      borderRadius: '10px',
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },
    happy: { width: '24px', height: '10px', borderRadius: '0 0 12px 12px' },
    concerned: { width: '16px', height: '4px', borderRadius: '4px 4px 0 0' }
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: width + 40, height: height + 40 }}>
      {/* Outer Glow / Aura */}
      <motion.div
        variants={ringVariants}
        animate={activeState}
        className="absolute inset-0"
        style={{
          borderRadius: currentTheme.shape,
          background: `radial-gradient(circle, ${currentTheme.glow} 0%, transparent 70%)`,
          filter: 'blur(10px)',
        }}
      />

      {/* Main Avatar Orb */}
      <motion.div
        variants={containerVariants}
        animate={activeState}
        className="relative flex flex-col items-center justify-center overflow-hidden shadow-2xl"
        style={{
          width,
          height,
          borderRadius: currentTheme.shape,
          background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
          boxShadow: `0 0 20px ${currentTheme.glow}, inset 0 0 20px rgba(255,255,255,0.2)`,
        }}
      >
        {/* Face Container */}
        <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
          {/* Eyes */}
          <div className="flex gap-4 mb-2">
            <motion.div
              variants={eyeVariants}
              animate={activeState}
              className="w-3 h-3 bg-white/90"
              style={{ borderRadius: '50%', boxShadow: '0 0 10px rgba(255,255,255,0.5)' }}
            />
            <motion.div
              variants={eyeVariants}
              animate={activeState}
              className="w-3 h-3 bg-white/90"
              style={{ borderRadius: '50%', boxShadow: '0 0 10px rgba(255,255,255,0.5)' }}
            />
          </div>
          
          {/* Mouth */}
          <motion.div
            variants={mouthVariants}
            animate={activeState}
            className="bg-white/80"
            style={{ boxShadow: '0 0 10px rgba(255,255,255,0.3)' }}
          />
        </div>

        {/* Inner dynamic particles/waves for visual flair */}
        <AnimatePresence>
          {activeState === 'thinking' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-full border-2 border-white border-dashed"
              style={{ animation: 'spin 4s linear infinite' }}
            />
          )}
          {activeState === 'speaking' && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.5, 0], scale: [0.5, 1.5, 2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full border border-white"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AIAvatar;
