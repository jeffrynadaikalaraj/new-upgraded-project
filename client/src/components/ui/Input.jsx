import React from 'react';

const Input = React.forwardRef(({ 
  label, 
  error, 
  icon: Icon,
  className = '', 
  containerClassName = '',
  ...props 
}, ref) => {
  return (
    <div className={`flex flex-col w-full ${containerClassName}`}>
      {label && (
        <label className="mb-2 text-sm font-semibold text-slate-300 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className="h-4.5 w-4.5 text-slate-500 group-focus-within:text-brand-400 transition-colors duration-300" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-white/[0.03] border ${error ? 'border-rose-500/50' : 'border-white/[0.08]'} 
            rounded-xl text-slate-100 placeholder-slate-500
            focus:outline-none focus:ring-2 ${error ? 'focus:ring-rose-500/40' : 'focus:ring-brand-500/30 focus:border-brand-500/40'}
            hover:border-white/[0.12] hover:bg-white/[0.04]
            transition-all duration-300
            ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5
            shadow-inner-glow
            ${className}
          `}
          {...props}
        />
        {/* Focus glow effect */}
        <div className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 opacity-0 group-focus-within:opacity-100 ${error ? 'shadow-[0_0_0_1px_rgba(244,63,94,0.15)]' : 'shadow-[0_0_15px_-3px_rgba(99,102,241,0.15)]'}`} />
      </div>
      {error && (
        <p className="mt-2 text-xs text-rose-400 font-medium flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
