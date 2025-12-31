'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'
import { runLeakDetection } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Play, Volume2, ChevronDown, Settings2 } from 'lucide-react'

export default function DashboardPage() {
  const { 
    connection, 
    leaks, 
    setLeaks, 
    leakSummary, 
    setLeakSummary,
    setAiInsights,
    isLoading, 
    setIsLoading,
    isUpgradeMode,
    setIsUpgradeMode
  } = useApp()
  
  const [hasRunAudit, setHasRunAudit] = useState(false)
  const [auditError, setAuditError] = useState<string | null>(null)

  const handleRunAudit = async () => {
    if (!connection) return
    
    setIsLoading(true)
    setAuditError(null)
    
    try {
      const result = await runLeakDetection(
        connection.provider,
        connection.credentials
      )
      
      if (result.success) {
        setLeaks(result.leaks)
        setLeakSummary(result.summary)
        if (result.aiInsights) {
          setAiInsights(result.aiInsights)
        }
        setHasRunAudit(true)
      } else {
        setAuditError('Audit failed. Please try again.')
      }
    } catch (err: any) {
      setAuditError(err.message || 'Audit failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Show audit button if no results yet
  if (!hasRunAudit && leaks.length === 0) {
    return (
      <div className="flex-1 flex flex-col px-4">
        {/* Audit Scope Header */}
        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <div className="flex items-center gap-2 text-gray-400">
            <Settings2 size={16} />
            <span className="text-xs font-semibold tracking-wider">AUDIT SCOPE</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">UPGRADE MODE</span>
            <button 
              onClick={() => setIsUpgradeMode(!isUpgradeMode)}
              className={`toggle ${isUpgradeMode ? 'active' : ''}`}
            />
            <ChevronDown size={16} className="text-gray-500" />
          </div>
        </div>

        {/* Run Audit Button */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <button
            onClick={handleRunAudit}
            disabled={isLoading}
            className="btn-primary flex items-center gap-3 text-lg px-12 py-5"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                RUN REVENUE AUDIT
                <Play size={20} fill="black" />
              </>
            )}
          </button>
          <p className="text-gray-500 text-sm mt-4">
            ~30 SECONDS • NO DATA STORED
          </p>

          {/* Error Message */}
          {auditError && (
            <p className="text-pons-red text-sm mt-4">{auditError}</p>
          )}
        </div>

        {/* Value Prop */}
        <div className="card p-4 mb-4">
          <p className="text-gray-300 text-center">
            PONS connects to your CRM to identify{' '}
            <span className="text-white font-semibold">stalled deals</span>,{' '}
            <span className="text-white font-semibold">missed follow-ups</span>, and{' '}
            <span className="text-white font-semibold">revenue leaks</span> instantly.
          </p>
        </div>
      </div>
    )
  }

  // Show results
  return (
    <div className="flex-1 flex flex-col px-4">
      {/* Results Header */}
      <div className="flex items-center gap-3 py-4">
        <h2 className="text-xl font-semibold">Revenue at Risk</h2>
        <span className="badge-leaks">
          {leakSummary?.total || leaks.length} Leaks Detected
        </span>
      </div>
      <p className="text-gray-500 text-sm mb-4">
        Sorted by highest ROI action immediately available.
      </p>

      {/* Leak Cards */}
      <div className="space-y-3 flex-1 overflow-auto pb-4">
        {leaks.map((leak, index) => (
          <LeakCard key={leak.id} leak={leak} rank={index + 1} />
        ))}
      </div>

      {/* New Audit Button */}
      <button
        onClick={() => {
          setLeaks([])
          setLeakSummary(null)
          setHasRunAudit(false)
        }}
        className="text-gray-400 text-sm underline py-4 text-center"
      >
        Start New Audit
      </button>
    </div>
  )
}

// Leak Card Component
function LeakCard({ leak, rank }: { leak: any; rank: number }) {
  const severityClass = {
    CRITICAL: 'badge-critical',
    HIGH: 'badge-high',
    MEDIUM: 'badge-medium',
    LOW: 'bg-gray-700 text-gray-300',
  }[leak.severity] || 'bg-gray-700 text-gray-300'

  return (
    <div className="card card-critical p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">#{rank}</span>
          <span className={`badge ${severityClass}`}>{leak.severity}</span>
          {leak.tags?.includes('SLA_BREACH') && (
            <span className="badge badge-sla">SLA BREACH</span>
          )}
        </div>
        <div className="text-right">
          <span className="text-gray-500 text-xs">RISK:</span>
          <span className="text-white font-bold text-lg ml-1">
            {formatCurrency(leak.revenueAtRisk)}
          </span>
        </div>
      </div>
      
      <h3 className="text-white font-semibold mb-1">{leak.title}</h3>
      <p className="text-gray-400 text-sm">{leak.description}</p>
      
      {/* Audio Button */}
      <button className="absolute top-4 right-4 text-gray-500 hover:text-white">
        <Volume2 size={18} />
      </button>
    </div>
  )
}
