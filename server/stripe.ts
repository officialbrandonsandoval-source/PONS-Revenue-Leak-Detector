import Stripe from 'stripe';

export const getStripeClient = () => {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    return null;
  }
  return new Stripe(apiKey, { apiVersion: '2024-06-20' });
};

export const getAppUrl = () => {
  return process.env.APP_URL || '';
};
