import React from 'react';

export interface BrandLogoProps {
  variant?: 'horizontal' | 'compact' | 'mark-only' | 'one-color';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  inverted?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  inverted = false,
}) => {
  const markDimensions = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }[size];

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
  }[size];

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  }[size];

  const textColor = inverted ? 'text-white' : 'text-brand-ink';
  const mutedColor = inverted ? 'text-slate-400' : 'text-brand-steel';
  const markBg = inverted ? 'bg-white text-slate-900' : 'bg-brand-ink text-brand-paper';
  const accentDot = inverted ? 'bg-amber-400' : 'bg-brand-metal';

  if (variant === 'mark-only') {
    return (
      <div className={`inline-flex items-center justify-center rounded-lg ${markBg} ${markDimensions} ${className}`} aria-label="Vial Foundry Logo">
        <svg className="w-1/2 h-1/2" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 4H13V6H11.5V8.5L15 14C15.5 14.8 15 16 14 16H6C5 16 4.5 14.8 5 14L8.5 8.5V6H7V4Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="10" cy="12" r="1.2" className={accentDot.replace('bg-', 'fill-')} />
        </svg>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center space-x-2.5 ${className}`}>
        <div className={`inline-flex items-center justify-center rounded-lg ${markBg} ${markDimensions} shrink-0`}>
          <svg className="w-1/2 h-1/2" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 4H13V6H11.5V8.5L15 14C15.5 14.8 15 16 14 16H6C5 16 4.5 14.8 5 14L8.5 8.5V6H7V4Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="10" cy="12" r="1.2" fill="currentColor" />
          </svg>
        </div>
        <span className={`font-display font-bold tracking-tight ${textColor} ${titleSizes}`}>
          VIAL FOUNDRY
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-3 ${className}`}>
      <div className={`inline-flex items-center justify-center rounded-lg ${markBg} ${markDimensions} shrink-0 shadow-xs transition-colors`}>
        <svg className="w-1/2 h-1/2" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 4H13V6H11.5V8.5L15 14C15.5 14.8 15 16 14 16H6C5 16 4.5 14.8 5 14L8.5 8.5V6H7V4Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="10" cy="12" r="1.2" fill="#A47342" />
        </svg>
      </div>
      <div className="flex flex-col text-left leading-none">
        <span className={`font-display font-bold tracking-tight ${textColor} ${titleSizes}`}>
          VIAL <span className={inverted ? 'text-slate-300 font-medium' : 'text-brand-graphite font-medium'}>FOUNDRY</span>
        </span>
        <span className={`font-sans uppercase tracking-[0.18em] font-medium mt-1 ${mutedColor} ${subtitleSizes}`}>
          Research Materials
        </span>
      </div>
    </div>
  );
};
