import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ActionBadge from './ActionBadge';
import { useNavigate } from 'react-router-dom';
import { Target, Activity, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { isNativePlatform } from '../../utils/platform';

// Trigger light haptic feedback on native platforms
const hapticTap = async () => {
  if (isNativePlatform()) {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
  }
};

const bubbleVariants = {
  hidden: (isUser) => ({
    opacity: 0,
    x: isUser ? 30 : -30,
    scale: 0.95,
  }),
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const navigate = useNavigate();

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
          <button key={idx} onClick={() => { hapticTap(); navigate('/habits'); }} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white py-3 px-4 rounded-lg shadow-md transition-all mt-3 text-sm font-medium border border-indigo-400 touch-target">
            <Activity className="w-4 h-4" /> Log a Habit Now
          </button>
        );
      case 'CREATE_GOAL':
        return (
          <button key={idx} onClick={() => { hapticTap(); navigate('/goals'); }} className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white py-3 px-4 rounded-lg shadow-md transition-all mt-3 text-sm font-medium border border-rose-400 touch-target">
            <Target className="w-4 h-4" /> Create a New Goal
          </button>
        );
      case 'VIEW_CALENDAR':
        return (
          <button key={idx} onClick={() => { hapticTap(); navigate('/calendar'); }} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white py-3 px-4 rounded-lg shadow-md transition-all mt-3 text-sm font-medium border border-emerald-400 touch-target">
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
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div 
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 shadow-xl backdrop-blur-md ${
          isUser 
            ? 'bg-indigo-600/90 text-white rounded-br-sm border border-indigo-500/50' 
            : 'bg-slate-800/80 text-slate-100 border border-slate-700/80 rounded-bl-sm'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient flex items-center justify-center text-xs font-bold shadow-sm">
              AI
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              LifeOS
            </span>
          </div>
        )}
        
        <div className={`prose prose-invert max-w-none ${isUser ? 'text-white' : 'text-slate-200'}`}>
          {isUser ? (
            <p className="whitespace-pre-wrap m-0 leading-relaxed">{message.content}</p>
          ) : (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({node, ...props}) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
                a: ({node, ...props}) => <a className="text-indigo-400 hover:text-indigo-300 underline" {...props} />,
                code: ({node, inline, ...props}) => 
                  inline ? (
                    <code className="bg-slate-900/50 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                  ) : (
                    <div className="bg-slate-900/80 rounded-lg p-4 overflow-x-auto my-4 border border-slate-700/50">
                      <code className="text-sm font-mono text-slate-300" {...props} />
                    </div>
                  )
              }}
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
          <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-400 animate-pulse align-middle"></span>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
