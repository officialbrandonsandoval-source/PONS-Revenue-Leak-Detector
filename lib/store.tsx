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

interface AppState {
  isConnected: boolean;
  crmType: string | null;
  leaks: Leak[];
  repKPIs: RepKPI[];
  isVoiceActive: boolean;
  isManagerMode: boolean;
  setConnected: (connected: boolean, crm?: string) => void;
  setLeaks: (leaks: Leak[]) => void;
  setRepKPIs: (kpis: RepKPI[]) => void;
  setVoiceActive: (active: boolean) => void;
  setManagerMode: (active: boolean) => void;
  disconnect: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [crmType, setCrmType] = useState<string | null>(null);
  const [leaks, setLeaksState] = useState<Leak[]>([]);
  const [repKPIs, setRepKPIsState] = useState<RepKPI[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isManagerMode, setIsManagerMode] = useState(false);

  const setConnected = (connected: boolean, crm?: string) => {
    setIsConnected(connected);
    if (crm) setCrmType(crm);
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

  const disconnect = () => {
    setIsConnected(false);
    setCrmType(null);
    setLeaksState([]);
    setRepKPIsState([]);
  };

  return (
    <AppContext.Provider value={{
      isConnected,
      crmType,
      leaks,
      repKPIs,
      isVoiceActive,
      isManagerMode,
      setConnected,
      setLeaks,
      setRepKPIs,
      setVoiceActive,
      setManagerMode,
      disconnect
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
