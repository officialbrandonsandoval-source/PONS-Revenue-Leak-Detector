import React from 'react';
import { Play, ShieldAlert, TrendingUp } from 'lucide-react';

interface DemoIntroProps {
  onStart: () => void;
}

const DemoIntro: React.FC<DemoIntroProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-md w-full border border-zinc-800 bg-zinc-900/50 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
             <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <Play size={16} fill="white" className="text-white" />
             </div>
             <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Simulation Loaded</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome, VP of Sales.</h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            We have connected PONS to a <span className="text-zinc-200 font-semibold">sandbox CRM</span> containing typical revenue leakage patterns.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
               <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={20} />
               <div>
                  <h3 className="text-zinc-200 font-bold text-sm">The Problem</h3>
                  <p className="text-zinc-500 text-sm">Your pipeline looks healthy, but revenue is slipping through cracks invisible to standard dashboards.</p>
               </div>
            </div>
            <div className="flex items-start gap-3">
               <TrendingUp className="text-green-500 shrink-0 mt-0.5" size={20} />
               <div>
                  <h3 className="text-zinc-200 font-bold text-sm">Your Mission</h3>
                  <p className="text-zinc-500 text-sm">Run the audit. Identify the leaks. Take the single highest-ROI action available.</p>
               </div>
            </div>
          </div>

          <button 
            onClick={onStart}
            className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Start Simulation
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoIntro;