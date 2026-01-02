'use client';

import { useApp } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AlertTriangle, TrendingDown, Clock, Users, RefreshCw, LogOut, Loader2 } from 'lucide-react';

const severityConfig: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  CRITICAL: { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-400', badge: 'bg-red-500' },
  HIGH: { bg: 'bg-orange-500/10', border: 'border-orange-500/50', text: 'text-orange-400', badge: 'bg-orange-500' },
  MEDIUM: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', text: 'text-yellow-400', badge: 'bg-yellow-500' },
  LOW: { bg: 'bg-blue-500/10', border: 'border-blue-500/50', text: 'text-blue-400', badge: 'bg-blue-500' },
};

const typeIcons: Record<string, typeof AlertTriangle> = {
  STALE_OPPORTUNITY: Clock,
  HIGH_VALUE_AT_RISK: TrendingDown,
  NO_ACTIVITY_REP: Users,
  ABANDONED_DEAL: AlertTriangle,
  LOST_WITHOUT_REASON: AlertTriangle,
  UNTOUCHED_LEAD: Clock,
  SLOW_RESPONSE: Clock,
  DEAD_PIPELINE: TrendingDown,
};

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected, crmType, leaks, disconnect, refreshLeaks, isLoading } = useApp();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  const handleRefresh = async () => {
    await refreshLeaks();
  };

  const handleDisconnect = () => {
    disconnect();
    router.push('/');
  };

  const totalRevenue = leaks.reduce((sum, l) => sum + l.estimatedRevenue, 0);
  const criticalCount = leaks.filter(l => l.severity === 'CRITICAL').length;
  const highCount = leaks.filter(l => l.severity === 'HIGH').length;

  if (!isConnected) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-gray-800 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-purple-500">PONS</h1>
            <p className="text-xs text-gray-500">Connected: {crmType?.toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} disabled={isLoading}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50">
              {isLoading ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> 
                : <RefreshCw className="w-5 h-5 text-gray-400" />}
            </button>
            <button onClick={handleDisconnect}
              className="p-2 rounded-lg bg-gray-800 hover:bg-red-900/50 transition-colors">
              <LogOut className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-red-900/30 to-red-900/10 rounded-xl p-4 border border-red-500/20">
          <p className="text-red-400 text-xs font-medium mb-1">REVENUE AT RISK</p>
          <p className="text-2xl font-bold text-white">${(totalRevenue / 1000).toFixed(0)}k</p>
        </div>
        <div className="bg-gradient-to-br from-orange-900/30 to-orange-900/10 rounded-xl p-4 border border-orange-500/20">
          <p className="text-orange-400 text-xs font-medium mb-1">ACTIVE LEAKS</p>
          <p className="text-2xl font-bold text-white">{leaks.length}</p>
          <p className="text-xs text-gray-500">{criticalCount} critical, {highCount} high</p>
        </div>
      </div>

      <div className="px-4 pb-24">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Revenue Leaks Detected
        </h2>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Analyzing pipeline...</p>
          </div>
        ) : leaks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No leaks detected</p>
            <p className="text-sm mt-1">Your pipeline looks healthy!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaks.map((leak) => {
              const config = severityConfig[leak.severity] || severityConfig.MEDIUM;
              const Icon = typeIcons[leak.type] || AlertTriangle;
              
              return (
                <div key={leak.id} className={`rounded-xl p-4 border ${config.bg} ${config.border}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${config.text}`} />
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${config.badge} text-white`}>
                        {leak.severity}
                      </span>
                    </div>
                    {leak.estimatedRevenue > 0 && (
                      <span className="text-sm font-semibold text-white">
                        ${leak.estimatedRevenue.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-white mb-1">{leak.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{leak.description}</p>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">RECOMMENDED ACTION</p>
                    <p className="text-sm text-purple-400">{leak.recommendedAction}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
