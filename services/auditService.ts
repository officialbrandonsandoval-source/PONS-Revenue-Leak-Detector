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

// --- FALLBACK DATA (DEMO SAFETY NET) ---
const FALLBACK_LEAKS: RevenueLeak[] = [
  {
    id: "unworked_high_intent_leads",
    name: "Unworked High Intent Leads",
    severity: "CRITICAL",
    revenueAtRisk: 21500,
    cause: "2 inbound leads untouched for over 36 hours",
    consequence: "$21,500 revenue impact",
    recommendedAction: "Call top 5 inbound leads immediately",
    timeSensitivity: "Delay >48h reduces recovery odds by ~60%",
    recoveryProbability: 0.85,
    urgencyScore: 9,
    isSlaBreach: true
  },
  {
    id: "stalled_negotiation_q3",
    name: "Stalled Negotiation Q3",
    severity: "MEDIUM",
    revenueAtRisk: 45000,
    cause: "Proposal sent 5 days ago, no follow-up recorded",
    consequence: "$45,000 at risk",
    recommendedAction: "Send 'Any questions?' email template",
    timeSensitivity: "Close rate drops 10% per day of silence",
    recoveryProbability: 0.6,
    urgencyScore: 7,
    isSlaBreach: false
  },
  {
    id: "missing_decision_maker",
    name: "Missing Decision Maker",
    severity: "LOW",
    revenueAtRisk: 12000,
    cause: "Deal >$10k without VP-level contact",
    consequence: "$12,000 pipeline drag",
    recommendedAction: "Request intro to VP of Engineering",
    timeSensitivity: "Low urgency, high importance",
    recoveryProbability: 0.9,
    urgencyScore: 4,
    isSlaBreach: false
  }
];

export async function runAudit(): Promise<RevenueLeak[]> {
  try {
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

    return FALLBACK_LEAKS;
  } catch (error) {
    console.warn("API Connection failed, using fallback data for demo continuity.", error);
    // Return fallback data to ensure the demo never fails
    return FALLBACK_LEAKS;
  }
}

// --- ANALYTICS STUB (Required for LiveSession compatibility) ---
export const getPipelineAnalytics = () => {
  // Placeholder until API supports analytics endpoint
  return {
      total_pipeline_value: 1250000,
      lead_count: 42,
      opportunity_count: 12,
      stalled_deals: 3,
      stale_leads: 5
  };
};