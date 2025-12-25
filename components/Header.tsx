import React from 'react';
import { User, ShieldAlert, Crown } from 'lucide-react';

interface HeaderProps {
  onManagerMode?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onManagerMode }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-100 rounded flex items-center justify-center">
            <span className="text-zinc-950 font-black text-lg">P</span>
          </div>
        </div>

        {/* Center: Title */}
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-bold tracking-tight text-white">
            Revenue Leak Detector
          </h1>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
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
          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <User size={16} className="text-zinc-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;