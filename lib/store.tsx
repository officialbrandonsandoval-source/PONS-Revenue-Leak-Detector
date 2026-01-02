'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface Leak {
  id: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  recommendedAction: string;
  impactedCount: number;
  estimatedRevenue: number;
  relatedIds: string[];
  metadata?: Record<string, unknown>;
}

interface RepKPI {
  repId: string;
  repName: string;
  totalOpportunities: number;
  openOpportunities: number;
  wonOpportunities: number;
  winRate: number;
  totalRevenue: number;
  activitiesThisWeek: number;
  staleDeals: number;
}

interface CRMConfig {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  locationId?: string;
  [key: string]: string | undefined;
}

interface AppState {
  isConnected: boolean;
  crmType: string | null;
  crmConfig: CRMConfig | null;
  leaks: Leak[];
  repKPIs: RepKPI[];
  isVoiceActive: boolean;
  isManagerMode: boolean;
  isLoading: boolean;
  lastRefresh: string | null;
  setConnected: (connected: boolean, crm?: string, config?: CRMConfig) => void;
  setLeaks: (leaks: Leak[]) => void;
  setRepKPIs: (kpis: RepKPI[]) => void;
  setVoiceActive: (active: boolean) => void;
  setManagerMode: (active: boolean) => void;
  setLoading: (loading: boolean) => void;
  disconnect: () => void;
  refreshLeaks: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pons-api.vercel.app';

// Demo data for demo mode
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
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [crmType, setCrmType] = useState<string | null>(null);
  const [crmConfig, setCrmConfig] = useState<CRMConfig | null>(null);
  const [leaks, setLeaksState] = useState<Leak[]>([]);
  const [repKPIs, setRepKPIsState] = useState<RepKPI[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const setConnected = (connected: boolean, crm?: string, config?: CRMConfig) => {
    setIsConnected(connected);
    if (crm) setCrmType(crm);
    if (config) setCrmConfig(config);
  };

  const setLeaks = (newLeaks: Leak[]) => {
    setLeaksState(newLeaks);
    setLastRefresh(new Date().toISOString());
  };

  const setRepKPIs = (kpis: RepKPI[]) => {
    setRepKPIsState(kpis);
  };

  const setVoiceActive = (active: boolean) => {
    setIsVoiceActive(active);
  };

  const setManagerMode = (active: boolean) => {
    setIsManagerMode(active);
  };

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const disconnect = () => {
    setIsConnected(false);
    setCrmType(null);
    setCrmConfig(null);
    setLeaksState([]);
    setRepKPIsState([]);
    setLastRefresh(null);
  };

  const refreshLeaks = async () => {
    if (!crmType) return;
    
    setIsLoading(true);
    try {
      if (crmType === 'demo') {
        // Demo mode - use inline data
        const response = await fetch(`${API_URL}/leaks/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...DEMO_DATA, includeAI: false })
        });
        const data = await response.json();
        setLeaks(data.leaks || []);
        if (data.repKPIs) setRepKPIs(data.repKPIs);
      } else {
        // Real CRM - fetch from provider
        const response = await fetch(`${API_URL}/leaks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            crm: crmType, 
            config: crmConfig,
            includeAI: false 
          })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch leaks');
        }
        
        const data = await response.json();
        setLeaks(data.leaks || []);
        
        // Also fetch rep KPIs
        const kpiResponse = await fetch(`${API_URL}/reps/kpis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ crm: crmType, config: crmConfig })
        });
        
        if (kpiResponse.ok) {
          const kpiData = await kpiResponse.json();
          setRepKPIs(kpiData.kpis || []);
        }
      }
    } catch (error) {
      console.error('Failed to refresh leaks:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{
      isConnected,
      crmType,
      crmConfig,
      leaks,
      repKPIs,
      isVoiceActive,
      isManagerMode,
      isLoading,
      lastRefresh,
      setConnected,
      setLeaks,
      setRepKPIs,
      setVoiceActive,
      setManagerMode,
      setLoading,
      disconnect,
      refreshLeaks
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
