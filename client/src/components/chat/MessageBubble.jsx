import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ActionBadge from './ActionBadge';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div 
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 ${
          isUser 
            ? 'bg-indigo-600 text-white rounded-br-sm' 
            : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-sm shadow-md'
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
              {message.content?.replace(/<!--ACTION:.*?-->/g, '') || '...'}
            </ReactMarkdown>
          )}
        </div>

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
    </div>
  );
};

export default MessageBubble;
