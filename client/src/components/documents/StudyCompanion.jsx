import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, HelpCircle, LayoutList, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const StudyCompanion = ({ doc }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); // { type: 'mcq' | 'flashcards' | 'explain', content: any }
  const [topic, setTopic] = useState('');
  const [userAnswers, setUserAnswers] = useState({});

  const generateMCQs = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/study/${doc._id}/mcq`);
      setData({ type: 'mcq', content: res.data.data });
      setUserAnswers({});
    } catch (err) {
      console.error(err);
      alert('Failed to generate MCQs');
    }
    setLoading(false);
  };

  const generateFlashcards = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/study/${doc._id}/flashcards`);
      setData({ type: 'flashcards', content: res.data.data });
    } catch (err) {
      console.error(err);
      alert('Failed to generate Flashcards');
    }
    setLoading(false);
  };

  const explainTopic = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(`/study/${doc._id}/explain`, { topic });
      setData({ type: 'explain', content: res.data.data });
    } catch (err) {
      console.error(err);
      alert('Failed to explain topic');
    }
    setLoading(false);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-10 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
          <p className="animate-pulse">AI is reading the document and generating content...</p>
        </div>
      );
    }

    if (!data) {
      return (
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <BookOpen size={24} className="text-slate-500" />
          </div>
          <p className="text-slate-400">Select an option above to generate study materials.</p>
        </div>
      );
    }

    if (data.type === 'mcq') {
      return (
        <div className="space-y-6">
          {data.content.map((q, qIndex) => (
            <div key={qIndex} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-sm font-semibold text-slate-200 mb-3">{qIndex + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, oIndex) => {
                  const isSelected = userAnswers[qIndex] === oIndex;
                  const isCorrect = q.correctAnswer === oIndex;
                  const showResult = userAnswers[qIndex] !== undefined;

                  let btnClass = "w-full text-left p-3 rounded-lg text-sm border transition-colors ";
                  if (showResult) {
                    if (isCorrect) btnClass += "bg-emerald-500/10 border-emerald-500/50 text-emerald-400";
                    else if (isSelected) btnClass += "bg-rose-500/10 border-rose-500/50 text-rose-400";
                    else btnClass += "bg-slate-800/50 border-slate-700 text-slate-400 opacity-50";
                  } else {
                    btnClass += "bg-slate-800 border-slate-700 hover:border-indigo-500/50 text-slate-300";
                  }

                  return (
                    <button
                      key={oIndex}
                      disabled={showResult}
                      onClick={() => setUserAnswers({ ...userAnswers, [qIndex]: oIndex })}
                      className={btnClass}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {userAnswers[qIndex] !== undefined && (
                <div className="mt-4 p-3 bg-indigo-500/10 rounded-lg text-sm text-indigo-200 border border-indigo-500/20">
                  <span className="font-bold">Explanation:</span> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (data.type === 'flashcards') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.content.map((card, i) => (
            <div key={i} className="group perspective-1000">
              <div className="relative w-full h-40 transition-transform duration-500 transform-style-3d group-hover:rotate-y-180">
                {/* Front */}
                <div className="absolute w-full h-full bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-center text-center backface-hidden">
                  <p className="text-sm font-bold text-slate-200">{card.front}</p>
                </div>
                {/* Back */}
                <div className="absolute w-full h-full bg-indigo-600 border border-indigo-500 rounded-xl p-4 flex items-center justify-center text-center backface-hidden rotate-y-180">
                  <p className="text-sm font-medium text-white">{card.back}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (data.type === 'explain') {
      return (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">AI Explanation</h3>
          </div>
          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {data.content}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden">
      {/* Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap gap-3 items-center">
        <button
          onClick={generateMCQs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-medium transition-colors border border-indigo-500/20"
        >
          <HelpCircle size={16} /> Generate MCQs
        </button>
        <button
          onClick={generateFlashcards}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium transition-colors border border-purple-500/20"
        >
          <LayoutList size={16} /> Flashcards
        </button>
        <div className="flex flex-1 min-w-[200px] gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic to explain..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={explainTopic}
            disabled={loading || !topic.trim()}
            className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium transition-colors border border-emerald-500/20"
          >
            Explain
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {renderContent()}
      </div>
      
      {/* Required CSS for Flashcards 3D effect */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </div>
  );
};

export default StudyCompanion;
