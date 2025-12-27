import { apiJson } from './apiClient';

export type AnalyticsPoint = {
  date: string;
  value: number;
};

export type LeakPoint = {
  date: string;
  count: number;
};

export type AnalyticsResponse = {
  pipelineValue: AnalyticsPoint[];
  leakCount: LeakPoint[];
};

export const fetchAnalytics = async () => {
  return apiJson<AnalyticsResponse>('/api/analytics');
};
