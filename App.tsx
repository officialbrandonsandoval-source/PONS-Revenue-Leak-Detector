import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import AuditScope from './components/AuditScope';
import LeakCard from './components/LeakCard';
import ChatOverlay from './components/ChatOverlay';
import LiveSession from './components/LiveSession';
import CRMConnect from './components/CRMConnect';
import DemoIntro from './components/DemoIntro';
import UpgradePlan from './components/UpgradePlan';
import PaymentPage from './components/PaymentPage';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { runAudit } from './services/auditService';
import { fetchEntitlementStatus, verifyCheckoutSession } from './services/billingService';
import { getStoredAuthToken } from './services/apiClient';
import { RevenueLeak, AuditConfig, FORM_DEFAULTS } from './types';
import { Loader2, Play, Mic, MessageSquare, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const App: React.FC = () => {
  // App States
  const [isCRMConnected, setIsCRMConnected] = useState(false);
  const [showDemoIntro, setShowDemoIntro] = useState(false);
  const [appState, setAppState] = useState<'IDLE' | 'SCANNING' | 'RESULTS'>('IDLE');
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredAuthToken()));
  
  // Data States
  const [leaks, setLeaks] = useState<RevenueLeak[]>([]);
  const [config, setConfig] = useState<AuditConfig>(FORM_DEFAULTS);
  
  // Feature States
  const [showChat, setShowChat] = useState(false);
  const [showLive, setShowLive] = useState(false);
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isEntitled, setIsEntitled] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchEntitlementStatus()
      .then((entitled) => {
        if (mounted) setIsEntitled(entitled);
      })
      .finally(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSuccess = params.get('success') === 'true';
    const sessionId = params.get('session_id');

    if (!isSuccess) return;
    setShowPaymentSuccess(true);

    if (!sessionId) {
      setPaymentFailed(true);
      setShowPaymentSuccess(false);
      return;
    }

    setIsVerifyingPayment(true);
    verifyCheckoutSession(sessionId)
      .then((entitled) => {
        setIsVerifyingPayment(false);
        if (entitled) {
          setIsEntitled(true);
          setShowPaymentSuccess(true);
          toast.success('Payment verified');
        } else {
          setPaymentFailed(true);
          setShowPaymentSuccess(false);
          toast.error('Payment verification failed');
        }
      })
      .catch(() => {
        setIsVerifyingPayment(false);
        setPaymentFailed(true);
        setShowPaymentSuccess(false);
        toast.error('Payment verification failed');
      })
      .finally(() => {
        window.history.replaceState({}, '', window.location.pathname);
      });
  }, []);

  // 1. Payment Success View (Top Priority)
  if (isVerifyingPayment) {
    return <PaymentPage status="verifying" />;
  }
  if (paymentFailed) {
    return <PaymentPage status="failed" />;
  }
  if (showPaymentSuccess) {
    return <PaymentPage status="success" />;
  }
  if (!isAuthenticated) {
    return <Login onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  // 2. Connection & Demo Logic
  if (!isCRMConnected) {
    if (showDemoIntro) {
      return <DemoIntro onStart={() => {
        setIsCRMConnected(true);
        setShowDemoIntro(false);
      }} />;
    }
    return <CRMConnect 
      onConnected={() => setIsCRMConnected(true)} 
      onDemoMode={() => setShowDemoIntro(true)} 
    />;
  }

  const handleRunAudit = async () => {
    setAppState('SCANNING');
    try {
      const results = await runAudit();
      setLeaks(results);
      setAppState('RESULTS');
      toast.success('Audit complete');
    } catch (e) {
      console.error(e);
      setAppState('IDLE');
      toast.error('Audit failed');
    }
  };

  const handleManagerMode = () => {
    setIsManagerMode(true);
    setShowLive(true);
  };

  const handleCloseLive = () => {
    setShowLive(false);
    setIsManagerMode(false); // Reset mode when closed
  };

  // Filter leaks based on Aggressive Mode
  const displayedLeaks = config.isAggressive ? leaks.slice(0, 3) : leaks;

  const requireUpgrade = () => setShowPayment(true);

  return (
    <div className={`min-h-screen pb-20 relative overflow-hidden transition-colors duration-500 ${config.isAggressive ? 'bg-black' : 'bg-zinc-950'}`}>
      <Header 
        onManagerMode={handleManagerMode} 
        onOpenProfile={() => setShowPayment(true)}
        onOpenDashboard={() => setShowDashboard(true)}
      />
      
      <main className="max-w-md mx-auto w-full">
        
        {/* IDLE STATE */}
        {appState === 'IDLE' && (
          <div className="animate-in fade-in duration-500">
            <AuditScope 
              config={config} 
              setConfig={setConfig}
              isEntitled={isEntitled}
              onRequireUpgrade={requireUpgrade}
            />
            
            <div className="px-4 mt-12 flex flex-col items-center">
              <div className="w-full max-w-xs relative group">
                {/* Glow effect */}
                <div className={`absolute -inset-1 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${config.isAggressive ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}></div>
                
                <button 
                  onClick={handleRunAudit}
                  className="relative w-full bg-zinc-100 hover:bg-white text-zinc-950 text-lg font-bold py-6 px-8 rounded-lg shadow-2xl transition-all transform active:scale-95 flex flex-col items-center justify-center gap-2"
                >
                  <span className="flex items-center gap-2">
                    RUN REVENUE AUDIT <Play size={20} fill="currentColor" />
                  </span>
                  <span className="text-[10px] font-normal text-zinc-500 uppercase tracking-widest">
                    ~30 seconds • No data stored
                  </span>
                </button>
              </div>

              <div className="mt-12 text-center space-y-6">
                <div className="p-4 rounded border border-zinc-800 bg-zinc-900/50">
                   <p className="text-zinc-400 text-sm leading-relaxed">
                     PONS connects to your CRM to identify <span className="text-zinc-200 font-semibold">stalled deals</span>, <span className="text-zinc-200 font-semibold">missed follow-ups</span>, and <span className="text-zinc-200 font-semibold">revenue leaks</span> instantly.
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCANNING STATE */}
        {appState === 'SCANNING' && (
          <div className="flex flex-col items-center justify-center pt-32 px-4 animate-in fade-in zoom-in duration-300">
            <Loader2 className={`w-12 h-12 animate-spin mb-6 ${config.isAggressive ? 'text-red-500' : 'text-blue-500'}`} />
            <h2 className="text-xl font-bold text-white mb-2">Analyzing Revenue Pipeline...</h2>
            <div className="w-full max-w-xs space-y-2">
              <div className="h-1 w-full bg-zinc-900 rounded overflow-hidden">
                <div className={`h-full animate-[progress_2.5s_ease-in-out_infinite] w-1/2 ${config.isAggressive ? 'bg-red-600' : 'bg-blue-600'}`}></div>
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                <span>Checking SLA Breaches</span>
                <span>Calculating Risk</span>
              </div>
            </div>
          </div>
        )}

        {/* RESULTS STATE */}
        {appState === 'RESULTS' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Edge Case: No Leaks Found */}
            {leaks.length === 0 ? (
               <div className="flex flex-col items-center justify-center pt-24 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                     <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="text-white font-bold text-lg mb-2">No immediate revenue risk detected.</h2>
                  <p className="text-zinc-500 text-sm">Your pipeline is clean. Good work.</p>
                  <button 
                    onClick={() => setAppState('IDLE')}
                    className="mt-8 text-zinc-400 text-xs hover:text-white underline underline-offset-4"
                  >
                    Run Another Audit
                  </button>
               </div>
            ) : (
              <>
                {/* Results Header */}
                {config.isAggressive ? (
                  <div className="px-4 py-6 border-b border-red-900/30 bg-red-950/10 mb-2">
                     <h2 className="text-lg font-black text-red-500 flex items-center gap-2 tracking-tight">
                        CRITICAL ACTION REQUIRED
                     </h2>
                     <p className="text-xs text-red-400/70 mt-1 font-mono">
                        Showing top 3 highest impact leaks only.
                     </p>
                  </div>
                ) : (
                  <div className="px-4 py-6 border-b border-zinc-900">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      Revenue at Risk
                      <span className="bg-red-500/20 text-red-500 text-xs px-2 py-0.5 rounded border border-red-500/20">
                        {leaks.length} Leaks Detected
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">
                      Sorted by highest ROI action immediately available.
                    </p>
                  </div>
                )}

                <div className="flex flex-col pb-24">
                  {displayedLeaks.map((leak, index) => (
                    <LeakCard 
                      key={leak.id} 
                      leak={leak} 
                      rank={index + 1} 
                      isAggressive={config.isAggressive}
                    />
                  ))}
                  {config.isAggressive && leaks.length > 3 && (
                     <div className="text-center py-4">
                        <p className="text-zinc-600 text-xs italic">
                           + {leaks.length - 3} lower priority leaks hidden for focus
                        </p>
                     </div>
                  )}
                </div>

                <div className="px-4 py-8 text-center">
                  <button 
                    onClick={() => setAppState('IDLE')}
                    className="text-zinc-500 text-xs hover:text-zinc-300 underline underline-offset-4"
                  >
                    Start New Audit
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Buttons for AI - Only show when connected */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-40">
        <button 
          onClick={() => {
            setShowChat(true);
          }}
          className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 text-white shadow-xl transition-all flex items-center justify-center hover:scale-105 active:scale-95"
        >
          <MessageSquare size={24} />
        </button>
        <button 
          onClick={() => setShowLive(true)}
          className={`w-14 h-14 rounded-full text-white shadow-xl transition-all flex items-center justify-center ${config.isAggressive ? 'bg-gradient-to-br from-red-600 to-orange-600 shadow-red-600/30' : 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-600/30'} hover:scale-105 active:scale-95`}
        >
           <Mic size={24} />
        </button>
      </div>

      {/* Overlays */}
      {showChat && <ChatOverlay onClose={() => setShowChat(false)} />}
      {showLive && <LiveSession onClose={handleCloseLive} isManagerMode={isManagerMode} />}
      {showPayment && <UpgradePlan onClose={() => setShowPayment(false)} />}
      {showDashboard && <Dashboard onClose={() => setShowDashboard(false)} />}

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default App;
