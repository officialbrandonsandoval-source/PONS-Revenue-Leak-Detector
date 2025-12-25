import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

const PaymentPage: React.FC = () => {
  const handleReturn = () => {
    // Navigate to root to clear query params and start fresh
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-sm w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-green-500/10 blur-3xl rounded-full"></div>

        <div className="relative z-10 flex flex-col items-center">
          <BrandLogo className="h-8 w-auto mb-8 text-white opacity-80" />

          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Payment successful</h1>
          <p className="text-zinc-400 text-sm mb-1">Your access is active.</p>
          <p className="text-zinc-500 text-sm mb-8">Return to PONS to run your revenue audit.</p>

          <button 
            onClick={handleReturn}
            className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            Return to PONS <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;