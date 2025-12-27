import React, { useEffect, useState } from 'react';
import { X, TrendingUp, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { fetchAnalytics, AnalyticsResponse } from '../services/analyticsService';
import toast from 'react-hot-toast';

interface DashboardProps {
  onClose: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchAnalytics()
      .then((response) => {
        if (mounted) setData(response);
      })
      .catch((error) => {
        console.error('Analytics error', error);
        toast.error('Failed to load analytics');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950/95 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto min-h-screen flex flex-col p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Pipeline Dashboard</h2>
            <p className="text-zinc-500 text-sm">Live pipeline value and leak trends.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-blue-400" />
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Pipeline Value</h3>
            </div>
            <div className="h-64">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-zinc-600 text-sm">Loading chart...</div>
              ) : data?.pipelineValue?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.pipelineValue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" />
                    <YAxis stroke="#71717a" />
                    <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a' }} />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-600 text-sm">No pipeline data yet.</div>
              )}
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-red-400" />
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Leaks Detected</h3>
            </div>
            <div className="h-64">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-zinc-600 text-sm">Loading chart...</div>
              ) : data?.leakCount?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.leakCount}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" />
                    <YAxis stroke="#71717a" />
                    <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a' }} />
                    <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-600 text-sm">No leak data yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
