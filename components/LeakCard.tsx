import React, { useState } from 'react';
import { RevenueLeak } from '../types';
import { AlertTriangle, DollarSign, Clock, CheckCircle2, ChevronRight, Siren, Volume2, Flame } from 'lucide-react';
import { playLeakAudio } from '../services/aiService';

interface LeakCardProps {
  leak: RevenueLeak;
  rank: number;
  isAggressive?: boolean;
}

const LeakCard: React.FC<LeakCardProps> = ({ leak, rank, isAggressive = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const severityColor = {
    LOW: 'text-zinc-400 bg-zinc-400/10',
    MEDIUM: 'text-orange-400 bg-orange-400/10',
    CRITICAL: 'text-red-500 bg-red-500/10',
  };

  const borderClass = leak.severity === 'CRITICAL' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-zinc-700';
  
  // Aggressive Mode Overrides
  const bgClass = isAggressive ? 'bg-zinc-900/80' : 'bg-zinc-900';
  const displayCause = isAggressive ? leak.consequence : leak.cause;
  const actionBtnClass = isAggressive 
    ? 'bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider' 
    : 'bg-blue-600 hover:bg-blue-500 text-white font-bold';

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    const textToRead = `Revenue Leak detected: ${leak.name}. Risk amount: ${formatCurrency(leak.revenueAtRisk)}. Root cause: ${leak.cause}. Recommended Action: ${leak.recommendedAction}`;
    playLeakAudio(textToRead).then(() => {
        setTimeout(() => setIsPlaying(false), 5000); // Reset state roughly after play
    });
  };

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className={`w-full ${bgClass} border-y border-r border-zinc-800 ${borderClass} mb-3 overflow-hidden transition-all active:scale-[0.99] duration-150 cursor-pointer group relative`}
    >
      {isAggressive && (
         <div className="absolute top-0 right-0 p-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
         </div>
      )}

      {/* Card Header / Summary */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-zinc-500 font-mono text-xs">#{rank}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${severityColor[leak.severity]}`}>
              {leak.severity}
            </span>
            {leak.isSlaBreach && (
              <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider text-red-100 bg-red-600/80 shadow-[0_0_8px_rgba(220,38,38,0.4)] animate-pulse">
                SLA BREACH
              </span>
            )}
          </div>
          <div className={`flex items-center font-bold text-lg tracking-tight whitespace-nowrap ml-2 ${isAggressive ? 'text-red-100' : 'text-zinc-100'}`}>
            <span className="text-zinc-500 mr-1 text-xs font-normal uppercase mt-1">Risk:</span>
            {formatCurrency(leak.revenueAtRisk)}
          </div>
        </div>

        <div className="flex justify-between items-start gap-4">
            <h3 className={`font-medium text-base mb-1 leading-tight transition-colors ${isAggressive ? 'text-white font-bold' : 'text-white group-hover:text-blue-400'}`}>
            {leak.name}
            </h3>
            <button 
                onClick={handlePlayAudio}
                className={`p-1.5 rounded-full hover:bg-zinc-800 transition-colors shrink-0 ${isPlaying ? 'text-blue-400 animate-pulse' : 'text-zinc-600'}`}
            >
                <Volume2 size={16} />
            </button>
        </div>
        
        <p className={`${isAggressive ? 'text-red-300/80 font-medium' : 'text-zinc-400'} text-sm line-clamp-1`}>
          {displayCause}
        </p>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 bg-zinc-900 border-t border-zinc-800/50 animate-in slide-in-from-top-2 fade-in duration-200">
          
          <div className="mt-4 space-y-4">
            
            {/* Aggressive: Deal List */}
            {isAggressive && leak.dealIds && (
               <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                  {leak.dealIds.map(id => (
                     <span key={id} className="text-[10px] font-mono bg-zinc-950 border border-zinc-800 text-zinc-400 px-2 py-1 rounded">
                        Deal {id}
                     </span>
                  ))}
               </div>
            )}

            {/* Time Sensitivity */}
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
              <div>
                 <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Time Sensitivity</p>
                 <p className="text-zinc-300 text-sm font-medium">{leak.timeSensitivity}</p>
                 {isAggressive && (
                    <p className="text-[10px] text-red-500 mt-1 animate-pulse">
                       ACTION REQUIRED IMMEDIATELY
                    </p>
                 )}
              </div>
            </div>

            {/* Cause Full Text */}
            <div className="flex items-start gap-3">
               {isAggressive ? <Flame className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />}
               <div>
                  <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
                     {isAggressive ? 'Financial Consequence' : 'Root Cause'}
                  </p>
                  <p className="text-zinc-300 text-sm">{displayCause}</p>
               </div>
            </div>

            {/* Action Block */}
            <div className={`${isAggressive ? 'bg-red-900/10 border-red-500/30' : 'bg-blue-900/20 border-blue-500/30'} border rounded p-3 mt-2`}>
              <div className="flex items-start gap-3">
                <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${isAggressive ? 'text-red-500' : 'text-blue-400'}`} />
                <div className="w-full">
                  <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isAggressive ? 'text-red-400' : 'text-blue-400'}`}>Recommended Action</p>
                  <p className={`${isAggressive ? 'text-red-100 font-bold' : 'text-blue-100 font-semibold'} text-sm leading-relaxed`}>
                    {leak.recommendedAction}
                  </p>
                  <button className={`mt-3 w-full ${actionBtnClass} text-sm py-2 rounded transition-colors flex items-center justify-center gap-2`}>
                    Execute Now <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default LeakCard;