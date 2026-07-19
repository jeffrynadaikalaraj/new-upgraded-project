import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ActionBadge from './ActionBadge';
import { useNavigate } from 'react-router-dom';
import { Target, Activity, Calendar, Copy, Share2, GitBranch, Check, Volume2, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { isNativePlatform } from '../../utils/platform';
import { speakText } from '../../stores/chatStore';

// Trigger light haptic feedback on native platforms
const hapticTap = async () => {
  if (isNativePlatform()) {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
  }
};

const bubbleVariants = {
  hidden: (isUser) => ({
    opacity: 0,
    x: isUser ? 20 : -20,
    scale: 0.97,
  }),
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ── Markdown renderer components (module-level to avoid re-creation on every render) ──
const markdownComponents = {
  // ── Headings ──
  h1: ({node, ...props}) => <h1 className="text-xl font-bold text-white mt-5 mb-3 first:mt-0" {...props} />,
  h2: ({node, ...props}) => <h2 className="text-lg font-bold text-white mt-4 mb-2.5 first:mt-0" {...props} />,
  h3: ({node, ...props}) => <h3 className="text-base font-semibold text-white mt-3.5 mb-2 first:mt-0" {...props} />,
  h4: ({node, ...props}) => <h4 className="text-sm font-semibold text-slate-100 mt-3 mb-1.5 first:mt-0" {...props} />,

  // ── Paragraphs ──
  p: ({node, ...props}) => <p className="mb-3 last:mb-0 leading-relaxed text-sm text-slate-200" {...props} />,

  // ── Links ──
  a: ({node, ...props}) => <a className="text-indigo-400 hover:text-indigo-300 underline decoration-indigo-400/30 underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,

  // ── Bold & Italic ──
  strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
  em: ({node, ...props}) => <em className="text-indigo-300/90 italic" {...props} />,

  // ── Lists ──
  ul: ({node, ...props}) => <ul className="mb-3 last:mb-0 space-y-1.5 pl-1" {...props} />,
  ol: ({node, ...props}) => <ol className="mb-3 last:mb-0 space-y-1.5 pl-1 list-none" {...props} />,
  li: ({node, ordered, index, children, ...rest}) => (
    <li className="flex items-start gap-2 text-sm leading-relaxed text-slate-200" {...rest}>
      {ordered ? (
        <span className="flex-shrink-0 text-indigo-400/80 font-semibold text-xs mt-0.5 min-w-[1.2em]">
          {(index ?? 0) + 1}.
        </span>
      ) : (
        <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400/60" aria-hidden="true" />
      )}
      <span className="flex-1">{children}</span>
    </li>
  ),

  // ── Blockquotes ──
  blockquote: ({node, ...props}) => (
    <blockquote className="border-l-4 border-indigo-500/50 bg-indigo-500/[0.06] rounded-r-lg pl-4 pr-3 py-2.5 my-3 text-sm text-slate-300 italic" {...props} />
  ),

  // ── Horizontal Rule ──
  hr: ({node, ...props}) => <hr className="border-white/[0.08] my-4" {...props} />,

  // ── Code (inline & block) ──
  code: ({node, inline, className, children, ...props}) => {
    if (inline) {
      return (
        <code className="bg-white/[0.08] text-indigo-300 px-1.5 py-0.5 rounded-md text-[13px] font-mono border border-white/[0.06]" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="text-[13px] font-mono text-slate-300 leading-relaxed" {...props}>
        {children}
      </code>
    );
  },
  pre: ({node, ...props}) => (
    <div className="bg-slate-900/80 rounded-xl p-4 overflow-x-auto my-3 border border-white/[0.08] shadow-inner">
      <pre className="m-0" {...props} />
    </div>
  ),

  // ── Tables ──
  table: ({node, ...props}) => (
    <div className="overflow-x-auto my-3 rounded-xl border border-white/[0.08]">
      <table className="w-full text-sm text-left" {...props} />
    </div>
  ),
  thead: ({node, ...props}) => <thead className="bg-white/[0.04] text-xs uppercase text-slate-400 tracking-wider" {...props} />,
  th: ({node, ...props}) => <th className="px-4 py-2.5 font-semibold border-b border-white/[0.08]" {...props} />,
  td: ({node, ...props}) => <td className="px-4 py-2 border-b border-white/[0.04] text-slate-300" {...props} />,
  tr: ({node, ...props}) => <tr className="hover:bg-white/[0.02] transition-colors" {...props} />,
};

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI LifeOS Response',
          text: cleanText,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy(); // Fallback
    }
  };

  // Extract widgets from text
  const extractWidgets = (text) => {
    if (!text) return { cleanText: '', widgets: [] };
    const widgetRegex = /\[WIDGET:\s*([A-Z_]+)\]/g;
    const widgets = [];
    let match;
    while ((match = widgetRegex.exec(text)) !== null) {
      widgets.push(match[1]);
    }
    const cleanText = text.replace(widgetRegex, '').replace(/<!--ACTION:.*?-->/g, '').trim();
    return { cleanText, widgets };
  };

  const { cleanText, widgets } = extractWidgets(message.content);

  const renderWidget = (widgetType, idx) => {
    switch(widgetType) {
      case 'LOG_HABIT':
        return (
          <button key={idx} onClick={() => { hapticTap(); navigate('/habits'); }} className="flex items-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 active:scale-[0.97] text-indigo-300 py-2.5 px-4 rounded-xl shadow-sm transition-all mt-3 text-sm font-semibold border border-indigo-500/30 touch-target">
            <Activity className="w-4 h-4" /> Log a Habit Now
          </button>
        );
      case 'CREATE_GOAL':
        return (
          <button key={idx} onClick={() => { hapticTap(); navigate('/goals'); }} className="flex items-center gap-2 bg-pink-500/20 hover:bg-pink-500/30 active:scale-[0.97] text-pink-300 py-2.5 px-4 rounded-xl shadow-sm transition-all mt-3 text-sm font-semibold border border-pink-500/30 touch-target">
            <Target className="w-4 h-4" /> Create a New Goal
          </button>
        );
      case 'VIEW_CALENDAR':
        return (
          <button key={idx} onClick={() => { hapticTap(); navigate('/calendar'); }} className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-[0.97] text-emerald-300 py-2.5 px-4 rounded-xl shadow-sm transition-all mt-3 text-sm font-semibold border border-emerald-500/30 touch-target">
            <Calendar className="w-4 h-4" /> Open Calendar
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      custom={isUser}
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-5`}
    >
      <div 
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 shadow-card backdrop-blur-xl ${
          isUser 
            ? 'bg-indigo-600/80 text-white rounded-br-md border border-indigo-500/30' 
            : 'bg-white/[0.04] text-slate-100 border border-white/[0.06] rounded-bl-md'
        }`}
        style={!isUser ? { backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 50%)' } : {}}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient flex items-center justify-center text-[9px] font-bold shadow-glow-sm">
              AI
            </div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              LifeOS
            </span>
          </div>
        )}
        
        <div className={`max-w-none ${isUser ? 'text-white' : 'text-slate-200'}`}>
          {isUser ? (
            <div className="flex flex-col gap-2">
              {message.attachedDocDetails && (
                <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg w-max border border-white/10 shadow-inner">
                  <Paperclip className="w-4 h-4 text-indigo-300" />
                  <span className="text-xs font-medium text-slate-100">{message.attachedDocDetails.originalName}</span>
                </div>
              )}
              <p className="whitespace-pre-wrap m-0 leading-relaxed text-sm">{message.content}</p>
            </div>
          ) : (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {cleanText || '...'}
            </ReactMarkdown>
          )}
        </div>

        {/* Render Extracted Interactive Widgets */}
        {widgets.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {widgets.map((widget, idx) => renderWidget(widget, idx))}
          </div>
        )}

        {message.actions && message.actions.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.actions.map((action, idx) => (
              <ActionBadge key={idx} action={action} />
            ))}
          </div>
        )}

        {message.isStreaming && (
          <span className="inline-block w-1.5 h-5 ml-1 bg-indigo-400 animate-pulse align-middle rounded-sm"></span>
        )}

        {!isUser && !message.isStreaming && (
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/[0.06] text-slate-400">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[11px] hover:text-indigo-300 transition-colors"
              title="Copy response"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? <span className="text-emerald-400">Copied!</span> : 'Copy'}
            </button>
            <button 
              onClick={() => speakText(cleanText, true)}
              className="flex items-center gap-1.5 text-[11px] hover:text-indigo-300 transition-colors"
              title="Read aloud"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Play
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 text-[11px] hover:text-indigo-300 transition-colors"
              title="Share response"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <button 
              className="flex items-center gap-1.5 text-[11px] hover:text-indigo-300 transition-colors"
              title="Branch from here"
            >
              <GitBranch className="w-3.5 h-3.5" />
              Branch
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
