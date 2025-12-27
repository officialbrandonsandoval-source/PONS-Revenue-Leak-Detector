import React, { useState } from 'react';
import { X, Check, Shield, Zap, Lock, Loader2, ArrowRight, AlertTriangle } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { createCheckoutSession } from '../services/billingService';
import toast from 'react-hot-toast';

// --- STRIPE CONFIGURATION ---
// ----------------------------

interface UpgradePlanProps {
  onClose: () => void;
}

const UpgradePlan: React.FC<UpgradePlanProps> = ({ onClose }) => {
  const [processingState, setProcessingState] = useState<'IDLE' | 'REDIRECTING' | 'SUCCESS'>('IDLE');
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setProcessingState('REDIRECTING');
    setError(null);
    
    try {
      const url = await createCheckoutSession(billingCycle);
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error', err);
      setError('Stripe checkout failed. Please try again.');
      toast.error('Stripe checkout failed');
      setProcessingState('IDLE');
    }
  };

  if (processingState === 'SUCCESS') {
      return (
        <div className="fixed inset-0 z-[60] bg-zinc-950 flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
             <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-green-500" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">Upgrade Successful</h2>
             <p className="text-zinc-500">Unlocking Enterprise Intelligence...</p>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950/95 backdrop-blur-xl overflow-y-auto animate-in slide-in-from-bottom-[5%] duration-300">
      <div className="max-w-md mx-auto min-h-screen flex flex-col p-6">
        
        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
            <BrandLogo className="h-6 w-auto text-white" />
            <button onClick={onClose} className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Hero */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Zap size={12} fill="currentColor" />
                Stop Revenue Leaks
            </div>
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
                Upgrade to PONS Professional
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">
                Recover an average of <span className="text-zinc-200 font-semibold">$24,000/mo</span> in lost pipeline revenue.
            </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
            <div className="bg-zinc-900 p-1 rounded-lg border border-zinc-800 flex relative">
                <button 
                  onClick={() => setBillingCycle('MONTHLY')}
                  className={`px-4 py-1.5 rounded text-xs font-bold transition-all relative z-10 ${billingCycle === 'MONTHLY' ? 'text-white' : 'text-zinc-500'}`}
                >
                    Monthly
                </button>
                <button 
                  onClick={() => setBillingCycle('YEARLY')}
                  className={`px-4 py-1.5 rounded text-xs font-bold transition-all relative z-10 flex items-center gap-1 ${billingCycle === 'YEARLY' ? 'text-white' : 'text-zinc-500'}`}
                >
                    Yearly <span className="text-[9px] text-green-400 font-normal ml-1">-16%</span>
                </button>
                <div className={`absolute top-1 bottom-1 w-[50%] bg-zinc-800 rounded shadow-sm transition-all duration-300 ${billingCycle === 'MONTHLY' ? 'left-1' : 'left-[48%]'}`}></div>
            </div>
        </div>

        {/* Pricing Card */}
        <div className="relative group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-blue-600 to-indigo-900 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-2xl">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h3 className="text-white font-bold text-lg">Professional</h3>
                        <p className="text-zinc-500 text-xs mt-1">Full pipeline coverage</p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-bold text-white tracking-tight">
                            {billingCycle === 'MONTHLY' ? '$149' : '$1,499'}
                        </span>
                        <span className="text-zinc-500 text-xs font-medium">
                            {billingCycle === 'MONTHLY' ? '/mo' : '/yr'}
                        </span>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <FeatureItem text="Unlimited Revenue Audits" />
                    <FeatureItem text="Real-time PONS Analyst (Voice/Chat)" />
                    <FeatureItem text="Aggressive Mode (Critical Leaks)" />
                    <FeatureItem text="Salesforce & HubSpot Write-back" />
                    <FeatureItem text="Priority Processing" />
                </div>

                <button 
                    onClick={handleCheckout}
                    disabled={processingState !== 'IDLE'}
                    className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-[0_0_20px_rgba(255,255,255,0.1)] mb-3"
                >
                    {processingState === 'REDIRECTING' ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Redirecting to Stripe...
                        </>
                    ) : (
                        <>
                            Proceed to Checkout <ArrowRight size={18} />
                        </>
                    )}
                </button>

                {error && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                    <AlertTriangle size={12} />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-center gap-2 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Lock size={10} /> Powered by Stripe
                    </span>
                </div>
            </div>
        </div>

        {/* Trust Footer */}
        <div className="mt-auto text-center space-y-4 pb-4">
            <div className="flex items-center justify-center gap-2 text-zinc-400 text-xs">
                <Shield size={14} className="text-zinc-500" />
                <span>Encrypted. Secure. Cancel anytime.</span>
            </div>
            <button className="text-zinc-600 text-[10px] hover:text-white uppercase tracking-widest font-bold">
                Restore Purchase
            </button>
        </div>

      </div>
    </div>
  );
};

const FeatureItem: React.FC<{text: string}> = ({ text }) => (
    <div className="flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Check size={10} className="text-blue-400" />
        </div>
        <span className="text-zinc-300 text-sm">{text}</span>
    </div>
);

export default UpgradePlan;
