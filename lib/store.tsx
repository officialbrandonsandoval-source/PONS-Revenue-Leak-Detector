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
  crm: string;
  apiKey?: string;
  accessToken?: string;
  locationId?: string;
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

  const setConnected = (connected: boolean, crm?: string, config?: CRMConfig) => {
    setIsConnected(connected);
    if (crm) setCrmType(crm);
    if (config) setCrmConfig(config);
  };

  const setLeaks = (newLeaks: Leak[]) => {
    setLeaksState(newLeaks);
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

  const refreshLeaks = async () => {
    if (!crmConfig) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/leaks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crm: crmConfig.crm,
          config: {
            apiKey: crmConfig.apiKey,
            accessToken: crmConfig.accessToken,
            locationId: crmConfig.locationId,
          },
          includeAI: false
        })
      });
      
      if (!response.ok) throw new Error('Failed to refresh leaks');
      
      const data = await response.json();
      setLeaksState(data.leaks || []);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setCrmType(null);
    setCrmConfig(null);
    setLeaksState([]);
    setRepKPIsState([]);
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
