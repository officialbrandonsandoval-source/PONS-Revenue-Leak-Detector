import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStripeClient, getAppUrl } from './stripe.js';

const getRequestOrigin = (req: VercelRequest) => {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = req.headers.host || '';
  return `${proto}://${host}`;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const stripe = getStripeClient();
  if (!stripe) {
    res.status(500).json({ error: 'Stripe is not configured' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const billingCycle = body?.billingCycle === 'YEARLY' ? 'YEARLY' : 'MONTHLY';

  const priceId =
    billingCycle === 'YEARLY'
      ? process.env.STRIPE_PRICE_ANNUAL
      : process.env.STRIPE_PRICE_MONTHLY;

  if (!priceId) {
    res.status(500).json({ error: 'Missing Stripe price configuration' });
    return;
  }

  const appUrl = getAppUrl() || getRequestOrigin(req);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?canceled=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe session error', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
