import React, { useState } from 'react';
import { X, Check, Shield, Zap, Lock, CreditCard, Loader2, ArrowRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface UpgradePlanProps {
  onClose: () => void;
}

const UpgradePlan: React.FC<UpgradePlanProps> = ({ onClose }) => {
  const [processingState, setProcessingState] = useState<'IDLE' | 'REDIRECTING' | 'SUCCESS'>('IDLE');

  const handleSubscribe = () => {
    setProcessingState('REDIRECTING');
    // Mock Stripe Delay
    setTimeout(() => {
        setProcessingState('SUCCESS');
        setTimeout(() => {
            onClose();
        }, 1500);
    }, 2500);
  };

  if (processingState === 'SUCCESS') {
      return (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
             <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-green-500" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">Subscription Active</h2>
             <p className="text-zinc-500">Redirecting to Intelligence Dashboard...</p>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 overflow-y-auto animate-in slide-in-from-bottom-10 duration-300">
      <div className="max-w-md mx-auto min-h-screen flex flex-col p-6">
        
        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
            <BrandLogo className="h-6 w-auto text-blue-600" />
            <button onClick={onClose} className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white">
                <X size={20} />
            </button>
        </div>

        {/* Hero */}
        <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-600/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                <Zap size={12} fill="currentColor" />
                Enterprise Velocity
            </div>
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
                Unlock Full Revenue Intelligence
            </h1>
            <p className="text-zinc-400 text-lg">
                Stop estimating. Start recovering lost revenue with precision AI.
            </p>
        </div>

        {/* Pricing Card */}
        <div className="relative group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-white font-bold text-lg">PONS Professional</h3>
                        <p className="text-zinc-500 text-xs">For high-velocity sales teams</p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-bold text-white">$499</span>
                        <span className="text-zinc-500 text-sm">/mo</span>
                    </div>
                </div>

                <div className="border-t border-zinc-800 my-6"></div>

                <ul className="space-y-4 mb-8">
                    <FeatureItem text="Unlimited Revenue Audits" />
                    <FeatureItem text="Real-time PONS Analyst (Voice/Chat)" />
                    <FeatureItem text="Aggressive Mode (Critical Leaks)" />
                    <FeatureItem text="Manager Mode (Team Analytics)" />
                    <FeatureItem text="Salesforce / HubSpot Deep Sync" />
                    <FeatureItem text="Priority API Processing" />
                </ul>

                <button 
                    onClick={handleSubscribe}
                    disabled={processingState !== 'IDLE'}
                    className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                >
                    {processingState === 'REDIRECTING' ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Connecting Stripe...
                        </>
                    ) : (
                        <>
                            Subscribe via Stripe <ArrowRight size={18} />
                        </>
                    )}
                </button>
                <div className="flex items-center justify-center gap-2 mt-4 text-zinc-600 text-[10px] uppercase font-bold tracking-wider">
                    <Lock size={10} />
                    Secure Payment processing
                    <div className="flex gap-1 ml-1 opacity-50">
                       <div className="w-2 h-2 rounded-full bg-zinc-500"></div>
                       <div className="w-2 h-2 rounded-full bg-zinc-500"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* ROI Proof */}
        <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-500 font-bold text-sm">
                <Shield size={16} />
                <span>30-Day Money Back Guarantee</span>
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-xs mx-auto">
                Teams using PONS Professional recover an average of $24,000 in lost pipeline revenue within the first 14 days of activation.
            </p>
        </div>

      </div>
    </div>
  );
};

const FeatureItem: React.FC<{text: string}> = ({ text }) => (
    <li className="flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
            <Check size={12} className="text-blue-400" />
        </div>
        <span className="text-zinc-300 text-sm font-medium">{text}</span>
    </li>
);

export default UpgradePlan;