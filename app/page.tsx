'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Cloud, Database, BarChart3, FileSpreadsheet, Zap, Play } from 'lucide-react';
import Image from 'next/image';

const CRM_OPTIONS = [
  { id: 'salesforce', name: 'SALESFORCE', icon: Cloud, placeholder: 'Enter Salesforce API key...' },
  { id: 'hubspot', name: 'HUBSPOT', icon: Database, placeholder: 'Enter HubSpot API key...' },
  { id: 'pipedrive', name: 'PIPEDRIVE', icon: BarChart3, placeholder: 'Enter Pipedrive API key...' },
  { id: 'zoho', name: 'ZOHO CRM', icon: FileSpreadsheet, placeholder: 'Enter Zoho API key...' },
  { id: 'gohighlevel', name: 'GOHIGHLEVEL', icon: Zap, placeholder: 'ghl_...' },
  { id: 'demo', name: 'DEMO DATA', icon: Play, placeholder: '' },
];

export default function ConnectPage() {
  const router = useRouter();
  const { setConnected, setLeaks } = useApp();
  const [selectedCRM, setSelectedCRM] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    if (!selectedCRM) return;
    
    setLoading(true);
    setError('');

    try {
      if (selectedCRM === 'demo') {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pons-api.vercel.app'}/leaks/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
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
              { id: 'l1', firstName: 'New', lastName: 'Prospect', status: 'new', createdAt: '2025-12-20', leadSource: 'Website' },
              { id: 'l2', firstName: 'Warm', lastName: 'Lead', status: 'new', createdAt: '2025-12-01', leadSource: 'Referral' },
              { id: 'l3', firstName: 'Cold', lastName: 'Contact', status: 'new', createdAt: '2025-11-15', leadSource: 'Trade Show' },
            ],
            contacts: [
              { id: 'c1', name: 'John Smith', email: 'john@acme.com' },
              { id: 'c2', name: 'Sarah Johnson', email: 'sarah@techstart.com' },
              { id: 'c3', name: 'Mike Williams', email: 'mike@globalco.com' },
              { id: 'c4', name: 'Lisa Brown', email: '' },
              { id: 'c5', name: 'David Chen', email: 'david@megacorp.com' },
            ],
            reps: [
              { id: 'rep1', name: 'Alex Turner', active: true },
              { id: 'rep2', name: 'Jordan Lee', active: true },
            ],
            includeAI: false
          })
        });

        if (!response.ok) throw new Error('Failed to load demo data');

        const data = await response.json();
        setLeaks(data.leaks || []);
        setConnected(true, 'demo');
        router.push('/dashboard');
      } else {
        if (!apiKey) {
          setError('API key is required');
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pons-api.vercel.app'}/connect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ crm: selectedCRM, config: { apiKey } })
        });

        const data = await response.json();
        if (!response.ok || !data.connected) throw new Error(data.error || 'Connection failed');

        const leaksResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pons-api.vercel.app'}/leaks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ crm: selectedCRM, config: { apiKey }, includeAI: false })
        });

        const leaksData = await leaksResponse.json();
        setLeaks(leaksData.leaks || []);
        setConnected(true, selectedCRM);
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedCRMData = CRM_OPTIONS.find(c => c.id === selectedCRM);
  const isDemo = selectedCRM === 'demo';

  return (
    <div className="min-h-screen bg-[#0f0a1a] flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8">
        <Image 
          src="/logo.svg" 
          alt="PONS" 
          width={200} 
          height={200}
          className="drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]"
          priority
        />
      </div>
      
      <h2 className="text-xl font-medium text-white mb-2">Connect Your CRM</h2>
      <p className="text-gray-400 text-center mb-8 max-w-md text-sm">
        PONS requires read-only access to detect revenue leaks in your pipeline.
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-6">
        {CRM_OPTIONS.map((crm) => {
          const Icon = crm.icon;
          const isSelected = selectedCRM === crm.id;
          
          return (
            <button
              key={crm.id}
              onClick={() => setSelectedCRM(crm.id)}
              className={`
                p-5 rounded-xl border transition-all flex flex-col items-center gap-2
                ${isSelected 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-gray-800 bg-gray-900/50 hover:border-purple-500/50 hover:bg-purple-500/5'}
                ${crm.id === 'demo' ? 'col-span-2 bg-gradient-to-r from-purple-900/20 to-amber-900/20 border-purple-500/30' : ''}
              `}
            >
              <Icon className={`w-7 h-7 ${isSelected ? 'text-purple-400' : crm.id === 'demo' ? 'text-amber-400' : 'text-gray-500'}`} />
              <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>{crm.name}</span>
              {crm.id === 'demo' && <span className="text-xs text-gray-500">Try PONS with sample data</span>}
            </button>
          );
        })}
      </div>

      {selectedCRM && (
        <div className="w-full max-w-md bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-2 text-green-500 text-sm mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            SECURE TLS 1.3 CONNECTION
          </div>

          {isDemo ? (
            <>
              <p className="text-gray-400 text-sm mb-4">
                Load sample CRM data to explore PONS features. Includes realistic opportunities, leads, and activities.
              </p>
              <button onClick={handleConnect} disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-amber-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Loading Demo...</>
                ) : (
                  <><Play className="w-5 h-5" /> Launch Demo</>
                )}
              </button>
            </>
          ) : (
            <>
              <label className="block text-gray-400 text-sm mb-2">{selectedCRMData?.name} API Key</label>
              <input 
                type="password" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                placeholder={selectedCRMData?.placeholder || 'Enter API key...'}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 mb-4 focus:outline-none focus:border-purple-500" 
              />
              <button onClick={handleConnect} disabled={loading || !apiKey}
                className="w-full py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Connecting...</>
                ) : (
                  <>Connect & Analyze <span>→</span></>
                )}
              </button>
            </>
          )}

          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
          <p className="text-gray-500 text-xs text-center mt-4">
            By connecting, you agree to PONS processing your data in memory. No data is stored.
          </p>
        </div>
      )}

      <p className="text-gray-600 text-xs mt-8">Revenue Intelligence Platform</p>
    </div>
  );
}
