import React, { useState } from 'react';
import { Cloud, Hexagon, Kanban, Box, Lock, CheckCircle2, ArrowRight, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { CRMProvider, CRMCredentials } from '../types';
import { CRM_PROVIDERS, authenticateCRM } from '../services/crmAdapter.ts';

interface CRMConnectProps {
  onConnected: () => void;
  onDemoMode: () => void;
}

const CRMConnect: React.FC<CRMConnectProps> = ({ onConnected, onDemoMode }) => {
  const [selectedProvider, setSelectedProvider] = useState<CRMProvider>('salesforce');
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);
    setIsConnecting(true);
    
    const result = await authenticateCRM({
      provider: selectedProvider,
      apiKey: apiKey
    });

    if (result.success) {
      onConnected();
    } else {
      setError(result.error || 'Connection Failed');
      setIsConnecting(false);
    }
  };

  const getIcon = (provider: string) => {
    switch (provider) {
      case 'salesforce': return <Cloud size={24} />;
      case 'hubspot': return <Hexagon size={24} />;
      case 'pipedrive': return <Kanban size={24} />;
      case 'zoho': return <Box size={24} />;
      case 'gohighlevel': return <Zap size={24} />;
      default: return <Cloud size={24} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
      
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-zinc-900 rounded-xl border border-zinc-800 mx-auto flex items-center justify-center mb-4 shadow-2xl">
            <Lock size={20} className="text-zinc-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Connect Data Source</h1>
          <p className="text-zinc-500 text-sm">PONS requires read-only access to your CRM to detect revenue leaks.</p>
        </div>

        {/* Provider Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(Object.keys(CRM_PROVIDERS) as CRMProvider[]).map((providerKey) => {
             const provider = CRM_PROVIDERS[providerKey];
             const isSelected = selectedProvider === providerKey;
             
             return (
               <button
                 key={provider.id}
                 onClick={() => setSelectedProvider(provider.id)}
                 className={`p-4 rounded-lg border flex flex-col items-center gap-3 transition-all duration-200 ${
                   isSelected 
                     ? 'bg-blue-600/10 border-blue-600/50 text-blue-100 ring-1 ring-blue-600/50' 
                     : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                 }`}
               >
                 <div className={isSelected ? 'text-blue-500' : 'text-zinc-600'}>
                    {getIcon(provider.id)}
                 </div>
                 <span className="text-xs font-bold uppercase tracking-wider">{provider.name}</span>
               </button>
             );
          })}
        </div>

        {/* Credentials Form */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4 shadow-xl">
           <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={14} className="text-green-500" />
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Secure TLS 1.3 Connection</span>
           </div>
           
           <div className="space-y-2">
             <label className="text-xs font-medium text-zinc-300 block">
                {CRM_PROVIDERS[selectedProvider].name} API Key
             </label>
             <input 
               type="password" 
               value={apiKey}
               onChange={(e) => setApiKey(e.target.value)}
               placeholder="sk_live_..."
               className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-zinc-700 font-mono"
             />
           </div>

           {error && (
             <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                {error}
             </div>
           )}

           <button 
             onClick={handleConnect}
             disabled={isConnecting || !apiKey}
             className="w-full bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
           >
             {isConnecting ? (
               <>
                 <Loader2 size={16} className="animate-spin" />
                 Verifying Credentials...
               </>
             ) : (
               <>
                 Authenticate & Sync
                 <ArrowRight size={16} />
               </>
             )}
           </button>
           
           <p className="text-center text-[10px] text-zinc-600 pt-2">
             By connecting, you agree to PONS processing your data in memory. No data is stored persistently.
           </p>
        </div>
        
        <div className="mt-8 text-center">
          <button 
            onClick={onDemoMode}
            className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors border-b border-transparent hover:border-zinc-400 pb-0.5"
          >
            Don't have an API key? Try Simulation
          </button>
        </div>
      </div>
    </div>
  );
};

export default CRMConnect;