import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Image, File, X } from 'lucide-react';

const ACCEPTED = '.pdf,.txt,.png,.jpg,.jpeg,.webp';

const getFileIcon = (file) => {
  if (!file) return File;
  const type = file.type || '';
  if (type.includes('image')) return Image;
  if (type === 'text/plain') return FileText;
  return File;
};

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const UploadZone = ({ onUpload, isUploading }) => {
  const [dragging, setDragging] = useState(false);
  const [staged, setStaged] = useState(null);
  const [validationError, setValidationError] = useState('');

  const ALLOWED_TYPES = ['image/png','image/jpeg','image/jpg','image/webp','text/plain','application/pdf'];

  const validate = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationError(`"${file.name}" is not supported. Use PDF, TXT, PNG, or JPG.`);
      return false;
    }
    if (file.size > 20 * 1024 * 1024) {
      setValidationError('File exceeds the 20 MB limit.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleFile = useCallback((file) => {
    if (validate(file)) setStaged(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!staged) return;
    try {
      await onUpload(staged);
      setStaged(null);
    } catch (_) {}
  };

  const FileIcon = getFileIcon(staged);

  return (
    <div className="w-full">
      {/* Drop zone */}
      <label
        htmlFor="doc-upload"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-44 rounded-2xl border-2 border-dashed transition-all cursor-pointer group ${
          dragging
            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-600/60 bg-slate-800/30 hover:border-indigo-500/50 hover:bg-slate-800/50'
        }`}
      >
        <input id="doc-upload" type="file" accept={ACCEPTED} className="hidden" onChange={handleChange} />
        <motion.div animate={{ scale: dragging ? 1.1 : 1 }} transition={{ type: 'spring', stiffness: 300 }}>
          <UploadCloud size={36} className={`mb-3 transition-colors ${dragging ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'}`} />
        </motion.div>
        <p className="text-sm font-semibold text-slate-300">
          {dragging ? 'Drop it here!' : 'Drag & drop or click to upload'}
        </p>
        <p className="text-xs text-slate-500 mt-1">PDF · TXT · PNG · JPG · WebP · Max 20 MB</p>
      </label>

      {/* Validation error */}
      <AnimatePresence>
        {validationError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-xs text-red-400 flex items-center gap-1"
          >
            <X size={12} /> {validationError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Staged file preview */}
      <AnimatePresence>
        {staged && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-xl p-3"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <FileIcon size={18} className="text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{staged.name}</p>
              <p className="text-xs text-slate-500">{formatSize(staged.size)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStaged(null)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                <X size={16} />
              </button>
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              >
                {isUploading ? (
                  <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  'Upload & Analyze'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadZone;
