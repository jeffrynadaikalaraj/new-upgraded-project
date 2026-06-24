import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useChatStore } from '../../stores/chatStore';

// ─── Theme Palettes ────────────────────────────────────────────
const THEMES = {
  female: {
    primary: '#ec4899', secondary: '#a855f7', accent: '#f59e0b',
    skin: '#fde1c3', skinShadow: '#f0c4a0', skinHi: '#fff5eb',
    hair: '#2a1810', hairHi: '#4a2820', hairAccent: '#6a3830',
    cheek: '#ff8ca0', lip: '#e0506a', lipDark: '#c03050',
    iris: '#6b4423', irisRing: '#4a2a10', brow: '#2a1810',
    glow: 'rgba(236,72,153,0.35)',
  },
  male: {
    primary: '#3b82f6', secondary: '#0ea5e9', accent: '#f59e0b',
    skin: '#e0c098', skinShadow: '#c8a070', skinHi: '#f0d8b8',
    hair: '#140c04', hairHi: '#2c1e10', hairAccent: '#1a1208',
    cheek: '#c89880', lip: '#a06858', lipDark: '#805040',
    iris: '#3a5830', irisRing: '#2a3818', brow: '#140c04',
    glow: 'rgba(59,130,246,0.35)',
  },
  jarvis: {
    primary: '#eab308', secondary: '#f97316', accent: '#ef4444',
    skin: '#dcd0b8', skinShadow: '#c0b498', skinHi: '#f0e8d8',
    hair: '#14142a', hairHi: '#24243a', hairAccent: '#1a1a30',
    cheek: '#d8c090', lip: '#9a7858', lipDark: '#7a5838',
    iris: '#eab308', irisRing: '#d4a008', brow: '#14142a',
    glow: 'rgba(234,179,8,0.4)',
  },
  cyber: {
    primary: '#22c55e', secondary: '#14b8a6', accent: '#3b82f6',
    skin: '#a8d0b0', skinShadow: '#88b898', skinHi: '#c8e8d0',
    hair: '#081810', hairHi: '#183020', hairAccent: '#0a2418',
    cheek: '#60b078', lip: '#408050', lipDark: '#306040',
    iris: '#22c55e', irisRing: '#18a048', brow: '#081810',
    glow: 'rgba(34,197,94,0.35)',
  },
  minimal: {
    primary: '#94a3b8', secondary: '#cbd5e1', accent: '#64748b',
    skin: '#e8e0d8', skinShadow: '#d0c8c0', skinHi: '#f4f0ec',
    hair: '#404040', hairHi: '#606060', hairAccent: '#505050',
    cheek: '#c8b8b0', lip: '#9a8878', lipDark: '#7a6858',
    iris: '#505050', irisRing: '#383838', brow: '#484848',
    glow: 'rgba(148,163,184,0.25)',
  },
  anime: {
    primary: '#f472b6', secondary: '#60a5fa', accent: '#a78bfa',
    skin: '#fff0e8', skinShadow: '#f8d8c0', skinHi: '#fff8f4',
    hair: '#5828a0', hairHi: '#7840c0', hairAccent: '#9050e0',
    cheek: '#ff90c0', lip: '#e060a0', lipDark: '#c04080',
    iris: '#a78bfa', irisRing: '#8060e0', brow: '#5828a0',
    glow: 'rgba(244,114,182,0.35)',
  },
};

// ─── Particles ─────────────────────────────────────────────────
const Particles = React.memo(({ color, state }) => {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: 2 + Math.random() * 4, dur: 5 + Math.random() * 8,
      delay: Math.random() * 5, opacity: 0.15 + Math.random() * 0.3,
    })),
  []);
  const active = ['thinking', 'speaking', 'excited', 'happy'].includes(state);
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      {particles.map((p) => (
        <motion.circle key={p.id} cx={`${p.x}%`} r={p.size} fill={color}
          initial={{ cy: `${p.y}%`, opacity: 0 }}
          animate={{
            cy: [`${p.y}%`, `${p.y - 20 - Math.random() * 25}%`, `${p.y}%`],
            opacity: active ? [0, p.opacity * 1.5, 0] : [0, p.opacity, 0],
            scale: active ? [1, 1.5, 1] : [1, 1.1, 1],
          }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
});

// ─── Status Label ──────────────────────────────────────────────
const StatusLabel = ({ state, color }) => {
  const map = { listening: '👂 Listening...', thinking: '💭 Thinking...', speaking: '💬 Speaking...', happy: '😊 Happy!', excited: '🎉 Excited!', error: '😵 Confused', concerned: '🤔 Hmm...' };
  if (!map[state]) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
      <div className="px-5 py-2 rounded-full text-sm font-semibold backdrop-blur-xl border shadow-lg"
        style={{ background: `linear-gradient(135deg, ${color}18, ${color}08)`, borderColor: `${color}40`, color }}>
        {map[state]}
      </div>
    </motion.div>
  );
};

// ════════════════════════════════════════════════════════════════
// ═══ INDIVIDUAL FACE RENDERERS ═════════════════════════════════
// ════════════════════════════════════════════════════════════════

// ─── FEMALE FACE ───────────────────────────────────────────────
const FemaleFace = ({ t, fp, ex, ey, blink, mouthOpen, state }) => (
  <g>
    {/* Back hair — long flowing */}
    <path d="M 22 70 Q 10 130 18 185 L 30 190 Q 20 135 32 80 Z" fill={t.hair} />
    <path d="M 178 70 Q 190 130 182 185 L 170 190 Q 180 135 168 80 Z" fill={t.hair} />
    <path d="M 30 80 Q 15 160 28 195 L 40 192 Q 25 155 38 82 Z" fill={t.hairHi} opacity="0.6" />
    <path d="M 170 80 Q 185 160 172 195 L 160 192 Q 175 155 162 82 Z" fill={t.hairHi} opacity="0.6" />

    {/* Neck */}
    <rect x="88" y="157" width="24" height="28" rx="10" fill={t.skinShadow} />
    <rect x="90" y="157" width="20" height="25" rx="9" fill={t.skin} />

    {/* Shoulders/torso */}
    <motion.path fill={`url(#torsoGrad)`}
      animate={state === 'idle' ? { d: ['M 20 210 Q 100 155 180 210 Z', 'M 20 210 Q 100 150 180 210 Z', 'M 20 210 Q 100 155 180 210 Z'] } : { d: 'M 20 210 Q 100 155 180 210 Z' }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />

    {/* Ears */}
    <ellipse cx="38" cy="104" rx="7" ry="12" fill={t.skinShadow} />
    <ellipse cx="39" cy="104" rx="4" ry="8" fill={t.skin} opacity="0.5" />
    <ellipse cx="162" cy="104" rx="7" ry="12" fill={t.skinShadow} />
    <ellipse cx="161" cy="104" rx="4" ry="8" fill={t.skin} opacity="0.5" />
    {/* Earrings */}
    <motion.circle cx="38" cy="118" r="3" fill={t.accent} opacity="0.7"
      animate={{ y: [0, 2, 0] }} transition={{ duration: 3, repeat: Infinity }} />
    <motion.circle cx="162" cy="118" r="3" fill={t.accent} opacity="0.7"
      animate={{ y: [0, 2, 0] }} transition={{ duration: 3, repeat: Infinity }} />

    {/* Head — soft oval with delicate chin */}
    <path d="M 40 100 A 60 62 0 1 1 160 100 Q 158 138 140 155 Q 120 168 100 170 Q 80 168 60 155 Q 42 138 40 100 Z" fill={`url(#skinGrad)`} />
    {/* Face contour shadows */}
    <ellipse cx="52" cy="110" rx="10" ry="22" fill={t.skinShadow} opacity="0.1" />
    <ellipse cx="148" cy="110" rx="10" ry="22" fill={t.skinShadow} opacity="0.1" />
    {/* Forehead glow */}
    <ellipse cx="96" cy="58" rx="28" ry="14" fill={t.skinHi} opacity="0.35" filter="blur(3px)" />

    {/* Front hair — voluminous with side-swept bangs */}
    <ellipse cx="100" cy="48" rx="66" ry="30" fill={t.hair} />
    <path d="M 34 50 Q 60 20 90 42 Q 100 28 130 38 Q 150 20 168 52" fill={t.hair} />
    <path d="M 42 55 Q 70 28 98 45" fill={t.hairHi} opacity="0.4" />
    <path d="M 95 42 Q 125 22 160 50" fill={t.hairAccent} opacity="0.3" />
    {/* Hair shine */}
    <path d="M 55 38 Q 100 26 145 38" stroke="white" strokeWidth="3" fill="none" opacity="0.12" strokeLinecap="round" filter="blur(1px)" />

    {/* Cheeks — rosy blush */}
    <motion.ellipse cx="66" cy="118" rx="14" ry="7" fill={t.cheek} opacity="0" animate={{ opacity: fp.cheekGlow * 0.45 }} />
    <motion.ellipse cx="134" cy="118" rx="14" ry="7" fill={t.cheek} opacity="0" animate={{ opacity: fp.cheekGlow * 0.45 }} />

    {/* Eyes */}
    <g transform={`translate(${ex}, ${ey})`} style={{ transition: 'transform 0.08s ease-out' }}>
      {['L', 'R'].map(s => {
        const ox = s === 'L' ? 73 : 127;
        return (
          <g key={s} transform={`translate(${ox}, 92) scale(1, ${blink * fp.eyeSquint})`}>
            <ellipse cx="0" cy="0" rx="11" ry="10" fill="white" />
            <ellipse cx="0" cy="-3" rx="10" ry="5" fill="rgba(0,0,0,0.03)" />
            <circle cx="0" cy="1" r="7" fill={t.iris} />
            <circle cx="0" cy="1" r="7" fill="none" stroke={t.irisRing} strokeWidth="1.2" opacity="0.4" />
            <motion.circle cx="0" cy="1" fill="#0a0a0a"
              animate={state === 'excited' ? { r: [3.5, 4.5, 3.5] } : { r: 3.5 }}
              transition={{ duration: 0.6, repeat: Infinity }} />
            <circle cx="-2.5" cy="-2.5" r="2.2" fill="white" opacity="0.9" />
            <circle cx="1.5" cy="2" r="1" fill="white" opacity="0.5" />
            {/* Upper lid */}
            <path d="M -11 -1 Q 0 -12 11 -1" stroke={t.brow} strokeWidth="1.8" fill="none" strokeLinecap="round" />
            {/* Lashes — elegant feminine */}
            {s === 'L' ? (
              <>
                <path d="M -11 -1 Q -16 -8 -19 -5" stroke={t.brow} strokeWidth="2.2" fill="none" strokeLinecap="round" />
                <path d="M -7 -8 Q -11 -14 -14 -12" stroke={t.brow} strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <path d="M -2 -11 Q -3 -16 -5 -15" stroke={t.brow} strokeWidth="1.3" fill="none" strokeLinecap="round" />
                <path d="M 4 -10 Q 5 -15 7 -14" stroke={t.brow} strokeWidth="1" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M 11 -1 Q 16 -8 19 -5" stroke={t.brow} strokeWidth="2.2" fill="none" strokeLinecap="round" />
                <path d="M 7 -8 Q 11 -14 14 -12" stroke={t.brow} strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <path d="M 2 -11 Q 3 -16 5 -15" stroke={t.brow} strokeWidth="1.3" fill="none" strokeLinecap="round" />
                <path d="M -4 -10 Q -5 -15 -7 -14" stroke={t.brow} strokeWidth="1" fill="none" strokeLinecap="round" />
              </>
            )}
            {/* Lower lid */}
            <path d="M -9 6 Q 0 10 9 6" stroke={t.skinShadow} strokeWidth="0.7" fill="none" opacity="0.4" />
          </g>
        );
      })}
      {/* Eyebrows — thin, arched */}
      <motion.path stroke={t.brow} strokeWidth="2.5" fill="none" strokeLinecap="round"
        animate={{ d: `M 56 ${76 - fp.browL} Q 73 ${68 - fp.browL - 5} 88 ${77 - fp.browL}` }} transition={{ duration: 0.25 }} />
      <motion.path stroke={t.brow} strokeWidth="2.5" fill="none" strokeLinecap="round"
        animate={{ d: `M 112 ${77 - fp.browR} Q 127 ${68 - fp.browR - 5} 144 ${76 - fp.browR}` }} transition={{ duration: 0.25 }} />
    </g>

    {/* Nose — small, delicate */}
    <path d="M 100 98 Q 101 108 100 113" stroke={t.skinShadow} strokeWidth="1" fill="none" opacity="0.25" />
    <path d="M 95 113 Q 100 117 105 113" stroke={t.skinShadow} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
    <ellipse cx="96" cy="110" rx="2" ry="3.5" fill={t.skinHi} opacity="0.2" />

    {/* Beauty mark */}
    <circle cx="130" cy="126" r="1.2" fill={t.brow} opacity="0.35" />

    {/* Mouth */}
    <motion.g animate={{ x: fp.mouthShift }} transition={{ duration: 0.15 }}>
      {mouthOpen > 0.15 ? (
        <>
          <motion.ellipse cx="100" cy="134" fill="#3a1520"
            animate={{ rx: 6 + mouthOpen * 7, ry: 1 + mouthOpen * 9 }}
            transition={{ duration: 0.06 }} />
          <path d={`M ${100 - 12} 133 Q ${100 - 4} ${133 - 5} 100 ${133 - 4} Q ${100 + 4} ${133 - 5} ${100 + 12} 133`} fill={t.lip} />
          <motion.path fill={t.lipDark} opacity="0.8"
            animate={{ d: `M 88 135 Q 100 ${135 + mouthOpen * 10} 112 135` }}
            transition={{ duration: 0.06 }} />
          {mouthOpen > 0.4 && <rect x="93" y="132" width="14" height={Math.min(mouthOpen * 4, 3.5)} rx="1" fill="white" opacity="0.8" />}
          <ellipse cx="98" cy="136" rx="3" ry="1" fill="white" opacity="0.1" />
        </>
      ) : (
        <>
          <path d={`M 87 133 Q 93 131 100 132 Q 107 131 113 133`} stroke={t.lip} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <motion.path stroke={t.lip} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.5"
            animate={{ d: `M 89 134 Q 100 ${134 + fp.mouthCurve + 3} 111 134` }} transition={{ duration: 0.25 }} />
          <ellipse cx="100" cy="133" rx="8" ry="2.5" fill={t.lip} opacity="0.15" />
        </>
      )}
    </motion.g>
  </g>
);

// ─── MALE FACE ─────────────────────────────────────────────────
const MaleFace = ({ t, fp, ex, ey, blink, mouthOpen, state }) => (
  <g>
    {/* Neck — thicker */}
    <rect x="83" y="157" width="34" height="30" rx="12" fill={t.skinShadow} />
    <rect x="85" y="157" width="30" height="27" rx="11" fill={t.skin} />
    {/* Adam's apple */}
    <ellipse cx="100" cy="170" rx="3" ry="4" fill={t.skinShadow} opacity="0.15" />

    {/* Broader shoulders */}
    <motion.path fill="url(#torsoGrad)"
      animate={state === 'idle' ? { d: ['M 5 210 Q 100 148 195 210 Z', 'M 5 210 Q 100 143 195 210 Z', 'M 5 210 Q 100 148 195 210 Z'] } : { d: 'M 5 210 Q 100 148 195 210 Z' }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />

    {/* Ears — larger */}
    <ellipse cx="35" cy="105" rx="8" ry="14" fill={t.skinShadow} />
    <ellipse cx="36.5" cy="105" rx="5" ry="9" fill={t.skin} opacity="0.5" />
    <ellipse cx="165" cy="105" rx="8" ry="14" fill={t.skinShadow} />
    <ellipse cx="163.5" cy="105" rx="5" ry="9" fill={t.skin} opacity="0.5" />

    {/* Head — wider with strong angular jaw */}
    <path d="M 38 98 A 62 60 0 1 1 162 98 Q 162 130 152 148 Q 138 165 100 168 Q 62 165 48 148 Q 38 130 38 98 Z" fill="url(#skinGrad)" />
    {/* Jawline shadow */}
    <path d="M 48 140 Q 62 160 100 164 Q 138 160 152 140" stroke={t.skinShadow} strokeWidth="1.5" fill="none" opacity="0.15" />
    {/* Contour shadows */}
    <ellipse cx="48" cy="110" rx="10" ry="24" fill={t.skinShadow} opacity="0.12" />
    <ellipse cx="152" cy="110" rx="10" ry="24" fill={t.skinShadow} opacity="0.12" />
    <ellipse cx="96" cy="55" rx="26" ry="12" fill={t.skinHi} opacity="0.3" filter="blur(2px)" />

    {/* Hair — short, textured crop with fade */}
    <ellipse cx="100" cy="48" rx="64" ry="26" fill={t.hair} />
    <path d="M 36 54 Q 55 22 85 38 Q 100 25 120 35 Q 145 20 166 52" fill={t.hair} />
    {/* Side fade lines */}
    <path d="M 40 68 Q 38 80 40 92" stroke={t.hair} strokeWidth="4" fill="none" opacity="0.5" />
    <path d="M 160 68 Q 162 80 160 92" stroke={t.hair} strokeWidth="4" fill="none" opacity="0.5" />
    {/* Texture strands */}
    <path d="M 60 32 Q 80 20 95 32" fill={t.hairHi} opacity="0.3" />
    <path d="M 95 28 Q 115 18 140 34" fill={t.hairAccent} opacity="0.25" />
    <ellipse cx="90" cy="36" rx="18" ry="5" fill={t.hairHi} opacity="0.15" />

    {/* 5 o'clock shadow / stubble */}
    <g opacity="0.08">
      {Array.from({ length: 50 }, (_, i) => (
        <circle key={i} cx={72 + Math.random() * 56} cy={130 + Math.random() * 32}
          r={0.4 + Math.random() * 0.6} fill={t.brow} />
      ))}
    </g>

    {/* Cheeks — subtle */}
    <motion.ellipse cx="64" cy="118" rx="12" ry="6" fill={t.cheek} opacity="0" animate={{ opacity: fp.cheekGlow * 0.25 }} />
    <motion.ellipse cx="136" cy="118" rx="12" ry="6" fill={t.cheek} opacity="0" animate={{ opacity: fp.cheekGlow * 0.25 }} />

    {/* Eyes */}
    <g transform={`translate(${ex}, ${ey})`} style={{ transition: 'transform 0.08s ease-out' }}>
      {['L', 'R'].map(s => {
        const ox = s === 'L' ? 73 : 127;
        return (
          <g key={s} transform={`translate(${ox}, 92) scale(1, ${blink * fp.eyeSquint})`}>
            <ellipse cx="0" cy="0" rx="10" ry="8.5" fill={t.iris === '#3a5830' ? '#fafafa' : 'white'} />
            <circle cx="0" cy="1" r="6.5" fill={t.iris} />
            <circle cx="0" cy="1" r="6.5" fill="none" stroke={t.irisRing} strokeWidth="1.5" opacity="0.3" />
            <motion.circle cx="0" cy="1" fill="#080808"
              animate={state === 'excited' ? { r: [3.5, 4.5, 3.5] } : { r: 3.5 }}
              transition={{ duration: 0.6, repeat: Infinity }} />
            <circle cx="-2" cy="-2" r="2" fill="white" opacity="0.85" />
            <circle cx="1.5" cy="1.5" r="0.9" fill="white" opacity="0.45" />
            {/* Heavy upper lid */}
            <path d="M -10 -1 Q 0 -10 10 -1" stroke={t.brow} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Slight lower lid */}
            <path d="M -8 5 Q 0 8 8 5" stroke={t.skinShadow} strokeWidth="0.8" fill="none" opacity="0.35" />
            {/* Lid crease — deeper for male */}
            <path d="M -9 -5 Q 0 -14 9 -5" stroke={t.skinShadow} strokeWidth="0.8" fill="none" opacity="0.25" />
          </g>
        );
      })}
      {/* Eyebrows — thick, straight, powerful */}
      <motion.path stroke={t.brow} strokeWidth="5" fill="none" strokeLinecap="round"
        animate={{ d: `M 56 ${77 - fp.browL} Q 73 ${72 - fp.browL - 2} 90 ${77 - fp.browL}` }} transition={{ duration: 0.25 }} />
      <motion.path stroke={t.brow} strokeWidth="5" fill="none" strokeLinecap="round"
        animate={{ d: `M 110 ${77 - fp.browR} Q 127 ${72 - fp.browR - 2} 144 ${77 - fp.browR}` }} transition={{ duration: 0.25 }} />
    </g>

    {/* Nose — broader, more prominent */}
    <path d="M 100 94 Q 101 106 100 114" stroke={t.skinShadow} strokeWidth="1.4" fill="none" opacity="0.3" />
    <path d="M 93 115 Q 96 119 100 120 Q 104 119 107 115" stroke={t.skinShadow} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.45" />
    <ellipse cx="95" cy="116" rx="2.2" ry="1.8" fill={t.skinShadow} opacity="0.15" />
    <ellipse cx="105" cy="116" rx="2.2" ry="1.8" fill={t.skinShadow} opacity="0.15" />
    <path d="M 98 96 Q 99 105 98 112" stroke={t.skinHi} strokeWidth="2" fill="none" opacity="0.15" strokeLinecap="round" />

    {/* Mouth — thinner lips */}
    <motion.g animate={{ x: fp.mouthShift }} transition={{ duration: 0.15 }}>
      {mouthOpen > 0.15 ? (
        <>
          <motion.ellipse cx="100" cy="136" fill="#2a1018"
            animate={{ rx: 5 + mouthOpen * 6, ry: 1 + mouthOpen * 8 }}
            transition={{ duration: 0.06 }} />
          <path d="M 89 135 Q 94 132 100 133 Q 106 132 111 135" fill={t.lip} />
          <motion.path fill={t.lipDark} opacity="0.7"
            animate={{ d: `M 90 137 Q 100 ${137 + mouthOpen * 8} 110 137` }}
            transition={{ duration: 0.06 }} />
          {mouthOpen > 0.4 && <rect x="94" y="134" width="12" height={Math.min(mouthOpen * 3.5, 3)} rx="1" fill="white" opacity="0.75" />}
        </>
      ) : (
        <>
          <path d="M 88 135 Q 94 133 100 134 Q 106 133 112 135" stroke={t.lip} strokeWidth="2" fill="none" strokeLinecap="round" />
          <motion.path stroke={t.lip} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4"
            animate={{ d: `M 90 136 Q 100 ${136 + fp.mouthCurve + 1.5} 110 136` }} transition={{ duration: 0.25 }} />
        </>
      )}
    </motion.g>
  </g>
);

// ─── JARVIS FACE ───────────────────────────────────────────────
const JarvisFace = ({ t, fp, ex, ey, blink, mouthOpen, state }) => (
  <g>
    {/* Neck */}
    <rect x="85" y="155" width="30" height="28" rx="11" fill={t.skinShadow} />
    <rect x="87" y="155" width="26" height="25" rx="10" fill={t.skin} />

    {/* Shoulders with suit collar hint */}
    <motion.path fill="url(#torsoGrad)"
      animate={state === 'idle' ? { d: ['M 12 210 Q 100 152 188 210 Z', 'M 12 210 Q 100 147 188 210 Z', 'M 12 210 Q 100 152 188 210 Z'] } : { d: 'M 12 210 Q 100 152 188 210 Z' }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
    {/* Collar lines */}
    <path d="M 70 178 L 85 165" stroke={t.primary} strokeWidth="1.5" opacity="0.3" />
    <path d="M 130 178 L 115 165" stroke={t.primary} strokeWidth="1.5" opacity="0.3" />

    {/* Ears */}
    <ellipse cx="36" cy="104" rx="7.5" ry="13" fill={t.skinShadow} />
    <ellipse cx="37.5" cy="104" rx="4.5" ry="8.5" fill={t.skin} opacity="0.5" />
    <ellipse cx="164" cy="104" rx="7.5" ry="13" fill={t.skinShadow} />
    <ellipse cx="162.5" cy="104" rx="4.5" ry="8.5" fill={t.skin} opacity="0.5" />

    {/* Head */}
    <path d="M 38 98 A 62 62 0 1 1 162 98 Q 160 135 148 152 Q 132 165 100 168 Q 68 165 52 152 Q 40 135 38 98 Z" fill="url(#skinGrad)" />
    <ellipse cx="50" cy="108" rx="9" ry="22" fill={t.skinShadow} opacity="0.1" />
    <ellipse cx="150" cy="108" rx="9" ry="22" fill={t.skinShadow} opacity="0.1" />
    <ellipse cx="96" cy="56" rx="24" ry="12" fill={t.skinHi} opacity="0.28" filter="blur(2px)" />

    {/* Hair — slicked back, sophisticated */}
    <ellipse cx="100" cy="47" rx="64" ry="25" fill={t.hair} />
    <path d="M 36 52 Q 70 18 100 30 Q 130 18 166 52" fill={t.hair} />
    <path d="M 50 42 Q 100 22 150 42" stroke={t.hairHi} strokeWidth="2" fill="none" opacity="0.2" strokeLinecap="round" />

    {/* ─── JARVIS HUD OVERLAYS ──────────────────────── */}
    {/* Rotating outer ring */}
    <motion.g animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: '100px 100px' }}>
      <circle cx="100" cy="100" r="80" fill="none" stroke={t.primary} strokeWidth="0.7" strokeDasharray="6 12 20 8" opacity="0.35" />
    </motion.g>
    <motion.g animate={{ rotate: -360 }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: '100px 100px' }}>
      <circle cx="100" cy="100" r="88" fill="none" stroke={t.secondary} strokeWidth="0.5" strokeDasharray="3 18 8 12" opacity="0.25" />
    </motion.g>
    {/* Corner brackets */}
    <g stroke={t.primary} strokeWidth="1" opacity="0.4" fill="none">
      <path d="M 28 60 L 28 48 L 40 48" />
      <path d="M 172 60 L 172 48 L 160 48" />
      <path d="M 28 155 L 28 167 L 40 167" />
      <path d="M 172 155 L 172 167 L 160 167" />
    </g>
    {/* Scanning line */}
    <motion.line x1="35" x2="165" stroke={t.primary} strokeWidth="0.8" opacity="0.2"
      animate={{ y1: [50, 165, 50], y2: [50, 165, 50] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />

    {/* Cheeks */}
    <motion.ellipse cx="66" cy="118" rx="12" ry="6" fill={t.cheek} opacity="0" animate={{ opacity: fp.cheekGlow * 0.15 }} />
    <motion.ellipse cx="134" cy="118" rx="12" ry="6" fill={t.cheek} opacity="0" animate={{ opacity: fp.cheekGlow * 0.15 }} />

    {/* Eyes — sharp with golden iris glow */}
    <g transform={`translate(${ex}, ${ey})`} style={{ transition: 'transform 0.08s ease-out' }}>
      {['L', 'R'].map(s => {
        const ox = s === 'L' ? 73 : 127;
        return (
          <g key={s} transform={`translate(${ox}, 92) scale(1, ${blink * fp.eyeSquint})`}>
            <ellipse cx="0" cy="0" rx="10" ry="9" fill={t.skinHi} />
            <circle cx="0" cy="1" r="6.5" fill={t.iris} />
            {/* Golden glow */}
            <motion.circle cx="0" cy="1" r="7.5" fill="none" stroke={t.primary} strokeWidth="1"
              animate={state === 'speaking' ? { opacity: [0.3, 0.7, 0.3] } : { opacity: 0.3 }}
              transition={{ duration: 1.2, repeat: Infinity }} />
            <circle cx="0" cy="1" r="3" fill="#0a0a0a" />
            <circle cx="-2" cy="-2" r="2" fill="white" opacity="0.8" />
            <circle cx="1.5" cy="1.5" r="0.8" fill={t.primary} opacity="0.5" />
            <path d="M -10 -1 Q 0 -11 10 -1" stroke={t.brow} strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        );
      })}
      {/* Brows — refined, angled */}
      <motion.path stroke={t.brow} strokeWidth="3.5" fill="none" strokeLinecap="round"
        animate={{ d: `M 57 ${77 - fp.browL} Q 73 ${70 - fp.browL - 3} 89 ${78 - fp.browL}` }} transition={{ duration: 0.25 }} />
      <motion.path stroke={t.brow} strokeWidth="3.5" fill="none" strokeLinecap="round"
        animate={{ d: `M 111 ${78 - fp.browR} Q 127 ${70 - fp.browR - 3} 143 ${77 - fp.browR}` }} transition={{ duration: 0.25 }} />
    </g>

    {/* Nose */}
    <path d="M 100 96 Q 101 108 100 115" stroke={t.skinShadow} strokeWidth="1.2" fill="none" opacity="0.25" />
    <path d="M 94 115 Q 100 119 106 115" stroke={t.skinShadow} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.4" />

    {/* Mouth — controlled, precise */}
    <motion.g animate={{ x: fp.mouthShift }} transition={{ duration: 0.15 }}>
      {mouthOpen > 0.15 ? (
        <>
          <motion.ellipse cx="100" cy="136" fill="#2a1818"
            animate={{ rx: 5 + mouthOpen * 5, ry: 1 + mouthOpen * 7 }}
            transition={{ duration: 0.06 }} />
          <path d="M 90 135 Q 95 133 100 134 Q 105 133 110 135" fill={t.lip} />
          <motion.path fill={t.lipDark} opacity="0.7"
            animate={{ d: `M 91 137 Q 100 ${137 + mouthOpen * 7} 109 137` }}
            transition={{ duration: 0.06 }} />
        </>
      ) : (
        <>
          <path d="M 89 135 Q 94 133.5 100 134 Q 106 133.5 111 135" stroke={t.lip} strokeWidth="2" fill="none" strokeLinecap="round" />
          <motion.path stroke={t.lip} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.4"
            animate={{ d: `M 91 136 Q 100 ${136 + fp.mouthCurve + 1} 109 136` }} transition={{ duration: 0.25 }} />
        </>
      )}
    </motion.g>
  </g>
);

// ─── CYBER FACE ────────────────────────────────────────────────
const CyberFace = ({ t, fp, ex, ey, blink, mouthOpen, state }) => (
  <g>
    {/* Neck with circuit */}
    <rect x="83" y="155" width="34" height="30" rx="12" fill={t.skinShadow} />
    <rect x="85" y="155" width="30" height="27" rx="11" fill={t.skin} />
    <motion.line x1="95" y1="158" x2="95" y2="178" stroke={t.primary} strokeWidth="1" opacity="0.4"
      animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />

    {/* Shoulders */}
    <motion.path fill="url(#torsoGrad)"
      animate={state === 'idle' ? { d: ['M 8 210 Q 100 148 192 210 Z', 'M 8 210 Q 100 144 192 210 Z', 'M 8 210 Q 100 148 192 210 Z'] } : { d: 'M 8 210 Q 100 148 192 210 Z' }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />

    {/* Ears — with cybernetic attachment */}
    <ellipse cx="35" cy="105" rx="8" ry="13" fill={t.skinShadow} />
    <ellipse cx="37" cy="105" rx="5" ry="8.5" fill={t.skin} opacity="0.5" />
    <rect x="27" y="100" width="6" height="10" rx="2" fill={t.hair} opacity="0.6" />
    <motion.circle cx="30" cy="105" r="2" fill={t.primary}
      animate={{ opacity: [0.3, 0.9, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
    <ellipse cx="165" cy="105" rx="8" ry="13" fill={t.skinShadow} />
    <ellipse cx="163" cy="105" rx="5" ry="8.5" fill={t.skin} opacity="0.5" />

    {/* Head */}
    <path d="M 37 98 A 63 62 0 1 1 163 98 Q 162 132 150 150 Q 135 165 100 168 Q 65 165 50 150 Q 38 132 37 98 Z" fill="url(#skinGrad)" />
    <ellipse cx="49" cy="108" rx="10" ry="22" fill={t.skinShadow} opacity="0.1" />
    <ellipse cx="151" cy="108" rx="10" ry="22" fill={t.skinShadow} opacity="0.1" />

    {/* Hair — edgy spikes with neon */}
    <ellipse cx="100" cy="48" rx="64" ry="24" fill={t.hair} />
    <path d="M 50 50 L 60 18 L 78 42 L 95 5 L 112 38 L 135 10 L 148 40 L 155 50" fill={t.hair} />
    <path d="M 95 5 L 112 38" stroke={t.primary} strokeWidth="3" opacity="0.5" strokeLinecap="round" />
    <path d="M 60 18 L 78 42" stroke={t.accent} strokeWidth="2" opacity="0.4" strokeLinecap="round" />

    {/* Cybernetic face circuit lines */}
    <motion.g animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2.5, repeat: Infinity }}>
      <path d="M 50 130 L 42 115 L 48 100 L 42 88" stroke={t.primary} strokeWidth="1.5" fill="none" />
      <circle cx="42" cy="88" r="2.5" fill={t.primary} />
      <circle cx="50" cy="130" r="2" fill={t.primary} opacity="0.7" />
    </motion.g>
    <motion.g animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}>
      <path d="M 155 125 L 160 110" stroke={t.accent} strokeWidth="1.5" fill="none" />
      <circle cx="160" cy="110" r="2" fill={t.accent} />
    </motion.g>
    {/* Glitch scar */}
    <path d="M 130 85 L 133 95 L 128 100 L 132 108" stroke={t.primary} strokeWidth="1" fill="none" opacity="0.35" />

    {/* Eyes — asymmetric: left is cybernetic */}
    <g transform={`translate(${ex}, ${ey})`} style={{ transition: 'transform 0.08s ease-out' }}>
      {/* Left eye — CYBERNETIC */}
      <g transform={`translate(73, 92) scale(1, ${blink * fp.eyeSquint})`}>
        <rect x="-12" y="-10" width="24" height="20" rx="4" fill="#0a1a10" stroke={t.primary} strokeWidth="1.5" />
        <motion.rect x="-9" y="-7" width="18" height="14" rx="2" fill={t.primary} opacity="0.15"
          animate={{ opacity: state === 'speaking' ? [0.1, 0.3, 0.1] : 0.15 }}
          transition={{ duration: 0.8, repeat: Infinity }} />
        <circle cx="0" cy="1" r="5" fill={t.iris} />
        <circle cx="0" cy="1" r="2.5" fill="#0f0" opacity="0.8" />
        <motion.circle cx="0" cy="1" r="6" fill="none" stroke={t.primary} strokeWidth="0.8"
          animate={{ r: [5, 7, 5], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }} />
        {/* Scanning crosshair */}
        <motion.line x1="-8" x2="8" y1="1" y2="1" stroke={t.primary} strokeWidth="0.5" opacity="0.4"
          animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 1.5, repeat: Infinity }} />
        <motion.line x1="0" x2="0" y1="-7" y2="9" stroke={t.primary} strokeWidth="0.5" opacity="0.4"
          animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />
      </g>
      {/* Right eye — human */}
      <g transform={`translate(127, 92) scale(1, ${blink * fp.eyeSquint})`}>
        <ellipse cx="0" cy="0" rx="10" ry="9" fill="white" />
        <circle cx="0" cy="1" r="6.5" fill={t.iris} />
        <circle cx="0" cy="1" r="3.5" fill="#0a0a0a" />
        <circle cx="-2" cy="-2" r="1.8" fill="white" opacity="0.85" />
        <path d="M -10 -1 Q 0 -11 10 -1" stroke={t.brow} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </g>
      {/* Brows */}
      <motion.path stroke={t.brow} strokeWidth="3.5" fill="none" strokeLinecap="round"
        animate={{ d: `M 57 ${78 - fp.browL} Q 73 ${73 - fp.browL - 1} 87 ${78 - fp.browL}` }} transition={{ duration: 0.25 }} />
      <motion.path stroke={t.brow} strokeWidth="3.5" fill="none" strokeLinecap="round"
        animate={{ d: `M 113 ${78 - fp.browR} Q 127 ${73 - fp.browR - 1} 143 ${78 - fp.browR}` }} transition={{ duration: 0.25 }} />
    </g>

    {/* Nose */}
    <path d="M 100 96 Q 101 108 100 115" stroke={t.skinShadow} strokeWidth="1.2" fill="none" opacity="0.25" />
    <path d="M 94 115 Q 100 119 106 115" stroke={t.skinShadow} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />

    {/* Mouth */}
    <motion.g animate={{ x: fp.mouthShift }} transition={{ duration: 0.15 }}>
      {mouthOpen > 0.15 ? (
        <>
          <motion.ellipse cx="100" cy="136" fill="#0a1a10"
            animate={{ rx: 5 + mouthOpen * 5, ry: 1 + mouthOpen * 7 }}
            transition={{ duration: 0.06 }} />
          <path d="M 90 135 Q 100 133 110 135" fill={t.lip} />
          <motion.path fill={t.lipDark} opacity="0.7"
            animate={{ d: `M 91 137 Q 100 ${137 + mouthOpen * 7} 109 137` }}
            transition={{ duration: 0.06 }} />
        </>
      ) : (
        <>
          <path d="M 89 135 Q 100 134 111 135" stroke={t.lip} strokeWidth="2" fill="none" strokeLinecap="round" />
          <motion.path stroke={t.lip} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.4"
            animate={{ d: `M 91 136 Q 100 ${136 + fp.mouthCurve + 1} 109 136` }} transition={{ duration: 0.25 }} />
        </>
      )}
    </motion.g>
  </g>
);

// ─── MINIMAL FACE ──────────────────────────────────────────────
const MinimalFace = ({ t, fp, ex, ey, blink, mouthOpen, state }) => (
  <g>
    {/* Simple body line */}
    <motion.path fill="url(#torsoGrad)" opacity="0.5"
      animate={{ d: 'M 60 210 Q 100 168 140 210 Z' }} />
    {/* Thin neck */}
    <rect x="93" y="157" width="14" height="20" rx="7" fill={t.skinShadow} opacity="0.5" />

    {/* Head — perfect circle, clean */}
    <circle cx="100" cy="100" r="56" fill="url(#skinGrad)" />
    {/* Glass reflection */}
    <ellipse cx="80" cy="70" rx="28" ry="14" fill="white" opacity="0.12" filter="blur(4px)" transform="rotate(-20 80 70)" />

    {/* Eyes — simple dots with subtle animation */}
    <g transform={`translate(${ex * 0.6}, ${ey * 0.6})`} style={{ transition: 'transform 0.12s ease-out' }}>
      <motion.circle cx="80" cy="96" fill={t.brow}
        animate={{ r: blink * fp.eyeSquint < 0.5 ? 0.5 : 5.5, scaleY: blink * fp.eyeSquint }}
        transition={{ duration: 0.12 }} />
      <motion.circle cx="120" cy="96" fill={t.brow}
        animate={{ r: blink * fp.eyeSquint < 0.5 ? 0.5 : 5.5, scaleY: blink * fp.eyeSquint }}
        transition={{ duration: 0.12 }} />
      {/* Tiny highlight */}
      <circle cx="78" cy="94" r="1.5" fill="white" opacity="0.5" />
      <circle cx="118" cy="94" r="1.5" fill="white" opacity="0.5" />
    </g>

    {/* Mouth — simple arc */}
    <motion.g animate={{ x: fp.mouthShift * 0.5 }} transition={{ duration: 0.15 }}>
      {mouthOpen > 0.15 ? (
        <motion.ellipse cx="100" cy="122" fill={t.brow}
          animate={{ rx: 3 + mouthOpen * 5, ry: 1 + mouthOpen * 5 }}
          transition={{ duration: 0.08 }} />
      ) : (
        <motion.path stroke={t.brow} strokeWidth="2.5" fill="none" strokeLinecap="round"
          animate={{ d: `M 90 122 Q 100 ${122 + fp.mouthCurve * 0.8 + 3} 110 122` }}
          transition={{ duration: 0.25 }} />
      )}
    </motion.g>
  </g>
);

// ─── ANIME FACE ────────────────────────────────────────────────
const AnimeFace = ({ t, fp, ex, ey, blink, mouthOpen, state }) => (
  <g>
    {/* Long flowing back hair */}
    <path d="M 15 60 Q 0 140 15 200 L 30 195 Q 12 140 28 65 Z" fill={t.hair} />
    <path d="M 185 60 Q 200 140 185 200 L 170 195 Q 188 140 172 65 Z" fill={t.hair} />
    <path d="M 22 70 Q 8 150 22 198 L 34 193 Q 18 148 32 72 Z" fill={t.hairHi} opacity="0.5" />
    <path d="M 178 70 Q 192 150 178 198 L 166 193 Q 182 148 168 72 Z" fill={t.hairHi} opacity="0.5" />

    {/* Slender neck */}
    <rect x="90" y="162" width="20" height="22" rx="8" fill={t.skinShadow} />
    <rect x="92" y="162" width="16" height="19" rx="7" fill={t.skin} />

    {/* Narrow shoulders */}
    <motion.path fill="url(#torsoGrad)"
      animate={state === 'idle' ? { d: ['M 30 210 Q 100 160 170 210 Z', 'M 30 210 Q 100 155 170 210 Z', 'M 30 210 Q 100 160 170 210 Z'] } : { d: 'M 30 210 Q 100 160 170 210 Z' }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />

    {/* Small ears */}
    <ellipse cx="40" cy="105" rx="5" ry="9" fill={t.skinShadow} />
    <ellipse cx="160" cy="105" rx="5" ry="9" fill={t.skinShadow} />

    {/* Head — round with pointed chin */}
    <path d="M 38 95 A 62 58 0 1 1 162 95 Q 162 130 140 150 L 100 178 L 60 150 Q 38 130 38 95 Z" fill="url(#skinGrad)" />
    <ellipse cx="95" cy="55" rx="25" ry="12" fill={t.skinHi} opacity="0.35" filter="blur(3px)" />

    {/* Front Hair — big spiky bangs */}
    <ellipse cx="100" cy="44" rx="70" ry="32" fill={t.hair} />
    <path d="M 25 55 L 45 10 L 65 45 L 85 -5 L 105 40 L 130 0 L 150 38 L 170 15 L 180 55" fill={t.hair} />
    <path d="M 85 -5 L 105 40" stroke={t.hairAccent} strokeWidth="4" opacity="0.4" strokeLinecap="round" />
    <path d="M 40 42 Q 100 18 160 42" stroke="white" strokeWidth="5" fill="none" opacity="0.1" strokeLinecap="round" filter="blur(2px)" />

    {/* Rosy cheeks — prominent */}
    <motion.ellipse cx="58" cy="125" rx="16" ry="8" fill={t.cheek}
      animate={{ opacity: fp.cheekGlow * 0.5 }} />
    <motion.ellipse cx="142" cy="125" rx="16" ry="8" fill={t.cheek}
      animate={{ opacity: fp.cheekGlow * 0.5 }} />

    {/* ── HUGE ANIME EYES ──────────────────────────── */}
    <g transform={`translate(${ex}, ${ey})`} style={{ transition: 'transform 0.08s ease-out' }}>
      {['L', 'R'].map(s => {
        const ox = s === 'L' ? 70 : 130;
        return (
          <g key={s} transform={`translate(${ox}, 95) scale(1, ${blink * fp.eyeSquint})`}>
            {/* Big white */}
            <ellipse cx="0" cy="0" rx="17" ry="20" fill="white" />
            {/* Iris — large, colorful */}
            <ellipse cx="0" cy="2" rx="13" ry="16" fill={t.iris} />
            {/* Secondary color ring */}
            <ellipse cx="0" cy="2" rx="13" ry="16" fill="none" stroke={t.irisRing} strokeWidth="2" opacity="0.3" />
            {/* Inner gradient glow */}
            <ellipse cx="0" cy="10" rx="7" ry="4" fill={t.primary} opacity="0.4" filter="blur(2px)" />
            {/* Pupil */}
            <motion.ellipse cx="0" cy="2" fill="#0a0a0a"
              animate={state === 'excited' ? { rx: [6, 8, 6], ry: [8, 10, 8] } : { rx: 6, ry: 8 }}
              transition={{ duration: 0.5, repeat: Infinity }} />
            {/* BIG sparkle highlights */}
            <circle cx="-5" cy="-7" r="5.5" fill="white" opacity="0.95" />
            <circle cx="5" cy="6" r="3" fill="white" opacity="0.85" />
            <circle cx="-8" cy="4" r="1.5" fill="white" opacity="0.5" />
            {/* Thick eyeliner */}
            <path d={`M -18 -5 Q 0 -24 18 -5`} stroke={t.brow} strokeWidth="4" fill="none" strokeLinecap="round" />
            {/* Dramatic lashes */}
            {s === 'L' ? (
              <>
                <path d="M -17 -5 Q -24 -14 -28 -10" stroke={t.brow} strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <path d="M -12 -14 Q -18 -22 -22 -19" stroke={t.brow} strokeWidth="2.8" fill="none" strokeLinecap="round" />
                <path d="M -4 -20 Q -6 -26 -8 -25" stroke={t.brow} strokeWidth="2" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M 17 -5 Q 24 -14 28 -10" stroke={t.brow} strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <path d="M 12 -14 Q 18 -22 22 -19" stroke={t.brow} strokeWidth="2.8" fill="none" strokeLinecap="round" />
                <path d="M 4 -20 Q 6 -26 8 -25" stroke={t.brow} strokeWidth="2" fill="none" strokeLinecap="round" />
              </>
            )}
          </g>
        );
      })}
      {/* Thin expressive brows */}
      <motion.path stroke={t.brow} strokeWidth="2.5" fill="none" strokeLinecap="round"
        animate={{ d: `M 48 ${72 - fp.browL} Q 70 ${62 - fp.browL - 6} 88 ${74 - fp.browL}` }} transition={{ duration: 0.2 }} />
      <motion.path stroke={t.brow} strokeWidth="2.5" fill="none" strokeLinecap="round"
        animate={{ d: `M 112 ${74 - fp.browR} Q 130 ${62 - fp.browR - 6} 152 ${72 - fp.browR}` }} transition={{ duration: 0.2 }} />
    </g>

    {/* Tiny nose — just a dot */}
    <path d="M 98 118 Q 100 121 102 118" stroke={t.skinShadow} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.4" />

    {/* Mouth — expressive, cat-like */}
    <motion.g animate={{ x: fp.mouthShift }} transition={{ duration: 0.15 }}>
      {mouthOpen > 0.15 ? (
        <>
          <motion.ellipse cx="100" cy="138" fill="#3a1520"
            animate={{ rx: 5 + mouthOpen * 8, ry: 1 + mouthOpen * 10 }}
            transition={{ duration: 0.05 }} />
          <path d="M 90 137 Q 95 134 100 135 Q 105 134 110 137" fill={t.lip} />
          <motion.path fill={t.lipDark} opacity="0.8"
            animate={{ d: `M 91 139 Q 100 ${139 + mouthOpen * 10} 109 139` }}
            transition={{ duration: 0.05 }} />
          {/* Fang hint for anime */}
          {mouthOpen > 0.5 && <path d="M 96 137 L 97 141 L 98 137" fill="white" opacity="0.9" />}
        </>
      ) : (
        <>
          {/* Cat mouth — W shape for happy, simple for others */}
          {fp.mouthCurve > 4 ? (
            <path d="M 88 136 Q 94 132 100 137 Q 106 132 112 136" stroke={t.lip} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          ) : (
            <>
              <path d="M 90 136 Q 100 134 110 136" stroke={t.lip} strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <motion.path stroke={t.lip} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"
                animate={{ d: `M 92 137 Q 100 ${137 + fp.mouthCurve + 2} 108 137` }} transition={{ duration: 0.2 }} />
            </>
          )}
        </>
      )}
    </motion.g>
  </g>
);

// ════════════════════════════════════════════════════════════════
// ═══ MAIN AVATAR COMPONENT ════════════════════════════════════
// ════════════════════════════════════════════════════════════════
const AIAvatar = ({ size = 'large' }) => {
  const { isStreaming, isThinking, isUserTyping, avatarTheme, avatarEmotion, isSpeakingAudio } = useChatStore();

  let activeState = 'idle';
  if (isThinking) activeState = 'thinking';
  else if (isSpeakingAudio || isStreaming) activeState = 'speaking';
  else if (isUserTyping) activeState = 'listening';
  else if (avatarEmotion && avatarEmotion !== 'neutral') activeState = avatarEmotion;

  const theme = THEMES[avatarTheme] || THEMES.female;

  // ─── Mouse tracking ──────────────────────────────────────────
  const rawEyeX = useMotionValue(0);
  const rawEyeY = useMotionValue(0);
  const springX = useSpring(rawEyeX, { stiffness: 150, damping: 20 });
  const springY = useSpring(rawEyeY, { stiffness: 150, damping: 20 });
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const h = (e) => {
      rawEyeX.set(((e.clientX / window.innerWidth) * 2 - 1) * 5);
      rawEyeY.set(((e.clientY / window.innerHeight) * 2 - 1) * 3);
    };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, [rawEyeX, rawEyeY]);

  useEffect(() => {
    const u1 = springX.on('change', (v) => setEyePos((p) => ({ ...p, x: v })));
    const u2 = springY.on('change', (v) => setEyePos((p) => ({ ...p, y: v })));
    return () => { u1(); u2(); };
  }, [springX, springY]);

  // ─── Blinking ────────────────────────────────────────────────
  const [blinkScale, setBlinkScale] = useState(1);
  useEffect(() => {
    let tid;
    const blink = () => {
      tid = setTimeout(() => {
        setBlinkScale(0.05);
        setTimeout(() => { setBlinkScale(1); blink(); }, 110);
      }, 2200 + Math.random() * 3500);
    };
    blink();
    return () => clearTimeout(tid);
  }, []);

  // ─── Speaking mouth ──────────────────────────────────────────
  const [mouthOpen, setMouthOpen] = useState(0);
  useEffect(() => {
    if (activeState !== 'speaking') { setMouthOpen(0); return; }
    let frame, running = true;
    const go = () => {
      if (!running) return;
      // Simulate natural speech rhythm: mix of small and large openings
      const v = Math.random();
      const open = v < 0.2 ? 0.05 : v < 0.5 ? 0.3 + Math.random() * 0.3 : 0.5 + Math.random() * 0.4;
      setMouthOpen(open);
      const delay = v < 0.2 ? 120 + Math.random() * 80 : 40 + Math.random() * 60;
      frame = requestAnimationFrame(() => setTimeout(go, delay));
    };
    go();
    return () => { running = false; cancelAnimationFrame(frame); };
  }, [activeState]);

  // ─── Sizing ──────────────────────────────────────────────────
  const isFullPanel = size === 'full';
  const containerClass = isFullPanel ? 'w-full h-full' : size === 'large' ? 'w-40 h-40' : size === 'medium' ? 'w-20 h-20' : 'w-10 h-10';

  // ─── State → face properties ─────────────────────────────────
  const getFP = () => {
    const base = { browL: 0, browR: 0, eyeSquint: 1, cheekGlow: 0.5, mouthCurve: 3, mouthShift: 0 };
    switch (activeState) {
      case 'thinking':
        return {
          head: { y: [0, -3, 0], rotate: [0, 4, -3, 0], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } },
          browL: -3, browR: 2, eyeSquint: 0.78, cheekGlow: 0.35, mouthCurve: -2, mouthShift: -3,
        };
      case 'speaking':
        return {
          head: { y: [0, -5, -2, -5, 0], rotate: [0, -1.5, 1.5, -1, 0], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
          browL: 0, browR: 0, eyeSquint: 1, cheekGlow: 0.5, mouthCurve: 2, mouthShift: 0,
        };
      case 'listening':
        return {
          head: { y: [0, -2, 0], rotate: [0, 3, 3, 0], scale: [1, 1.01, 1], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
          browL: 3, browR: 3, eyeSquint: 1.08, cheekGlow: 0.4, mouthCurve: 3, mouthShift: 0,
        };
      case 'happy':
        return {
          head: { y: [0, -7, 0], rotate: [0, -3, 3, 0], transition: { duration: 0.7, ease: 'easeOut' } },
          browL: 3, browR: 3, eyeSquint: 0.6, cheekGlow: 0.95, mouthCurve: 8, mouthShift: 0,
        };
      case 'excited':
        return {
          head: { y: [0, -14, 0], transition: { duration: 0.5, repeat: 2, ease: 'easeOut' } },
          browL: 5, browR: 5, eyeSquint: 1.18, cheekGlow: 1, mouthCurve: 10, mouthShift: 0,
        };
      case 'error':
        return {
          head: { x: [-4, 4, -4, 4, 0], rotate: [0, -3, 0], transition: { duration: 0.5 } },
          browL: -4, browR: -2, eyeSquint: 0.82, cheekGlow: 0.15, mouthCurve: -5, mouthShift: 0,
        };
      case 'concerned':
        return {
          head: { y: [0, -2, 0], transition: { duration: 3.5, repeat: Infinity } },
          browL: -3, browR: 1, eyeSquint: 0.88, cheekGlow: 0.2, mouthCurve: -3, mouthShift: 1,
        };
      default:
        return {
          head: { y: [0, -4, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } },
          ...base,
        };
    }
  };

  const fp = getFP();
  const tracksEyes = activeState === 'idle' || activeState === 'listening';
  const ex = tracksEyes ? eyePos.x : (activeState === 'thinking' ? 3 : 0);
  const ey = tracksEyes ? eyePos.y : (activeState === 'thinking' ? -2 : 0);
  const finalBlink = (activeState === 'idle' || activeState === 'listening') ? blinkScale : 1;

  const auraColor = activeState === 'speaking' ? theme.primary : activeState === 'thinking' ? theme.secondary : (activeState === 'excited' || activeState === 'happy') ? theme.accent : activeState === 'error' ? '#ef4444' : theme.primary;
  const auraI = activeState === 'idle' ? 0.15 : (activeState === 'speaking' || activeState === 'excited') ? 0.5 : 0.3;

  // ─── Face props passed to each renderer ──────────────────────
  const faceProps = { t: theme, fp, ex, ey, blink: finalBlink, mouthOpen, state: activeState };

  const FaceComponent = {
    female: FemaleFace,
    male: MaleFace,
    jarvis: JarvisFace,
    cyber: CyberFace,
    minimal: MinimalFace,
    anime: AnimeFace,
  }[avatarTheme] || FemaleFace;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${containerClass}`}>
      {/* Ambient glow */}
      <motion.div className="absolute inset-0 z-0"
        animate={{ background: `radial-gradient(ellipse at 50% 45%, ${auraColor}${Math.round(auraI * 255).toString(16).padStart(2, '0')} 0%, transparent 65%)` }}
        transition={{ duration: 1.2 }} />

      {/* Aura rings */}
      <motion.div className="absolute z-0 rounded-full"
        style={{ width: isFullPanel ? '320px' : '85%', aspectRatio: '1/1', maxWidth: '85vw', border: `2px solid ${auraColor}`, filter: 'blur(1px)' }}
        animate={{ scale: [1, 1.08, 1], opacity: [auraI * 0.4, auraI * 0.8, auraI * 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute z-0 rounded-full"
        style={{ width: isFullPanel ? '360px' : '95%', aspectRatio: '1/1', maxWidth: '95vw', border: `1px solid ${auraColor}`, filter: 'blur(3px)' }}
        animate={{ scale: [1.05, 1, 1.05], opacity: [auraI * 0.2, auraI * 0.5, auraI * 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} />

      <Particles color={auraColor} state={activeState} />

      {/* Face container with head animation */}
      <motion.div className="relative z-10"
        style={{ width: isFullPanel ? '60%' : '100%', maxWidth: isFullPanel ? 320 : undefined }}
        animate={fp.head}>
        {/* Breathing */}
        <motion.div className="w-full h-full"
          animate={activeState === 'idle' ? { scale: [1, 1.012, 1], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } } : { scale: 1 }}>

          <svg viewBox="0 0 200 215" className="w-full h-full overflow-visible" style={{ filter: 'drop-shadow(0 8px 30px rgba(0,0,0,0.3))' }}>
            <defs>
              <radialGradient id="skinGrad" cx="45%" cy="38%" r="60%">
                <stop offset="0%" stopColor={theme.skinHi} />
                <stop offset="50%" stopColor={theme.skin} />
                <stop offset="100%" stopColor={theme.skinShadow} />
              </radialGradient>
              <linearGradient id="torsoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={theme.primary} stopOpacity="0.75" />
                <stop offset="100%" stopColor={theme.secondary} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Render the theme-specific face */}
            <FaceComponent {...faceProps} />

            {/* ─── State FX overlays (shared) ───────────── */}
            {/* Thinking indicator */}
            {activeState === 'thinking' && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1, rotate: 360 }}
                transition={{ rotate: { duration: 6, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.5 } }}
                style={{ transformOrigin: '158px 52px' }}>
                <circle cx="158" cy="52" r="5" fill="none" stroke={theme.secondary} strokeWidth="1.5" strokeDasharray="4 3" />
                <circle cx="166" cy="44" r="3" fill={theme.secondary} opacity="0.5" />
                <circle cx="152" cy="42" r="2" fill={theme.primary} opacity="0.4" />
              </motion.g>
            )}

            {/* Happy / Excited sparkles */}
            {(activeState === 'happy' || activeState === 'excited') && (
              <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                {[[45, 55], [155, 50], [30, 95], [170, 90], [50, 40], [150, 38], [100, 30]].map(([sx, sy], i) => (
                  <motion.g key={i}
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], rotate: [0, 180, 360] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                    style={{ transformOrigin: `${sx}px ${sy}px` }}>
                    <line x1={sx} y1={sy - 5} x2={sx} y2={sy + 5} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" />
                    <line x1={sx - 5} y1={sy} x2={sx + 5} y2={sy} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" />
                  </motion.g>
                ))}
              </motion.g>
            )}

            {/* Error X */}
            {activeState === 'error' && (
              <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                <line x1="155" y1="48" x2="165" y2="58" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="165" y1="48" x2="155" y2="58" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
              </motion.g>
            )}
          </svg>
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        <StatusLabel key={activeState} state={activeState} color={theme.primary} />
      </AnimatePresence>
    </div>
  );
};

export default AIAvatar;
