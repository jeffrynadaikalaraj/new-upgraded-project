import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Send, Sparkles, ChevronDown, ChevronUp, X, AlertTriangle } from 'lucide-react';
import { useDocumentStore } from '../stores/documentStore';
import UploadZone from '../components/documents/UploadZone';
import DocumentCard from '../components/documents/DocumentCard';
import StudyCompanion from '../components/documents/StudyCompanion';
import ConfirmDialog from '../components/common/ConfirmDialog';
import MessageBubble from '../components/chat/MessageBubble';

// ─── Document Viewer Panel ────────────────────────────────────────────────────
const DocumentViewer = ({ doc, onClose }) => {
  const { askQuestion, isAsking } = useDocumentStore();
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [showExtracted, setShowExtracted] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'study'

  const handleAsk = async () => {
    if (!question.trim()) return;
    const userMessage = { role: 'user', content: question.trim() };
    setChatHistory(prev => [...prev, userMessage]);
    setQuestion('');
    try {
      const result = await askQuestion(doc._id, userMessage.content);
      setChatHistory(prev => [...prev, { role: 'assistant', content: result }]);
    } catch (_) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Failed to get an answer. Please try again.' }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="flex flex-col h-full bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-700/40 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-indigo-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-100 truncate">{doc.originalName}</p>
            <p className="text-xs text-slate-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1 flex-shrink-0">
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-5 pt-3 border-b border-slate-700/40">
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'details' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
        >
          Details & Q&A
        </button>
        <button
          onClick={() => setActiveTab('study')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'study' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
        >
          Study Companion
        </button>
      </div>

      {activeTab === 'details' ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
        {/* Summary */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-indigo-400" />
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Summary</p>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4">
            {doc.summary || 'No summary available.'}
          </p>
        </div>

        {/* Tags */}
        {doc.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {doc.tags.map((tag, i) => (
              <span key={i} className="text-xs bg-slate-700/50 text-slate-400 border border-slate-600/30 px-2.5 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Extracted Text Toggle */}
        {doc.extractedText && (
          <div>
            <button
              onClick={() => setShowExtracted(s => !s)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors py-1"
            >
              {showExtracted ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showExtracted ? 'Hide' : 'Show'} Extracted Text
            </button>
            <AnimatePresence initial={false}>
              {showExtracted && (
                <motion.div
                  key="extracted"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <pre className="mt-2 text-xs text-slate-400 leading-relaxed bg-slate-900/60 border border-slate-700/30 rounded-xl p-4 whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar font-mono">
                    {doc.extractedText}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Q&A Section */}
        <div className="border-t border-slate-700/40 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-purple-400" />
            <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Ask AI About This Document</p>
          </div>
          
          {/* Chat History */}
          {(chatHistory.length > 0 || isAsking) && (
            <div className="mb-4 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {chatHistory.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {isAsking && (
                <MessageBubble message={{ role: 'assistant', content: '', isStreaming: true }} />
              )}
            </div>
          )}

          <div className="flex gap-2">
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What are the key findings?"
              className="flex-1 bg-slate-700/40 border border-slate-600/40 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
            />
            <button
              onClick={handleAsk}
              disabled={isAsking || !question.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all flex-shrink-0"
            >
              {isAsking
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <StudyCompanion doc={doc} />
        </div>
      )}
    </motion.div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center text-center py-16 px-8"
  >
    <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
      <FileText size={28} className="text-indigo-400" />
    </div>
    <p className="text-slate-300 font-semibold mb-1">📄 Upload your first document</p>
    <p className="text-slate-500 text-sm">AI can summarize and answer questions.</p>
  </motion.div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const GridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {[1,2,3,4].map(i => (
      <div key={i} className="h-36 bg-slate-800/40 border border-slate-700/30 rounded-2xl animate-pulse" />
    ))}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const DocumentsPage = () => {
  const {
    documents, selectedDocument, isLoading, isUploading, uploadProgress, error,
    fetchDocuments, uploadDocument, getDocument, selectDocument, deleteDocument, clearError
  } = useDocumentStore();
  
  const [docToDelete, setDocToDelete] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleCardClick = async (doc) => {
    // If doc already has extractedText (from cache), just select it
    if (doc.extractedText !== undefined) {
      selectDocument(doc);
    } else {
      // Fetch full doc with extractedText
      await getDocument(doc._id);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-900 w-full relative">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between p-8 pb-4 border-b border-slate-800 flex-shrink-0 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="text-indigo-400" size={32} />
            Documents
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Upload files and ask AI questions about them.</p>
        </div>
      </div>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-8 mt-4 flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm relative z-10 flex-shrink-0"
          >
            <span className="flex items-center gap-2"><AlertTriangle size={15} />{error}</span>
            <button onClick={clearError}><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-0 relative z-10">

        {/* Left Panel — Upload + Grid */}
        <div className="flex flex-col lg:w-[420px] xl:w-[480px] flex-shrink-0 border-r border-slate-800 overflow-hidden">
          {/* Upload Zone */}
          <div className="p-6 border-b border-slate-800 flex-shrink-0">
            <UploadZone onUpload={uploadDocument} isUploading={isUploading} uploadProgress={uploadProgress} />
          </div>

          {/* Documents grid */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                My Documents
              </h2>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                {documents.length}
              </span>
            </div>

            {isLoading ? (
              <GridSkeleton />
            ) : documents.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {documents.map((doc, i) => (
                  <DocumentCard
                    key={doc._id}
                    doc={doc}
                    index={i}
                    isSelected={selectedDocument?._id === doc._id}
                    onClick={() => handleCardClick(doc)}
                    onDelete={() => setDocToDelete(doc._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel — Document Viewer */}
        <div className="flex-1 overflow-hidden p-6">
          <AnimatePresence mode="wait">
            {selectedDocument ? (
              <DocumentViewer
                key={selectedDocument._id}
                doc={selectedDocument}
                onClose={() => selectDocument(null)}
              />
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className="w-20 h-20 rounded-full bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mb-4">
                  <FileText size={32} className="text-slate-600" />
                </div>
                <p className="text-slate-500 font-medium">Select a document to view</p>
                <p className="text-slate-600 text-sm mt-1">Click any document on the left to read its summary and ask questions.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
      
      <ConfirmDialog
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={() => deleteDocument(docToDelete)}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

export default DocumentsPage;
