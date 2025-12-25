import React from 'react';

export const BrandLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* P: Stem + Underline connecting to S */}
    <path 
      d="M20 10 V 52 H 180 C 200 52 205 45 195 38 C 185 31 180 34 180 22 C 180 10 200 10 210 12" 
      stroke="currentColor" 
      strokeWidth="8" 
      strokeLinecap="square" 
      strokeLinejoin="round"
    />
    
    {/* P: Loop */}
    <path d="M20 10 H 50 C 65 10 65 32 50 32 H 20" stroke="currentColor" strokeWidth="8" strokeLinecap="square" />

    {/* O */}
    <rect x="75" y="10" width="30" height="30" rx="15" stroke="currentColor" strokeWidth="8" />

    {/* N */}
    <path d="M125 40 V 10 L 155 40 V 10" stroke="currentColor" strokeWidth="8" strokeLinecap="square" strokeLinejoin="round" />
  </svg>
);