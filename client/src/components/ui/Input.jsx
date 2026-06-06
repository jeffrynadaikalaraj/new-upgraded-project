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
        <label className="mb-1.5 text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-500" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-slate-800/50 border ${error ? 'border-rose-500' : 'border-slate-700'} 
            rounded-lg text-slate-100 placeholder-slate-500
            focus:outline-none focus:ring-2 ${error ? 'focus:ring-rose-500' : 'focus:ring-indigo-500 focus:border-transparent'}
            transition-all duration-200
            ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-rose-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
