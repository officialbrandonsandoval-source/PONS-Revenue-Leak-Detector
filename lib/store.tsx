'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Leak, LeaksResponse, RepKPI } from './api'

interface CRMConnection {
  provider: string
  credentials: Record<string, string>
  connected: boolean
  connectedAt?: string
}

interface AppState {
  // Connection
  connection: CRMConnection | null
  setConnection: (conn: CRMConnection | null) => void
  
  // Audit Results
  leaks: Leak[]
  setLeaks: (leaks: Leak[]) => void
  leakSummary: LeaksResponse['summary'] | null
  setLeakSummary: (summary: LeaksResponse['summary'] | null) => void
  aiInsights: LeaksResponse['aiInsights'] | null
  setAiInsights: (insights: LeaksResponse['aiInsights'] | null) => void
  
  // Rep Data
  repKPIs: RepKPI[]
  setRepKPIs: (kpis: RepKPI[]) => void
  
  // UI State
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  isManagerMode: boolean
  setIsManagerMode: (mode: boolean) => void
  isUpgradeMode: boolean
  setIsUpgradeMode: (mode: boolean) => void
  
  // Voice State
  isVoiceActive: boolean
  setIsVoiceActive: (active: boolean) => void
  voiceTranscript: string
  setVoiceTranscript: (text: string) => void
  
  // Clear all data
  clearAll: () => void
}

const AppContext = createContext<AppState | null>(null)

const STORAGE_KEY = 'pons_connection'

export function AppProvider({ children }: { children: ReactNode }) {
  const [connection, setConnectionState] = useState<CRMConnection | null>(null)
  const [leaks, setLeaks] = useState<Leak[]>([])
  const [leakSummary, setLeakSummary] = useState<LeaksResponse['summary'] | null>(null)
  const [aiInsights, setAiInsights] = useState<LeaksResponse['aiInsights'] | null>(null)
  const [repKPIs, setRepKPIs] = useState<RepKPI[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isManagerMode, setIsManagerMode] = useState(false)
  const [isUpgradeMode, setIsUpgradeMode] = useState(false)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  
  // Load connection from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setConnectionState(parsed)
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])
  
  // Save connection to localStorage
  const setConnection = (conn: CRMConnection | null) => {
    setConnectionState(conn)
    if (conn) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conn))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
  
  const clearAll = () => {
    setConnection(null)
    setLeaks([])
    setLeakSummary(null)
    setAiInsights(null)
    setRepKPIs([])
    setIsManagerMode(false)
    setIsUpgradeMode(false)
  }
  
  return (
    <AppContext.Provider
      value={{
        connection,
        setConnection,
        leaks,
        setLeaks,
        leakSummary,
        setLeakSummary,
        aiInsights,
        setAiInsights,
        repKPIs,
        setRepKPIs,
        isLoading,
        setIsLoading,
        isManagerMode,
        setIsManagerMode,
        isUpgradeMode,
        setIsUpgradeMode,
        isVoiceActive,
        setIsVoiceActive,
        voiceTranscript,
        setVoiceTranscript,
        clearAll,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
