import { apiJson } from './apiClient';

export const createCheckoutSession = async (billingCycle: 'MONTHLY' | 'YEARLY') => {
  const data = await apiJson<{ url: string }>('/api/stripe/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ billingCycle }),
  });
  return data.url;
};

export const verifyCheckoutSession = async (sessionId: string) => {
  try {
    const data = await apiJson<{ entitled: boolean }>('/api/stripe/verify-session', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
    return Boolean(data.entitled);
  } catch {
    return false;
  }
};

export const fetchEntitlementStatus = async () => {
  try {
    const data = await apiJson<{ entitled: boolean }>('/api/stripe/status');
    return Boolean(data.entitled);
  } catch {
    return false;
  }
};
