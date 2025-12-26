export const createCheckoutSession = async (billingCycle: 'MONTHLY' | 'YEARLY') => {
  const res = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ billingCycle }),
  });

  if (!res.ok) {
    throw new Error('Failed to create checkout session');
  }

  const data = await res.json();
  return data.url as string;
};

export const verifyCheckoutSession = async (sessionId: string) => {
  const res = await fetch('/api/stripe/verify-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });

  if (!res.ok) {
    return false;
  }

  const data = await res.json();
  return Boolean(data.entitled);
};

export const fetchEntitlementStatus = async () => {
  const res = await fetch('/api/stripe/status');
  if (!res.ok) {
    return false;
  }
  const data = await res.json();
  return Boolean(data.entitled);
};
