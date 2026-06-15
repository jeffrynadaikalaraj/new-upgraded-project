import React from 'react';
import { FileQuestion } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = FileQuestion, 
  title = "No items found", 
  description = "Get started by creating your first item.",
  actionButton = null 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-800/30 rounded-xl border border-slate-800 border-dashed w-full my-4">
      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-200 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {actionButton}
    </div>
  );
};

export default EmptyState;
