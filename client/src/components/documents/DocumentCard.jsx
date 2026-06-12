import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, File, Trash2, Calendar } from 'lucide-react';

const getIcon = (mimeType) => {
  if (!mimeType) return File;
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType === 'text/plain') return FileText;
  return File; // PDF and others
};

const getIconColors = (mimeType) => {
  if (!mimeType) return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  if (mimeType.startsWith('image/')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (mimeType === 'text/plain') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  return 'bg-orange-500/10 text-orange-400 border-orange-500/20'; // PDF
};

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DocumentCard = ({ doc, isSelected, onClick, onDelete, index }) => {
  const Icon = getIcon(doc.mimeType);
  const iconColors = getIconColors(doc.mimeType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      onClick={onClick}
      className={`group relative flex flex-col gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
        isSelected
          ? 'bg-indigo-600/10 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
          : 'bg-slate-800/40 border-slate-700/40 hover:border-slate-600 hover:bg-slate-800/60'
      }`}
    >
      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(doc._id); }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-1 rounded-lg hover:bg-red-500/10"
        title="Delete document"
      >
        <Trash2 size={14} />
      </button>

      {/* Icon + type badge */}
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconColors}`}>
        <Icon size={20} />
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0 pr-6">
        <p className="text-sm font-semibold text-slate-200 truncate" title={doc.originalName}>
          {doc.originalName}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{formatSize(doc.size)}</p>
      </div>

      {/* Summary preview */}
      {doc.summary && (
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed border-t border-slate-700/30 pt-2">
          {doc.summary}
        </p>
      )}

      {/* Date */}
      <div className="flex items-center gap-1.5 text-xs text-slate-600">
        <Calendar size={11} />
        {new Date(doc.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
    </motion.div>
  );
};

export default DocumentCard;
