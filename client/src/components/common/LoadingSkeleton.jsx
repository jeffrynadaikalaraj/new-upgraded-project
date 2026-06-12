import React from 'react';
import { motion } from 'framer-motion';

export const PageSkeleton = ({ title, showHeader = true }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-900 w-full relative">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-800/10 rounded-full blur-3xl pointer-events-none" />
      
      {showHeader && (
        <div className="flex items-center justify-between p-8 pb-4 relative z-10 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-800 animate-pulse" />
              <h1 className="text-3xl font-bold text-white">{title}</h1>
            </div>
            <div className="w-48 h-4 bg-slate-800 rounded animate-pulse mt-2" />
          </div>
          <div className="w-24 h-10 rounded-xl bg-slate-800 animate-pulse" />
        </div>
      )}

      <div className="flex-1 overflow-hidden p-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-slate-800/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
};
