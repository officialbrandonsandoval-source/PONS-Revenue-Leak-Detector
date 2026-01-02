const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pons-api.vercel.app'

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

// ============================================
// TYPES
// ============================================

export interface Leak {
  id: string
  type: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  estimatedRevenue: number
  recommendedAction: string
  relatedIds?: string[]
}

export interface LeadScore {
  leadId: string
  score: number
  tier: 'HOT' | 'WARM' | 'COLD' | 'DEAD'
  breakdown: {
    source: number
    engagement: number
    recency: number
    completeness: number
    fit: number
  }
  recommendation: {
    action: string
    urgency: string
    message: string
  }
  rank: number
}

export interface DealPriority {
  dealId: string
  dealName: string
  value: number
  priorityScore: number
  expectedValue: number
  urgency: 'IMMEDIATE' | 'TODAY' | 'THIS_WEEK' | 'SCHEDULED'
  scores: {
    value: number
    probability: number
    velocity: number
    decay: number
    effort: number
  }
  recommendation: {
    action: string
    message: string
    tactic: string
  }
  rank: number
}

export interface Action {
  id: string
  type: string
  priority: number
  urgency: 'IMMEDIATE' | 'TODAY' | 'THIS_WEEK' | 'SCHEDULED'
  title: string
  description: string
  estimatedRevenue: number
  timeToExecute: string
  relatedId: string
}

export interface AnalysisResult {
  summary: {
    healthScore: number
    totalPipelineValue: number
    weightedPipelineValue: number
    revenueAtRisk: number
    leakCount: number
    criticalIssues: number
    actionableItems: number
  }
  nextBestAction: Action | null
  focusList: Action[]
  leadScoring: {
    leads: LeadScore[]
    summary: {
      total: number
      hot: number
      warm: number
      cold: number
      dead: number
      avgScore: number
    }
  }
  dealPrioritization: {
    deals: DealPriority[]
    summary: {
      totalDeals: number
      totalPipelineValue: number
      weightedPipelineValue: number
      avgPriorityScore: number
      urgentCount: number
    }
    focusList: Array<{
      rank: number
      name: string
      value: number
      urgency: string
      action: string
    }>
  }
  leakDetection: {
    leaks: Leak[]
    summary: {
      totalLeaks: number
      criticalCount: number
      highCount: number
      mediumCount: number
      lowCount: number
      totalEstimatedRevenue: number
    }
  }
  insights: Array<{
    type: string
    message: string
  }>
  analyzedAt: string
}

export interface QuickAnalysis {
  hotLeads: number
  topDeal: DealPriority | null
  pipelineValue: number
  nextAction: Action | null
  message: string
  analyzedAt: string
}

export interface VoiceSummary {
  text: string
  data: QuickAnalysis
  generatedAt: string
}

// ============================================
// API FUNCTIONS
// ============================================

// Health Check
export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  return apiRequest('/health')
}

// Full Analysis
export async function runFullAnalysis(data: {
  leads?: any[]
  contacts?: any[]
  opportunities?: any[]
  activities?: any[]
  reps?: any[]
  includeAI?: boolean
}): Promise<AnalysisResult> {
  return apiRequest('/analyze', { method: 'POST', body: data })
}

// Quick Analysis
export async function runQuickAnalysis(data: {
  leads?: any[]
  opportunities?: any[]
  activities?: any[]
}): Promise<QuickAnalysis> {
  return apiRequest('/analyze/quick', { method: 'POST', body: data })
}

// Voice Summary
export async function getVoiceSummary(data: {
  leads?: any[]
  opportunities?: any[]
  activities?: any[]
}): Promise<VoiceSummary> {
  return apiRequest('/analyze/voice', { method: 'POST', body: data })
}

// Lead Scoring
export async function scoreLeads(data: {
  leads: any[]
  activities?: any[]
}): Promise<{
  leads: LeadScore[]
  summary: {
    total: number
    hot: number
    warm: number
    cold: number
    dead: number
    avgScore: number
  }
}> {
  return apiRequest('/leads/score', { method: 'POST', body: data })
}

// Deal Prioritization
export async function prioritizeDeals(data: {
  opportunities: any[]
  activities?: any[]
}): Promise<{
  deals: DealPriority[]
  summary: {
    totalDeals: number
    totalPipelineValue: number
    weightedPipelineValue: number
    avgPriorityScore: number
    urgentCount: number
  }
  focusList: Array<{
    rank: number
    name: string
    value: number
    urgency: string
    action: string
  }>
}> {
  return apiRequest('/deals/prioritize', { method: 'POST', body: data })
}

// Action Recommendations
export async function getActions(data: {
  leads?: any[]
  opportunities?: any[]
  activities?: any[]
  leadScores?: LeadScore[]
  dealPriorities?: DealPriority[]
  leaks?: Leak[]
}): Promise<{
  actions: Action[]
  nextBestAction: Action | null
  summary: {
    totalActions: number
    immediateCount: number
    todayCount: number
    totalPotentialRevenue: number
  }
}> {
  return apiRequest('/actions', { method: 'POST', body: data })
}

// Next Best Action
export async function getNextBestAction(data: {
  leads?: any[]
  opportunities?: any[]
  activities?: any[]
  leadScores?: LeadScore[]
  dealPriorities?: DealPriority[]
  leaks?: Leak[]
}): Promise<{
  action: Action | null
  message: string
  revenue?: number
  urgency?: string
  timeRequired?: string
}> {
  return apiRequest('/actions/next', { method: 'POST', body: data })
}

// Leak Detection
export async function detectLeaks(data: {
  leads?: any[]
  contacts?: any[]
  opportunities?: any[]
  activities?: any[]
  reps?: any[]
  includeAI?: boolean
}): Promise<{
  leaks: Leak[]
  summary: {
    totalLeaks: number
    criticalCount: number
    highCount: number
    mediumCount: number
    lowCount: number
    totalEstimatedRevenue: number
  }
  aiInsights?: any
}> {
  return apiRequest('/leaks/analyze', { method: 'POST', body: data })
}
