import React from 'react';

const Card = ({ children, className = '', gradientBorder = false, hover = false }) => {
  if (gradientBorder) {
    return (
      <div className={`relative p-[1px] rounded-xl bg-gradient overflow-hidden ${hover ? 'transition-transform duration-300 hover:-translate-y-1' : ''}`}>
        <div className={`glass rounded-xl h-full w-full ${className}`}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`glass rounded-xl ${hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/30' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
