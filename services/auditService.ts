import { RevenueLeak, Severity } from '../types';

const API_BASE = "https://pons-api-219733399964.us-west1.run.app";

// --- BACKEND SCHEMA DEFINITION ---
interface RawLeakResponse {
  id: string;
  severity: string;
  revenue_at_risk: number;
  cause: string;
  recommended_action: string;
  time_sensitivity: string;
  priority_score: number;
}

// --- ADAPTER: MAP SNAKE_CASE API TO CAMELCASE FRONTEND ---
const mapBackendToFrontend = (raw: RawLeakResponse): RevenueLeak => {
  return {
    id: raw.id,
    name: raw.id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    severity: raw.severity as Severity,
    revenueAtRisk: raw.revenue_at_risk,
    cause: raw.cause,
    consequence: `$${raw.revenue_at_risk.toLocaleString()} revenue impact`,
    recommendedAction: raw.recommended_action,
    timeSensitivity: raw.time_sensitivity,
    recoveryProbability: 0.6,
    urgencyScore: raw.priority_score,
    isSlaBreach: raw.severity === 'CRITICAL' || raw.severity === 'HIGH'
  };
};

export async function runAudit(): Promise<RevenueLeak[]> {
  const res = await fetch(`${API_BASE}/audit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  });

  if (!res.ok) {
    throw new Error("Audit failed");
  }

  const data = await res.json();
  
  // Transform backend snake_case to frontend camelCase
  if (data && Array.isArray(data.leaks)) {
    return data.leaks.map((leak: RawLeakResponse) => mapBackendToFrontend(leak));
  }

  return [];
}

// --- ANALYTICS STUB (Required for LiveSession compatibility) ---
export const getPipelineAnalytics = () => {
  // Placeholder until API supports analytics endpoint
  return {
      total_pipeline_value: 0,
      lead_count: 0,
      opportunity_count: 0,
      stalled_deals: 0,
      stale_leads: 0
  };
};