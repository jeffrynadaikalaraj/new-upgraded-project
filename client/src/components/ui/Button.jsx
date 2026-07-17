import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  icon: Icon,
  className = '',
  ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0f1e] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-brand-600 hover:bg-brand-500 text-white focus:ring-brand-500 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:shadow-xl border border-brand-500/20",
    gradient: "bg-gradient hover:opacity-95 text-white focus:ring-brand-500 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:shadow-xl border border-white/10",
    secondary: "bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] hover:border-white/[0.15] focus:ring-slate-500 shadow-inner-glow",
    ghost: "bg-transparent hover:bg-white/[0.05] text-slate-300 focus:ring-slate-500",
    danger: "bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 border border-rose-500/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
