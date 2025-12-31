const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
}

async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }
  
  if (body) {
    config.body = JSON.stringify(body)
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, config)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `API error: ${response.status}`)
  }
  
  return response.json()
}

// CRM Connection
export interface ConnectRequest {
  provider: 'ghl' | 'hubspot' | 'salesforce' | 'pipedrive' | 'zoho' | 'webhook'
  credentials: Record<string, string>
}

export interface ConnectResponse {
  success: boolean
  provider: string
  message: string
}

export async function connectCRM(data: ConnectRequest): Promise<ConnectResponse> {
  return apiRequest('/connect', { method: 'POST', body: data })
}

// Leak Detection
export interface Leak {
  id: string
  type: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  revenueAtRisk: number
  affectedRecords: number
  detectedAt: string
  recommendation: string
  tags?: string[]
}

export interface LeaksResponse {
  success: boolean
  provider: string
  leaks: Leak[]
  summary: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    totalRevenueAtRisk: number
  }
  repKPIs?: any[]
  aiInsights?: {
    criticalIssues: string[]
    quickWins: string[]
    weeklyFocus: string
    healthScore: number
  }
  analyzedAt: string
}

export async function runLeakDetection(
  provider: string,
  credentials: Record<string, string>
): Promise<LeaksResponse> {
  return apiRequest('/leaks', {
    method: 'POST',
    body: { provider, credentials },
  })
}

export async function getLeakSummary(
  provider: string,
  credentials: Record<string, string>
): Promise<LeaksResponse> {
  return apiRequest('/leaks/summary', {
    method: 'POST',
    body: { provider, credentials },
  })
}

// Rep KPIs
export interface RepKPI {
  repId: string
  repName: string
  totalDeals: number
  openDeals: number
  wonDeals: number
  lostDeals: number
  winRate: number
  totalRevenue: number
  avgDealSize: number
  activityCount: number
  staleDeals: number
}

export async function getRepKPIs(
  provider: string,
  credentials: Record<string, string>
): Promise<{ success: boolean; repKPIs: RepKPI[] }> {
  return apiRequest('/reps/kpis', {
    method: 'POST',
    body: { provider, credentials },
  })
}

// Executive Report
export interface ExecutiveReport {
  success: boolean
  report: string
  generatedAt: string
}

export async function getExecutiveReport(
  provider: string,
  credentials: Record<string, string>
): Promise<ExecutiveReport> {
  return apiRequest('/reports/executive', {
    method: 'POST',
    body: { provider, credentials },
  })
}

// Health Check
export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  return apiRequest('/health')
}

// Providers List
export async function getProviders(): Promise<{ providers: string[] }> {
  return apiRequest('/providers')
}
