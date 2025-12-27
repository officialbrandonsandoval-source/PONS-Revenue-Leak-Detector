import { apiJson } from './apiClient';
import { RevenueLeak } from '../types';

export type ActionResponse = {
  id: string;
  status: 'created' | 'queued';
};

export const createLeakAction = async (leak: RevenueLeak) => {
  return apiJson<ActionResponse>('/api/actions', {
    method: 'POST',
    body: JSON.stringify({
      leakId: leak.id,
      recommendedAction: leak.recommendedAction,
    }),
  });
};
