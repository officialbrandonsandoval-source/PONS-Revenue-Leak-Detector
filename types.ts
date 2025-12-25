export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RevenueLeak {
  id: string;
  name: string;
  severity: Severity;
  revenueAtRisk: number;
  cause: string;
  consequence: string; // Aggressive mode copy
  recommendedAction: string;
  timeSensitivity: string;
  recoveryProbability: number; // 0 to 1
  urgencyScore: number; // 1 to 10
  isSlaBreach?: boolean;
  dealIds?: string[]; // For expanded view
}

export interface AuditConfig {
  sources: string[];
  pipelineStage: string;
  dateRange: string;
  team: string;
  isAggressive: boolean;
}

export const FORM_DEFAULTS: AuditConfig = {
  sources: ['Inbound', 'Referral', 'Paid'],
  pipelineStage: 'All Active',
  dateRange: 'Current Quarter',
  team: 'Global Sales',
  isAggressive: false,
};

// CRM Types
export type CRMProvider = 'salesforce' | 'hubspot' | 'pipedrive' | 'zoho' | 'gohighlevel';

export interface CRMCredentials {
  provider: CRMProvider;
  apiKey: string;
  domain?: string;
}

export interface CRMAdapter {
  id: CRMProvider;
  name: string;
  iconName: string; // mapping to lucide icon name concept
  validate: (creds: CRMCredentials) => Promise<boolean>;
}
