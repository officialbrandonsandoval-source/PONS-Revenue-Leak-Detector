'use client';

import { useState } from 'react';
import { ApiError, requestInternalJson } from '../../lib/apiClient';

type LeakItem = {
  type: string;
  severity: string;
  estimatedLoss: number;
  explanation: string;
};

type LeakAnalysisResponse = {
  totalLeads: number;
  leaksFound: number;
  estimatedRevenueLost: number;
  leaks: LeakItem[];
};

type Status = 'idle' | 'loading' | 'success' | 'error';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);

const normalize = (data: LeakAnalysisResponse): LeakAnalysisResponse => ({
  totalLeads: data?.totalLeads ?? 0,
  leaksFound: data?.leaksFound ?? data?.leaks?.length ?? 0,
  estimatedRevenueLost: data?.estimatedRevenueLost ?? 0,
  leaks: Array.isArray(data?.leaks) ? data.leaks : [],
});

export default function LeakAnalysisClient() {
  const [crm, setCrm] = useState('hubspot');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<LeakAnalysisResponse | null>(null);

  const runAnalysis = async () => {
    setStatus('loading');
    setError('');
    try {
      const data = await requestInternalJson<LeakAnalysisResponse>(
        `/api/leaks/analyze?crm=${crm}`,
        { method: 'POST' }
      );
      setResult(normalize(data));
      setStatus('success');
    } catch (err) {
      if (err instanceof ApiError) {
        setStatus('error');
        setError('Analysis failed');
        return;
      }
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unexpected error');
    }
  };

  const stats = result ? normalize(result) : null;

  return (
    <>
      <div className="card">
        <div className="stat-label">What a leak means</div>
        <p className="subtitle">
          A leak is a measurable gap between expected conversion and what the CRM data shows today.
          It highlights deals likely to stall or slip without intervention, not a guarantee of loss.
        </p>
      </div>
      <div className="card">
        <div className="controls">
          <select className="select" value={crm} onChange={(event) => setCrm(event.target.value)}>
            <option value="hubspot">HubSpot</option>
            <option value="gohighlevel">GoHighLevel</option>
          </select>
          <button className="button" onClick={runAnalysis} disabled={status === 'loading'}>
            {status === 'loading' ? 'Running…' : 'Run Analysis'}
          </button>
          <span
            className={`status ${
              status === 'success' ? 'success' : status === 'error' ? 'error' : ''
            }`}
          >
            {status === 'success' && 'Analysis complete'}
            {status === 'error' && error}
            {status === 'loading' && 'Processing request'}
          </span>
        </div>
      </div>

      <div className="stats">
        <div className="card">
          <div className="stat-label">Total Leads</div>
          <div className="stat-value">{stats ? stats.totalLeads : '—'}</div>
        </div>
        <div className="card">
          <div className="stat-label">Leaks Found</div>
          <div className="stat-value">{stats ? stats.leaksFound : '—'}</div>
        </div>
        <div className="card">
          <div className="stat-label">Estimated Revenue Lost</div>
          <div className="stat-value">
            {stats ? formatCurrency(stats.estimatedRevenueLost) : '—'}
          </div>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Severity</th>
              <th>Estimated Loss</th>
              <th>Explanation</th>
            </tr>
          </thead>
          <tbody>
            {stats?.leaks?.length ? (
              stats.leaks.map((leak, index) => (
                <tr key={`${leak.type}-${index}`}>
                  <td>{leak.type}</td>
                  <td>
                    <span className={`tag ${leak.severity?.toLowerCase()}`}>{leak.severity}</span>
                  </td>
                  <td>{formatCurrency(leak.estimatedLoss)}</td>
                  <td>{leak.explanation}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="empty">
                  Run analysis to populate the leak table.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="card">
        <div className="stat-label">Methodology</div>
        <p className="subtitle">
          Analysis is based on your current CRM snapshot and historical conversion benchmarks.
          Results are directional and meant to guide prioritization, not replace pipeline reviews.
        </p>
      </div>
    </>
  );
}
