'use client';

import { useApp } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, Clock, Target, RefreshCw, LogOut, Loader2, Zap, Flame, ThermometerSun, Snowflake } from 'lucide-react';
import { runFullAnalysis, type AnalysisResult, type Action, type LeadScore, type DealPriority } from '@/lib/api';

const severityConfig: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  CRITICAL: { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-400', badge: 'bg-red-500' },
  HIGH: { bg: 'bg-orange-500/10', border: 'border-orange-500/50', text: 'text-orange-400', badge: 'bg-orange-500' },
  MEDIUM: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', text: 'text-yellow-400', badge: 'bg-yellow-500' },
  LOW: { bg: 'bg-blue-500/10', border: 'border-blue-500/50', text: 'text-blue-400', badge: 'bg-blue-500' },
};

const tierConfig: Record<string, { icon: typeof Flame; color: string; bg: string }> = {
  HOT: { icon: Flame, color: 'text-red-400', bg: 'bg-red-500/20' },
  WARM: { icon: ThermometerSun, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  COLD: { icon: Snowflake, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  DEAD: { icon: AlertTriangle, color: 'text-gray-500', bg: 'bg-gray-500/20' },
};

const urgencyConfig: Record<string, { color: string; bg: string }> = {
  IMMEDIATE: { color: 'text-red-400', bg: 'bg-red-500/20' },
  TODAY: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
  THIS_WEEK: { color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  SCHEDULED: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
};

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected, crmType, leaks, crmData, disconnect, refreshLeaks, isLoading } = useApp();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'actions' | 'leads' | 'deals' | 'leaks'>('actions');

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  useEffect(() => {
    if (isConnected && crmData) {
      runAnalysis();
    }
  }, [isConnected, crmData]);

  const runAnalysis = async () => {
    if (!crmData) return;
    setAnalyzing(true);
    try {
      const result = await runFullAnalysis({
        leads: crmData.leads || [],
        contacts: crmData.contacts || [],
        opportunities: crmData.opportunities || [],
        activities: crmData.activities || [],
        reps: crmData.reps || [],
      });
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
    setAnalyzing(false);
  };

  const handleRefresh = async () => {
    await refreshLeaks();
    await runAnalysis();
  };

  const handleDisconnect = () => {
    disconnect();
    router.push('/');
  };

  if (!isConnected) return null;

  const summary = analysis?.summary || {
    healthScore: 0,
    totalPipelineValue: 0,
    revenueAtRisk: leaks.reduce((sum, l) => sum + l.estimatedRevenue, 0),
    actionableItems: 0,
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-gray-800 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-purple-500">PONS</h1>
            <p className="text-xs text-gray-500">Connected: {crmType?.toUpperCase() || 'DEMO'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} disabled={isLoading || analyzing}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50">
              {(isLoading || analyzing) ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> 
                : <RefreshCw className="w-5 h-5 text-gray-400" />}
            </button>
            <button onClick={handleDisconnect}
              className="p-2 rounded-lg bg-gray-800 hover:bg-red-900/50 transition-colors">
              <LogOut className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 rounded-xl p-4 border border-purple-500/20">
          <p className="text-purple-400 text-xs font-medium mb-1">HEALTH SCORE</p>
          <p className="text-2xl font-bold text-white">{summary.healthScore}/100</p>
        </div>
        <div className="bg-gradient-to-br from-green-900/30 to-green-900/10 rounded-xl p-4 border border-green-500/20">
          <p className="text-green-400 text-xs font-medium mb-1">PIPELINE</p>
          <p className="text-2xl font-bold text-white">${(summary.totalPipelineValue / 1000).toFixed(0)}k</p>
        </div>
        <div className="bg-gradient-to-br from-red-900/30 to-red-900/10 rounded-xl p-4 border border-red-500/20">
          <p className="text-red-400 text-xs font-medium mb-1">AT RISK</p>
          <p className="text-2xl font-bold text-white">${(summary.revenueAtRisk / 1000).toFixed(0)}k</p>
        </div>
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 rounded-xl p-4 border border-blue-500/20">
          <p className="text-blue-400 text-xs font-medium mb-1">ACTIONS</p>
          <p className="text-2xl font-bold text-white">{summary.actionableItems}</p>
        </div>
      </div>

      {/* Next Best Action */}
      {analysis?.nextBestAction && (
        <div className="px-4 mb-4">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-xs font-bold text-purple-400">NEXT BEST ACTION</span>
              <span className={`text-xs px-2 py-0.5 rounded ${urgencyConfig[analysis.nextBestAction.urgency]?.bg} ${urgencyConfig[analysis.nextBestAction.urgency]?.color}`}>
                {analysis.nextBestAction.urgency}
              </span>
            </div>
            <h3 className="font-semibold text-white mb-1">{analysis.nextBestAction.title}</h3>
            <p className="text-sm text-gray-400 mb-2">{analysis.nextBestAction.description}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Est. Revenue: <span className="text-green-400">${analysis.nextBestAction.estimatedRevenue.toLocaleString()}</span></span>
              <span className="text-gray-500">Time: {analysis.nextBestAction.timeToExecute}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['actions', 'leads', 'deals', 'leaks'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab === 'actions' && `Actions (${analysis?.focusList?.length || 0})`}
              {tab === 'leads' && `Leads (${analysis?.leadScoring?.summary?.hot || 0} hot)`}
              {tab === 'deals' && `Deals (${analysis?.dealPrioritization?.summary?.urgentCount || 0} urgent)`}
              {tab === 'leaks' && `Leaks (${leaks.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 pb-32">
        {analyzing ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Running intelligence analysis...</p>
          </div>
        ) : (
          <>
            {/* Actions Tab */}
            {activeTab === 'actions' && (
              <div className="space-y-3">
                {(analysis?.focusList || []).map((action, i) => (
                  <ActionCard key={action.id || i} action={action} rank={i + 1} />
                ))}
                {(!analysis?.focusList || analysis.focusList.length === 0) && (
                  <EmptyState message="No actions needed" sub="Your pipeline is in good shape" />
                )}
              </div>
            )}

            {/* Leads Tab */}
            {activeTab === 'leads' && (
              <div className="space-y-3">
                {(analysis?.leadScoring?.leads || []).slice(0, 10).map((lead) => (
                  <LeadCard key={lead.leadId} lead={lead} />
                ))}
                {(!analysis?.leadScoring?.leads || analysis.leadScoring.leads.length === 0) && (
                  <EmptyState message="No leads to score" sub="Connect CRM data to see lead scores" />
                )}
              </div>
            )}

            {/* Deals Tab */}
            {activeTab === 'deals' && (
              <div className="space-y-3">
                {(analysis?.dealPrioritization?.deals || []).slice(0, 10).map((deal) => (
                  <DealCard key={deal.dealId} deal={deal} />
                ))}
                {(!analysis?.dealPrioritization?.deals || analysis.dealPrioritization.deals.length === 0) && (
                  <EmptyState message="No deals to prioritize" sub="Connect CRM data to see deal priorities" />
                )}
              </div>
            )}

            {/* Leaks Tab */}
            {activeTab === 'leaks' && (
              <div className="space-y-3">
                {leaks.map((leak) => {
                  const config = severityConfig[leak.severity] || severityConfig.MEDIUM;
                  return (
                    <div key={leak.id} className={`rounded-xl p-4 border ${config.bg} ${config.border}`}>
                      <div className="flex items-start justify-between mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${config.badge} text-white`}>
                          {leak.severity}
                        </span>
                        {leak.estimatedRevenue > 0 && (
                          <span className="text-sm font-semibold text-white">
                            ${leak.estimatedRevenue.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-white mb-1">{leak.title}</h3>
                      <p className="text-sm text-gray-400">{leak.description}</p>
                    </div>
                  );
                })}
                {leaks.length === 0 && (
                  <EmptyState message="No leaks detected" sub="Your pipeline looks healthy" />
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-gray-800 px-6 py-4">
        <div className="flex justify-center gap-6">
          <button onClick={() => router.push('/dashboard/chat')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs">Chat</span>
          </button>
          <button onClick={() => router.push('/dashboard/voice')}
            className="flex flex-col items-center gap-1 px-8 py-3 bg-purple-600 rounded-full text-white hover:bg-purple-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="text-xs">Voice</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function ActionCard({ action, rank }: { action: Action; rank: number }) {
  const urgency = urgencyConfig[action.urgency] || urgencyConfig.SCHEDULED;
  return (
    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">{rank}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${urgency.bg} ${urgency.color}`}>{action.urgency}</span>
        <span className="text-xs text-gray-500 ml-auto">{action.timeToExecute}</span>
      </div>
      <h3 className="font-semibold text-white mb-1">{action.title}</h3>
      <p className="text-sm text-gray-400 mb-2">{action.description}</p>
      <div className="text-xs text-green-400">+${action.estimatedRevenue.toLocaleString()} potential</div>
    </div>
  );
}

function LeadCard({ lead }: { lead: LeadScore }) {
  const tier = tierConfig[lead.tier] || tierConfig.COLD;
  const TierIcon = tier.icon;
  return (
    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TierIcon className={`w-5 h-5 ${tier.color}`} />
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${tier.bg} ${tier.color}`}>{lead.tier}</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-white">{lead.score}</span>
          <span className="text-xs text-gray-500">/100</span>
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-2">Rank #{lead.rank}</p>
      <div className="bg-black/30 rounded-lg p-2">
        <p className="text-xs text-purple-400">{lead.recommendation?.message}</p>
      </div>
    </div>
  );
}

function DealCard({ deal }: { deal: DealPriority }) {
  const urgency = urgencyConfig[deal.urgency] || urgencyConfig.SCHEDULED;
  return (
    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${urgency.bg} ${urgency.color}`}>{deal.urgency}</span>
        <span className="text-lg font-bold text-white">${(deal.value / 1000).toFixed(0)}k</span>
      </div>
      <h3 className="font-semibold text-white mb-1">{deal.dealName}</h3>
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
        <span>Priority: {deal.priorityScore}/100</span>
        <span>Expected: ${(deal.expectedValue / 1000).toFixed(0)}k</span>
      </div>
      <div className="bg-black/30 rounded-lg p-2">
        <p className="text-xs text-purple-400">{deal.recommendation?.message}</p>
      </div>
    </div>
  );
}

function EmptyState({ message, sub }: { message: string; sub: string }) {
  return (
    <div className="text-center py-12 text-gray-500">
      <p>{message}</p>
      <p className="text-sm mt-1">{sub}</p>
    </div>
  );
}
