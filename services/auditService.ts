import { RevenueLeak, Severity } from '../types';

// Raw CRM Data Simulation (Input per PRD Section 5)
const RAW_OPPORTUNITIES = [
  {
    id: 'leak-1',
    type: 'Unworked High-Intent',
    dealValue: 60000, // Gross value
    hoursSinceActivity: 37,
    stage: 'New',
    slaThreshold: 24,
    leadSource: 'Inbound',
    deals: ['#882', '#991', '#442', '#103', '#559']
  },
  {
    id: 'leak-2',
    type: 'Stalled Negotiation',
    dealValue: 200000,
    hoursSinceActivity: 124, // >72h
    stage: 'Negotiation',
    slaThreshold: 48,
    leadSource: 'Referral',
    deals: ['#402', '#112']
  },
  {
    id: 'leak-3',
    type: 'Missed Follow-Ups',
    dealValue: 75000,
    hoursSinceActivity: 26,
    stage: 'Proposal',
    slaThreshold: 24,
    leadSource: 'Outbound',
    deals: ['#331', '#332', '#334']
  },
  {
    id: 'leak-4',
    type: 'High-Value Latency',
    dealValue: 56000,
    hoursSinceActivity: 4,
    stage: 'New',
    slaThreshold: 2,
    leadSource: 'Enterprise',
    deals: ['#900']
  },
  {
    id: 'leak-5',
    type: 'Stuck Qualification',
    dealValue: 60000,
    hoursSinceActivity: 180, // >72h
    stage: 'Qualification',
    slaThreshold: 168,
    leadSource: 'Paid',
    deals: ['#101', '#102', '#105']
  }
];

// AI Tooling: Analytics Accessor
export const getPipelineAnalytics = () => {
  const totalValue = RAW_OPPORTUNITIES.reduce((sum, item) => sum + item.dealValue, 0);
  
  const byStage = RAW_OPPORTUNITIES.reduce((acc, item) => {
      acc[item.stage] = (acc[item.stage] || 0) + 1;
      return acc;
  }, {} as Record<string, number>);

  const bySource = RAW_OPPORTUNITIES.reduce((acc, item) => {
      acc[item.leadSource] = (acc[item.leadSource] || 0) + 1;
      return acc;
  }, {} as Record<string, number>);
  
  return {
      total_pipeline_value: totalValue,
      leak_count: RAW_OPPORTUNITIES.length,
      critical_leaks_count: RAW_OPPORTUNITIES.filter(i => i.hoursSinceActivity > i.slaThreshold).length,
      stage_breakdown: byStage,
      source_breakdown: bySource,
      top_opportunities: RAW_OPPORTUNITIES.map(o => ({ type: o.type, value: o.dealValue, source: o.leadSource, stage: o.stage }))
  };
};

// --- PRD SECTION 7: SCORING & PRIORITIZATION ---

const getUrgencyMultiplier = (hoursDelay: number): number => {
  // PRD 7.1 Urgency Multiplier Rules
  if (hoursDelay < 24) return 1.0;
  if (hoursDelay < 48) return 1.3;
  if (hoursDelay < 72) return 1.6;
  return 2.0;
};

const getRecoveryProbability = (source: string, hoursDelay: number): number => {
  // PRD 7.1 Recovery Probability: Based on lead source, stage depth, time decay
  // Simplified logic for simulation:
  let baseProb = 0.5;

  // Source Impact
  if (source === 'Inbound' || source === 'Enterprise') baseProb = 0.8;
  if (source === 'Referral') baseProb = 0.7;
  if (source === 'Outbound') baseProb = 0.4;
  if (source === 'Paid') baseProb = 0.3;

  // Time Decay
  const decayFactor = hoursDelay > 48 ? 0.5 : (hoursDelay > 24 ? 0.8 : 1.0);
  
  return parseFloat((baseProb * decayFactor).toFixed(2));
};

export const runAudit = async (): Promise<RevenueLeak[]> => {
  return new Promise((resolve) => {
    // Simulate API latency
    setTimeout(() => {
      
      const leaks: RevenueLeak[] = RAW_OPPORTUNITIES.map(raw => {
        const isSlaBreach = raw.hoursSinceActivity > raw.slaThreshold;
        
        // 1. Calculate Recovery Probability
        const recoveryProb = getRecoveryProbability(raw.leadSource, raw.hoursSinceActivity);
        
        // 2. Calculate Revenue at Risk (PRD 7.1: DealValue * RecoveryProbability)
        const revenueAtRisk = raw.dealValue * recoveryProb;
        
        // 3. Calculate Urgency Multiplier (PRD 7.1)
        const urgencyMult = getUrgencyMultiplier(raw.hoursSinceActivity);
        
        // 4. Calculate Final Priority Score (PRD 7.2: RevenueAtRisk * UrgencyMultiplier)
        const priorityScore = revenueAtRisk * urgencyMult;

        // Map to UI Card Schema (PRD 9.3)
        let leak: RevenueLeak = {
          id: raw.id,
          name: '',
          severity: 'LOW',
          revenueAtRisk: revenueAtRisk,
          cause: '',
          consequence: '',
          recommendedAction: '',
          timeSensitivity: '',
          recoveryProbability: recoveryProb,
          urgencyScore: urgencyMult,
          isSlaBreach: isSlaBreach,
          dealIds: raw.deals
        };

        // Hydrate Text Content based on Category (PRD 6.2)
        switch(raw.type) {
          case 'Unworked High-Intent':
            leak.name = 'Unworked High-Intent Leads';
            leak.severity = 'CRITICAL';
            leak.cause = `7 inbound leads untouched >${Math.floor(raw.hoursSinceActivity)} hours`;
            leak.consequence = `$${revenueAtRisk.toLocaleString()} decaying due to inactivity`;
            leak.recommendedAction = 'Call top 5 leads now';
            leak.timeSensitivity = 'Delay >48h reduces recovery by 62%';
            break;
          case 'Stalled Negotiation':
            leak.name = 'Stalled Late-Stage Deals';
            leak.severity = 'CRITICAL';
            leak.cause = '3 opportunities in "Negotiation" with zero activity for 5 days.';
            leak.consequence = 'Win probability dropping 15% daily';
            leak.recommendedAction = 'Send "Executive Alignment" email to champions';
            leak.timeSensitivity = 'Win rate drops 15% every 24h of silence';
            break;
          case 'Missed Follow-Ups':
            leak.name = 'Missed Follow-Up Commitments';
            leak.severity = 'MEDIUM';
            leak.cause = 'Follow-ups promised on Tuesday not sent.';
            leak.consequence = 'Trust capital depleting rapidly';
            leak.recommendedAction = 'Execute "Apology + Value Add" sequence now';
            leak.timeSensitivity = 'Trust degradation active; fix before EOD';
            break;
          case 'High-Value Latency':
            leak.name = 'High-Value Lead Latency';
            leak.severity = 'MEDIUM';
            leak.cause = 'Enterprise lead (Acme Corp) sat in "New" for 4 hours.';
            leak.consequence = 'Competitor likely contacted 2 hours ago';
            leak.recommendedAction = 'Trigger "Fast Track" call immediately';
            leak.timeSensitivity = 'Speed to lead is primary conversion factor';
            break;
           case 'Stuck Qualification':
            leak.name = 'Stuck in "Qualification" > SLA';
            leak.severity = 'LOW';
            leak.cause = '12 leads stuck in Qualification stage past SLA.';
            leak.consequence = 'Pipeline bloat masking real revenue';
            leak.recommendedAction = 'Bulk disqualify to clear pipe';
            leak.timeSensitivity = 'Clutters forecast accuracy';
            break;
        }
        
        // Store sortable metrics
        (leak as any)._priority = priorityScore;
        return leak;
      });

      // PRD 7.3 Sorting Rule (Locked)
      // 1. Highest Priority Score
      // 2. Higher Urgency
      // 3. Higher Recovery Probability
      leaks.sort((a, b) => {
        const pA = (a as any)._priority;
        const pB = (b as any)._priority;
        if (pB !== pA) return pB - pA; // Descending Priority

        if (b.urgencyScore !== a.urgencyScore) return b.urgencyScore - a.urgencyScore; // Descending Urgency

        return b.recoveryProbability - a.recoveryProbability; // Descending Probability
      });

      resolve(leaks);
    }, 1500); // 1.5s scan time (PRD Goal < 3s)
  });
};