export type CRMProvider = 'gohighlevel' | 'hubspot';
export type LeakSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface LeakSummary {
  totalRevenueAtRisk: number;
  recoverableRevenue: number;
  roiMultiplier: number;
  leaksFound: number;
}

export interface LeakItem {
  id: string;
  title: string;
  severity: LeakSeverity;
  revenueAtRisk: number;
  recommendedAction: string;
  notes?: string;
  accountName?: string;
}

export interface LeakCheckResponse {
  runId?: string;
  generatedAt?: string;
  summary?: LeakSummary;
  leaks: LeakItem[];
}

export interface AnalyticsResponse {
  pipelineValue?: number;
  atRiskDeals?: number;
  avgDealSize?: number;
  winRate?: number;
}

const API_KEY_STORAGE = 'pons_api_key';
const CRM_PROVIDER_STORAGE = 'pons_crm_provider';
const CRM_TOKEN_PREFIX = 'pons_crm_token_';
const REPORT_STORAGE = 'pons_last_report';
const PASSWORD_STORAGE = 'pons_app_auth';

const rawBaseUrl =
  (import.meta.env.NEXT_PUBLIC_API_BASE_URL as string | undefined) ||
  (import.meta.env.VITE_PONS_API_URL as string | undefined) ||
  '';
const rawApiKey = (import.meta.env.NEXT_PUBLIC_API_KEY as string | undefined) || '';
const rawAppPassword = (import.meta.env.APP_PASSWORD as string | undefined) || '';

export const getApiBaseUrl = () => rawBaseUrl.trim();
export const getEnvApiKey = () => rawApiKey.trim();
export const getEnvAppPassword = () => rawAppPassword.trim();

export const getStoredApiKey = () => {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
};

export const setStoredApiKey = (value: string) => {
  try {
    localStorage.setItem(API_KEY_STORAGE, value);
  } catch {
    return;
  }
};

export const getStoredCrmProvider = () => {
  try {
    return (localStorage.getItem(CRM_PROVIDER_STORAGE) || '') as CRMProvider | '';
  } catch {
    return '';
  }
};

export const setStoredCrmProvider = (provider: CRMProvider) => {
  try {
    localStorage.setItem(CRM_PROVIDER_STORAGE, provider);
  } catch {
    return;
  }
};

export const getStoredCrmToken = (provider: CRMProvider) => {
  try {
    return localStorage.getItem(`${CRM_TOKEN_PREFIX}${provider}`) || '';
  } catch {
    return '';
  }
};

export const setStoredCrmToken = (provider: CRMProvider, token: string) => {
  try {
    localStorage.setItem(`${CRM_TOKEN_PREFIX}${provider}`, token);
  } catch {
    return;
  }
};

export const getStoredReport = () => {
  try {
    const raw = localStorage.getItem(REPORT_STORAGE);
    return raw ? (JSON.parse(raw) as LeakCheckResponse) : null;
  } catch {
    return null;
  }
};

export const setStoredReport = (report: LeakCheckResponse) => {
  try {
    localStorage.setItem(REPORT_STORAGE, JSON.stringify(report));
  } catch {
    return;
  }
};

export const clearStoredReport = () => {
  try {
    localStorage.removeItem(REPORT_STORAGE);
  } catch {
    return;
  }
};

export const isPasswordGateUnlocked = () => {
  try {
    return localStorage.getItem(PASSWORD_STORAGE) === 'true';
  } catch {
    return false;
  }
};

export const setPasswordGateUnlocked = (value: boolean) => {
  try {
    localStorage.setItem(PASSWORD_STORAGE, value ? 'true' : 'false');
  } catch {
    return;
  }
};

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('Missing API base URL. Set NEXT_PUBLIC_API_BASE_URL.');
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl.replace(/\/$/, '')}${normalizedPath}`;

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const apiKey = getEnvApiKey() || getStoredApiKey();
  if (apiKey) {
    headers.set('x-api-key', apiKey);
  }

  return fetch(url, { ...options, headers });
};

export const apiJson = async <T>(path: string, options: RequestInit = {}) => {
  const res = await apiFetch(path, options);
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Request failed');
  }
  return res.json() as Promise<T>;
};

export const runLeakCheck = async (crmProvider: CRMProvider) => {
  const token = getStoredCrmToken(crmProvider);
  if (!token) {
    throw new Error('Missing CRM token. Connect your CRM first.');
  }

  return apiJson<LeakCheckResponse>(`/api/leaks?crm=${crmProvider}`, {
    method: 'POST',
    headers: {
      'x-crm-token': token,
    },
    body: JSON.stringify({ token }),
  });
};

export const getAnalytics = async (crmProvider: CRMProvider) => {
  const token = getStoredCrmToken(crmProvider);
  if (!token) {
    throw new Error('Missing CRM token. Connect your CRM first.');
  }

  return apiJson<AnalyticsResponse>(`/api/analytics?crm=${crmProvider}`, {
    headers: {
      'x-crm-token': token,
    },
  });
};
