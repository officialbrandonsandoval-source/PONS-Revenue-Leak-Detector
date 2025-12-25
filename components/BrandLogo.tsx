import React from 'react';

export const BrandLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 220 65" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* P Loop */}
    <path d="M20 10 H 40 C 52 10 52 34 40 34 H 20" stroke="currentColor" strokeWidth="10" strokeLinecap="square" />
    
    {/* Connected Path: P Stem -> Underline -> S Shape */}
    <path d="M20 10 V 55 H 180 C 200 55 200 40 185 40 H 175 C 160 40 160 25 175 25 H 195" stroke="currentColor" strokeWidth="10" strokeLinecap="square" />

    {/* O */}
    <rect x="65" y="10" width="32" height="32" rx="16" stroke="currentColor" strokeWidth="10" />

    {/* N */}
    <path d="M115 42 V 10 L 145 42 V 10" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" strokeLinecap="square" />
  </svg>
);