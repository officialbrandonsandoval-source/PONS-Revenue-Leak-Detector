import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  ClipboardCopy,
  Cloud,
  Download,
  Lock,
  LogOut,
  Play,
  Shield,
  Zap,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  AnalyticsResponse,
  CRMProvider,
  LeakCheckResponse,
  LeakItem,
  clearStoredReport,
  getAnalytics,
  getApiBaseUrl,
  getEnvApiKey,
  getEnvAppPassword,
  getStoredApiKey,
  getStoredCrmProvider,
  getStoredCrmToken,
  getStoredReport,
  isPasswordGateUnlocked,
  runLeakCheck,
  setPasswordGateUnlocked,
  setStoredApiKey,
  setStoredCrmProvider,
  setStoredCrmToken,
  setStoredReport,
} from './lib/api';

type Route = '/' | '/app' | '/app/connect' | '/app/run' | '/app/results';

const CRM_OPTIONS: Array<{ id: CRMProvider; name: string; helper: string }> = [
  { id: 'gohighlevel', name: 'GoHighLevel', helper: 'Marketing + pipeline' },
  { id: 'hubspot', name: 'HubSpot', helper: 'Deals + sequences' },
];

const ROUTES: Route[] = ['/', '/app', '/app/connect', '/app/run', '/app/results'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const buildSummary = (leaks: LeakItem[]) => {
  const total = leaks.reduce((sum, leak) => sum + (leak.revenueAtRisk || 0), 0);
  const recoverable = Math.round(total * 0.35);
  const roiMultiplier = recoverable ? Math.max(1.5, Math.round((recoverable / 1000) * 10) / 10) : 0;
  return {
    totalRevenueAtRisk: total,
    recoverableRevenue: recoverable,
    roiMultiplier,
    leaksFound: leaks.length,
  };
};

const normalizeReport = (report: LeakCheckResponse): LeakCheckResponse => {
  const leaks = Array.isArray(report.leaks) ? report.leaks : [];
  return {
    ...report,
    leaks,
    summary: report.summary || buildSummary(leaks),
  };
};

const isAppRoute = (path: string) => path === '/app' || path.startsWith('/app/');

const App: React.FC = () => {
  const [path, setPath] = useState<Route>(() => (ROUTES.includes(window.location.pathname as Route)
    ? (window.location.pathname as Route)
    : '/'));
  const [crmProvider, setCrmProvider] = useState<CRMProvider>(() => {
    return (getStoredCrmProvider() as CRMProvider) || 'gohighlevel';
  });
  const [crmToken, setCrmToken] = useState(() => getStoredCrmToken(crmProvider));
  const [storedApiKey, setStoredApiKeyState] = useState(() => getStoredApiKey());
  const [report, setReport] = useState<LeakCheckResponse | null>(() => getStoredReport());
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'error'>('idle');
  const [runError, setRunError] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authOk, setAuthOk] = useState(() => isPasswordGateUnlocked());

  const apiBaseUrl = getApiBaseUrl();
  const envApiKey = getEnvApiKey();
  const appPassword = getEnvAppPassword();
  const needsApiKey = !envApiKey;
  const hasMissingEnv = !apiBaseUrl || !appPassword;

  useEffect(() => {
    const onPopState = () => {
      const nextPath = window.location.pathname as Route;
      setPath(ROUTES.includes(nextPath) ? nextPath : '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    setCrmToken(getStoredCrmToken(crmProvider));
  }, [crmProvider]);

  const navigate = (to: Route) => {
    if (to === path) return;
    window.history.pushState({}, '', to);
    setPath(to);
  };

  const handleLogout = () => {
    setPasswordGateUnlocked(false);
    setAuthOk(false);
    toast.success('Session locked');
    navigate('/');
  };

  const handlePasswordSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError('');
    if (!appPassword) {
      setPasswordError('Missing APP_PASSWORD. Add it to Vercel env vars.');
      return;
    }
    if (passwordInput !== appPassword) {
      setPasswordError('Incorrect password.');
      return;
    }
    setPasswordGateUnlocked(true);
    setAuthOk(true);
    setPasswordInput('');
    navigate('/app');
  };

  const handleConnect = (event: React.FormEvent) => {
    event.preventDefault();
    if (!crmToken.trim()) {
      toast.error('Add a CRM token to continue.');
      return;
    }
    setStoredCrmProvider(crmProvider);
    setStoredCrmToken(crmProvider, crmToken.trim());
    if (needsApiKey && storedApiKey.trim()) {
      setStoredApiKey(storedApiKey.trim());
    }
    toast.success('CRM connected');
    navigate('/app/run');
  };

  const handleRun = async () => {
    setRunError('');
    setRunStatus('running');
    try {
      const [runReport, analyticsResponse] = await Promise.all([
        runLeakCheck(crmProvider),
        getAnalytics(crmProvider).catch(() => null),
      ]);
      const normalized = normalizeReport(runReport);
      setReport(normalized);
      setStoredReport(normalized);
      setAnalytics(analyticsResponse);
      setRunStatus('idle');
      toast.success('Leak scan complete');
      navigate('/app/results');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Leak scan failed';
      setRunError(message);
      setRunStatus('error');
      toast.error(message);
    }
  };

  const handleCopyActions = (items: LeakItem[]) => {
    const actions = items
      .map((item) => item.recommendedAction)
      .filter(Boolean)
      .join('\n');
    if (!actions) {
      toast.error('No recommended actions available.');
      return;
    }
    navigator.clipboard
      .writeText(actions)
      .then(() => toast.success('Next actions copied'))
      .catch(() => toast.error('Clipboard blocked'));
  };

  const handleDownload = (data: LeakCheckResponse) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pons-report-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const summary = report?.summary || (report?.leaks ? buildSummary(report.leaks) : null);
  const isConnected = Boolean(crmToken);

  const appShell = (content: React.ReactNode) => (
    <div className="min-h-screen bg-[var(--pons-bg)] text-[var(--pons-text)]">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition"
            onClick={() => navigate('/')}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
              <Zap size={16} />
            </span>
            PONS Ops
          </button>
          <button
            className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-400 hover:text-white"
            onClick={handleLogout}
          >
            <Lock size={12} />
            Lock
          </button>
        </div>
        <div className="mt-4 flex gap-2 rounded-full bg-white/5 p-1 text-xs font-semibold">
          {[
            { label: 'Dashboard', route: '/app' as Route },
            { label: 'Connect', route: '/app/connect' as Route },
            { label: 'Run', route: '/app/run' as Route },
            { label: 'Results', route: '/app/results' as Route },
          ].map((item) => (
            <button
              key={item.route}
              className={`flex-1 rounded-full px-3 py-2 transition ${
                path === item.route ? 'bg-white text-black' : 'text-zinc-300 hover:text-white'
              }`}
              onClick={() => navigate(item.route)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <main className="px-5 pb-16">{content}</main>
    </div>
  );

  if (isAppRoute(path) && hasMissingEnv) {
    return appShell(
      <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-3 text-lg font-semibold">
          <Shield size={20} />
          Setup Required
        </div>
        <p className="mt-3 text-sm text-zinc-300">
          Add the missing environment variables before running the dashboard on Vercel.
        </p>
        <div className="mt-5 space-y-2 text-xs uppercase tracking-[0.25em] text-zinc-400">
          {!apiBaseUrl && <div>NEXT_PUBLIC_API_BASE_URL</div>}
          {!appPassword && <div>APP_PASSWORD</div>}
        </div>
        <p className="mt-6 text-xs text-zinc-400">
          Once set, redeploy to load the new env values.
        </p>
      </div>
    );
  }

  if (isAppRoute(path) && !authOk) {
    return appShell(
      <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-3 text-lg font-semibold">
          <Lock size={18} />
          Enter App Password
        </div>
        <form className="mt-6 space-y-4" onSubmit={handlePasswordSubmit}>
          <input
            type="password"
            placeholder="APP_PASSWORD"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/40"
            value={passwordInput}
            onChange={(event) => setPasswordInput(event.target.value)}
          />
          {passwordError && <div className="text-xs text-rose-400">{passwordError}</div>}
          <button
            type="submit"
            className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
    );
  }

  if (path === '/') {
    return (
      <div className="min-h-screen bg-[var(--pons-bg)] text-[var(--pons-text)] px-5 pb-16">
        <header className="pt-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Zap size={22} />
            </span>
            <div className="text-xs uppercase tracking-[0.4em] text-zinc-400">PONS</div>
          </div>
        </header>
        <section className="mt-10 space-y-6">
          <h1 className="text-4xl font-semibold leading-tight">
            Revenue leaks hide in plain sight.
            <span className="block text-white/60">Find them fast, fix them faster.</span>
          </h1>
          <p className="text-sm text-zinc-300">
            Connect your CRM, run a leak scan, and leave with a prioritized recovery plan.
          </p>
          <div className="flex flex-col gap-3">
            <button
              className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-black"
              onClick={() => navigate('/app')}
            >
              Open Dashboard <ArrowRight size={16} />
            </button>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-400">
              Cloud-run ready • No data stored • iPhone-first layout
            </div>
          </div>
        </section>
        <section className="mt-12 grid gap-4">
          {[
            {
              title: 'Leak Heatmap',
              body: 'Severity-tagged risk with instant next steps.',
              icon: <Activity size={16} />,
            },
            {
              title: 'ROI Focused',
              body: 'Clear recovery estimate and payoff multiplier.',
              icon: <BadgeCheck size={16} />,
            },
            {
              title: 'Shareable Report',
              body: 'Download JSON or forward the results link.',
              icon: <Cloud size={16} />,
            },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 text-sm font-semibold">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                  {item.icon}
                </span>
                {item.title}
              </div>
              <p className="mt-3 text-xs text-zinc-300">{item.body}</p>
            </div>
          ))}
        </section>
      </div>
    );
  }

  if (path === '/app') {
    return appShell(
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6">
          <div className="text-xs uppercase tracking-[0.25em] text-zinc-400">Status</div>
          <div className="mt-2 text-xl font-semibold">Revenue Leak Control Center</div>
          <p className="mt-2 text-sm text-zinc-300">
            {isConnected ? 'CRM connected and ready.' : 'Connect your CRM to unlock leak detection.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
              Provider: {crmProvider}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
              API: {apiBaseUrl ? 'Cloud Run' : 'Missing'}
            </span>
          </div>
        </div>
        {summary ? (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Leaks Found', value: summary.leaksFound.toString() },
                { label: 'Revenue At Risk', value: formatCurrency(summary.totalRevenueAtRisk) },
                { label: 'Recoverable', value: formatCurrency(summary.recoverableRevenue) },
                { label: 'ROI Multiplier', value: `${summary.roiMultiplier.toFixed(1)}x` },
              ].map((card) => (
                <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">{card.label}</div>
                  <div className="mt-2 text-lg font-semibold">{card.value}</div>
                </div>
              ))}
            </div>
            <button
              className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-black"
              onClick={() => navigate('/app/results')}
            >
              View Latest Results <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300">
            Run your first leak scan to populate KPIs and actions.
          </div>
        )}
      </div>
    );
  }

  if (path === '/app/connect') {
    return appShell(
      <form className="space-y-6" onSubmit={handleConnect}>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-semibold">Choose CRM</div>
          <div className="mt-4 space-y-3">
            {CRM_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                  crmProvider === option.id
                    ? 'border-white/40 bg-white/10'
                    : 'border-white/10 bg-black/20 hover:border-white/30'
                }`}
              >
                <div>
                  <div className="font-semibold">{option.name}</div>
                  <div className="text-xs text-zinc-400">{option.helper}</div>
                </div>
                <input
                  type="radio"
                  name="crm"
                  value={option.id}
                  checked={crmProvider === option.id}
                  onChange={() => setCrmProvider(option.id)}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-semibold">Token</div>
          <p className="mt-2 text-xs text-zinc-400">
            We only store the token in your browser for MVP testing.
          </p>
          <input
            type="text"
            placeholder="Paste CRM token"
            className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/40"
            value={crmToken}
            onChange={(event) => setCrmToken(event.target.value)}
          />
        </div>

        {needsApiKey && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">API Key</div>
            <p className="mt-2 text-xs text-zinc-400">
              No NEXT_PUBLIC_API_KEY detected. Paste a key for this device.
            </p>
            <input
              type="text"
              placeholder="Paste API key"
              className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/40"
              value={storedApiKey}
              onChange={(event) => setStoredApiKeyState(event.target.value)}
            />
          </div>
        )}

        <button
          type="submit"
          className="flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-black"
        >
          Save Connection <ArrowRight size={16} />
        </button>
      </form>
    );
  }

  if (path === '/app/run') {
    return appShell(
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Play size={16} />
            Run Leak Detection
          </div>
          <p className="mt-3 text-xs text-zinc-400">
            Scans the latest CRM activity and flags deals at risk.
          </p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-zinc-300">
            Provider: {crmProvider} • Token: {isConnected ? 'Saved' : 'Missing'}
          </div>
        </div>

        {runError && (
          <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-xs text-rose-200">
            {runError}
          </div>
        )}

        <button
          className="flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:bg-white/40"
          onClick={handleRun}
          disabled={!isConnected || runStatus === 'running'}
        >
          {runStatus === 'running' ? 'Scanning…' : 'Run Leak Scan'}
          <Play size={16} />
        </button>
      </div>
    );
  }

  if (path === '/app/results') {
    const activeReport = report || getStoredReport();
    if (!activeReport) {
      return appShell(
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300">
          No report yet. Run the leak detector first.
        </div>
      );
    }
    const normalized = normalizeReport(activeReport);
    const activeSummary = normalized.summary || buildSummary(normalized.leaks);

    return appShell(
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between text-sm font-semibold">
            Leak Summary
            <span className="text-xs text-zinc-400">{normalized.generatedAt || 'Just now'}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Leaks', value: activeSummary.leaksFound.toString() },
              { label: 'Revenue At Risk', value: formatCurrency(activeSummary.totalRevenueAtRisk) },
              { label: 'Recoverable', value: formatCurrency(activeSummary.recoverableRevenue) },
              { label: 'ROI', value: `${activeSummary.roiMultiplier.toFixed(1)}x` },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">{card.label}</div>
                <div className="mt-2 text-base font-semibold">{card.value}</div>
              </div>
            ))}
          </div>
        </div>

        {analytics && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Pipeline Analytics</div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-zinc-300">
              {analytics.pipelineValue !== undefined && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  Pipeline {formatCurrency(analytics.pipelineValue)}
                </div>
              )}
              {analytics.atRiskDeals !== undefined && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  At-risk deals {analytics.atRiskDeals}
                </div>
              )}
              {analytics.avgDealSize !== undefined && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  Avg deal {formatCurrency(analytics.avgDealSize)}
                </div>
              )}
              {analytics.winRate !== undefined && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  Win rate {analytics.winRate}%
                </div>
              )}
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between text-sm font-semibold">
            Leak List
            <span className="text-xs text-zinc-400">{normalized.leaks.length} items</span>
          </div>
          <div className="mt-4 space-y-3">
            {normalized.leaks.map((leak) => (
              <div
                key={leak.id}
                className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{leak.title}</div>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
                      leak.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-200'
                        : leak.severity === 'high'
                        ? 'bg-orange-500/20 text-orange-200'
                        : leak.severity === 'medium'
                        ? 'bg-amber-500/20 text-amber-200'
                        : 'bg-emerald-500/20 text-emerald-200'
                    }`}
                  >
                    {leak.severity}
                  </span>
                </div>
                <div className="mt-2 text-xs text-zinc-300">
                  At risk: {formatCurrency(leak.revenueAtRisk)}
                </div>
                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-zinc-200">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                    Recommended Action
                  </div>
                  <div className="mt-2">{leak.recommendedAction}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          <button
            className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-black"
            onClick={() => handleCopyActions(normalized.leaks)}
          >
            Copy Next Actions <ClipboardCopy size={16} />
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-zinc-200"
              onClick={() => handleDownload(normalized)}
            >
              Download JSON <Download size={14} />
            </button>
            <button
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-zinc-200"
              onClick={() => {
                navigator.clipboard
                  .writeText(`${window.location.origin}/app/results`)
                  .then(() => toast.success('Report link copied'))
                  .catch(() => toast.error('Clipboard blocked'));
              }}
            >
              Copy Report Link <ClipboardCopy size={14} />
            </button>
          </div>
          <button
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-xs text-zinc-400"
            onClick={() => {
              clearStoredReport();
              setReport(null);
              toast.success('Cleared cached report');
            }}
          >
            Clear Cached Report <LogOut size={14} />
          </button>
        </div>
      </div>
    );
  }

  return appShell(
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300">
      Route not found.
    </div>
  );
};

export default App;
