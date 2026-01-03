'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Cloud, Database, BarChart3, FileSpreadsheet, Zap, Play, ArrowLeft, Shield } from 'lucide-react';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pons-api.vercel.app';

const DEMO_DATA = {
  opportunities: [
    { id: '1', name: 'Acme Corp Deal', value: 45000, stage: 'proposal', status: 'open', contactId: 'c1', createdAt: '2025-09-01', updatedAt: '2025-09-15', assignedTo: 'rep1' },
    { id: '2', name: 'TechStart Contract', value: 125000, stage: 'negotiation', status: 'open', contactId: 'c2', createdAt: '2025-10-01', updatedAt: '2025-10-20', assignedTo: 'rep1' },
    { id: '3', name: 'GlobalCo Partnership', value: 85000, stage: 'discovery', status: 'open', contactId: 'c3', createdAt: '2025-11-01', updatedAt: '2025-11-10', assignedTo: 'rep2' },
    { id: '4', name: 'Lost Opportunity', value: 35000, status: 'lost', lostReason: '', contactId: 'c4', createdAt: '2025-10-15', updatedAt: '2025-12-01' },
    { id: '5', name: 'MegaCorp Enterprise', value: 250000, stage: 'proposal', status: 'open', contactId: 'c5', createdAt: '2025-08-15', updatedAt: '2025-09-01', assignedTo: 'rep1' },
  ],
  activities: [
    { id: 'a1', contactId: 'c1', type: 'call', performedBy: 'rep1', createdAt: '2025-09-15', outcome: 'completed' },
    { id: 'a2', contactId: 'c2', type: 'email', performedBy: 'rep1', createdAt: '2025-10-20', outcome: 'completed' },
  ],
  leads: [
    { id: 'l1', firstName: 'New', lastName: 'Prospect', email: 'new@prospect.com', phone: '555-0101', status: 'new', createdAt: '2025-12-30', leadSource: 'referral', title: 'VP Sales' },
    { id: 'l2', firstName: 'Warm', lastName: 'Lead', email: 'warm@lead.com', status: 'new', createdAt: '2025-12-25', leadSource: 'demo_request', company: 'BigCo', title: 'Director' },
    { id: 'l3', firstName: 'Cold', lastName: 'Contact', email: 'cold@contact.com', status: 'new', createdAt: '2025-11-15', leadSource: 'trade_show' },
    { id: 'l4', firstName: 'Hot', lastName: 'Buyer', email: 'hot@buyer.com', phone: '555-0199', status: 'new', createdAt: '2026-01-01', leadSource: 'referral', company: 'Enterprise Inc', title: 'CEO' },
  ],
  contacts: [
    { id: 'c1', name: 'John Smith', firstName: 'John', lastName: 'Smith', email: 'john@acme.com' },
    { id: 'c2', name: 'Sarah Johnson', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@techstart.com' },
    { id: 'c3', name: 'Mike Williams', firstName: 'Mike', lastName: 'Williams', email: 'mike@globalco.com' },
    { id: 'c4', name: 'Lisa Brown', firstName: 'Lisa', lastName: 'Brown', email: '' },
    { id: 'c5', name: 'David Chen', firstName: 'David', lastName: 'Chen', email: 'david@megacorp.com' },
  ],
  reps: [{ id: 'rep1', name: 'Alex Turner', active: true }, { id: 'rep2', name: 'Jordan Lee', active: true }]
};

const CRM_OPTIONS = [
  { id: 'demo', name: 'DEMO MODE', icon: Play, desc: 'Try with sample data', highlight: true },
  { id: 'hubspot', name: 'HubSpot', icon: Database, placeholder: 'Enter HubSpot Access Token...' },
  { id: 'ghl', name: 'GoHighLevel', icon: Zap, placeholder: 'Enter GHL API Key...', needsLocation: true },
  { id: 'salesforce', name: 'Salesforce', icon: Cloud, placeholder: 'Enter Salesforce Access Token...' },
  { id: 'pipedrive', name: 'Pipedrive', icon: BarChart3, placeholder: 'Enter Pipedrive API Token...' },
  { id: 'zoho', name: 'Zoho CRM', icon: FileSpreadsheet, placeholder: 'Enter Zoho Access Token...' },
];

export default function ConnectPage() {
  const router = useRouter();
  const { setConnected, setCrmData, setLeaks, setLoading } = useApp();
  const [step, setStep] = useState(1);
  const [selectedCRM, setSelectedCRM] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [locationId, setLocationId] = useState('');
  const [loading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async (crmId?: string) => {
    const crm = crmId || selectedCRM;
    if (!crm) return;
    
    setLocalLoading(true);
    setLoading(true);
    setError('');

    try {
      if (crm === 'demo') {
        const response = await fetch(`${API_URL}/leaks/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...DEMO_DATA, includeAI: false })
        });
        if (!response.ok) throw new Error('Failed to load demo');
        const data = await response.json();
        setCrmData(DEMO_DATA);
        setLeaks(data.leaks || []);
        setConnected(true, 'demo', { crm: 'webhook' });
        router.push('/dashboard');
        return;
      }

      if (!apiKey) { setError('API key required'); return; }

      const crmConfig = {
        crm, apiKey: crm === 'ghl' ? apiKey : undefined,
        accessToken: crm !== 'ghl' ? apiKey : undefined,
        locationId: crm === 'ghl' ? locationId : undefined,
      };

      const res = await fetch(`${API_URL}/connect`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crm, config: crmConfig })
      });
      const data = await res.json();
      if (!res.ok || !data.connected) throw new Error(data.error || 'Connection failed');

      const leaksRes = await fetch(`${API_URL}/leaks`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crm, config: crmConfig, includeAI: false })
      });
      const leaksData = await leaksRes.json();
      if (data.data) setCrmData(data.data);
      setLeaks(leaksData.leaks || []);
      setConnected(true, crm, crmConfig);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  const selectCRM = (id: string) => {
    setSelectedCRM(id);
    if (id === 'demo') handleConnect('demo');
    else setStep(2);
  };

  const crmData = CRM_OPTIONS.find(c => c.id === selectedCRM);

  return (
    <div className="min-h-screen bg-[#0f0a1a] flex flex-col">
      <div className="px-6 py-4 flex items-center justify-between">
        <button onClick={() => step === 1 ? router.push('/') : setStep(1)} className="p-2 -ml-2 text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Image src="/logo.svg" alt="PONS" width={100} height={35} priority />
        <div className="w-9" />
      </div>

      <div className="px-6 mb-8">
        <div className="max-w-md mx-auto flex gap-2">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-purple-500' : 'bg-gray-800'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-purple-500' : 'bg-gray-800'}`} />
        </div>
      </div>

      <div className="flex-1 px-6 pb-8">
        <div className="max-w-md mx-auto">
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-white text-center mb-2">Connect Your CRM</h1>
              <p className="text-gray-400 text-center mb-8">Choose your CRM to get started</p>
              <div className="space-y-3">
                {CRM_OPTIONS.map((crm) => (
                  <button key={crm.id} onClick={() => selectCRM(crm.id)}
                    className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${crm.highlight ? 'bg-gradient-to-r from-purple-900/30 to-amber-900/20 border-purple-500/50 hover:border-purple-400' : 'bg-gray-900/50 border-gray-800 hover:border-purple-500/50'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${crm.highlight ? 'bg-purple-500/20' : 'bg-gray-800'}`}>
                      <crm.icon className={`w-6 h-6 ${crm.highlight ? 'text-purple-400' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-left">
                      <div className={`font-medium ${crm.highlight ? 'text-white' : 'text-gray-200'}`}>{crm.name}</div>
                      {crm.desc && <div className="text-sm text-gray-500">{crm.desc}</div>}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && crmData && (
            <>
              <h1 className="text-2xl font-bold text-white text-center mb-2">Connect {crmData.name}</h1>
              <p className="text-gray-400 text-center mb-8">Enter your API credentials</p>
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center gap-2 text-green-500 text-sm mb-6">
                  <Shield className="w-4 h-4" /><span>Secure, read-only connection</span>
                </div>
                <label className="block text-gray-400 text-sm mb-2">{selectedCRM === 'ghl' ? 'API Key' : 'Access Token'}</label>
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={crmData.placeholder} autoFocus
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 mb-4 focus:outline-none focus:border-purple-500" />
                {crmData.needsLocation && (
                  <>
                    <label className="block text-gray-400 text-sm mb-2">Location ID</label>
                    <input type="text" value={locationId} onChange={(e) => setLocationId(e.target.value)} placeholder="Enter GHL Location ID..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 mb-4 focus:outline-none focus:border-purple-500" />
                  </>
                )}
                {error && <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg mb-4"><p className="text-red-400 text-sm">{error}</p></div>}
                <button onClick={() => handleConnect()} disabled={loading || !apiKey}
                  className="w-full py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Connecting...</> : <>Connect & Analyze</>}
                </button>
              </div>
              <p className="text-gray-500 text-xs text-center mt-4">PONS only reads your data. We never modify or delete anything.</p>
            </>
          )}
        </div>
      </div>

      {loading && selectedCRM === 'demo' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-medium">Loading demo data...</p>
            <p className="text-gray-400 text-sm">Analyzing your pipeline</p>
          </div>
        </div>
      )}
    </div>
  );
}
