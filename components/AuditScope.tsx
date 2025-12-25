import React, { useState } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal, Flame } from 'lucide-react';
import { AuditConfig } from '../types';

interface AuditScopeProps {
  config: AuditConfig;
  setConfig: React.Dispatch<React.SetStateAction<AuditConfig>>;
}

const AuditScope: React.FC<AuditScopeProps> = ({ config, setConfig }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAggressive = () => {
    setConfig(prev => ({ ...prev, isAggressive: !prev.isAggressive }));
  };

  // If in Aggressive Mode, we force focus and hide the expanded filters
  if (config.isAggressive) {
    return (
      <div className="w-full border-b border-red-900/30 bg-red-950/10">
        <div className="w-full max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-500 animate-pulse">
            <Flame size={14} fill="currentColor" />
            <span className="text-xs font-black uppercase tracking-widest">Upgrade Mode Active</span>
          </div>
          <button 
             onClick={toggleAggressive}
             className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest border border-zinc-800 rounded px-2 py-1"
          >
            Disable
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border-b border-zinc-800 bg-zinc-900/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full max-w-md mx-auto px-4 py-3 flex items-center justify-between text-zinc-400 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} />
          <span className="text-xs font-medium uppercase tracking-widest">Audit Scope</span>
        </div>
        <div className="flex items-center gap-4">
           {/* Aggressive Toggle Mini */}
           <div 
             onClick={(e) => { e.stopPropagation(); toggleAggressive(); }}
             className="flex items-center gap-1 cursor-pointer group"
           >
              <span className="text-[10px] uppercase font-bold text-zinc-600 group-hover:text-red-400 transition-colors">Upgrade Mode</span>
              <div className="w-8 h-4 rounded-full bg-zinc-800 border border-zinc-700 relative">
                 <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-zinc-600 rounded-full"></div>
              </div>
           </div>
           {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isOpen && (
        <div className="max-w-md mx-auto px-4 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-zinc-500 font-bold">Pipeline Stage</label>
              <select className="w-full bg-zinc-800 text-sm text-white px-3 py-2 rounded border border-zinc-700 focus:border-blue-500 outline-none">
                <option>All Active</option>
                <option>Proposal</option>
                <option>Closing</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-zinc-500 font-bold">Rep / Team</label>
              <select className="w-full bg-zinc-800 text-sm text-white px-3 py-2 rounded border border-zinc-700 focus:border-blue-500 outline-none">
                <option>Global Sales</option>
                <option>North America</option>
                <option>EMEA</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
             <label className="text-[10px] uppercase text-zinc-500 font-bold">Lead Sources</label>
             <div className="flex flex-wrap gap-2">
                {config.sources.map(s => (
                  <span key={s} className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300">
                    {s}
                  </span>
                ))}
                <span className="px-2 py-1 border border-zinc-700 border-dashed rounded text-xs text-zinc-500">
                  + Add Source
                </span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditScope;