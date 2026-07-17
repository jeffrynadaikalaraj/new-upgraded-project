import React from 'react';

const Card = ({ children, className = '', gradientBorder = false, hover = false, glow = false }) => {
  if (gradientBorder) {
    return (
      <div className={`gradient-border-card ${hover ? 'transition-transform duration-500 hover:-translate-y-1' : ''}`}>
        <div className={`p-[1px] h-full w-full ${className}`}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`${hover ? 'premium-card-hover' : 'premium-card'} ${glow ? 'shadow-glow-sm hover:shadow-glow-md' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
