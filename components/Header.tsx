import React from 'react';
import { User, Crown } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  onManagerMode?: () => void;
  onOpenProfile?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onManagerMode, onOpenProfile }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <BrandLogo className="h-6 w-auto text-blue-600" />
        </div>

        {/* Center: Title */}
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-bold tracking-tight text-white hidden sm:block">
            Revenue Leak Detector
          </h1>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider hidden sm:block">
            Fix the leak. Protect revenue.
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {onManagerMode && (
            <button 
              onClick={onManagerMode}
              className="w-8 h-8 rounded-full bg-amber-900/30 border border-amber-700/50 flex items-center justify-center hover:bg-amber-900/50 transition-colors"
              title="Manager Mode"
            >
              <Crown size={14} className="text-amber-500" />
            </button>
          )}
          <button 
            onClick={onOpenProfile}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors"
          >
            <User size={16} className="text-zinc-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;