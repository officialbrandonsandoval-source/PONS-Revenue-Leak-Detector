import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStripeClient } from './stripe.js';
import { issueEntitlement } from './entitlement.js';

const parseCookies = (cookieHeader?: string) => {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split('=');
    acc[key] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
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

  const entitlementSecret = process.env.ENTITLEMENT_SECRET;
  if (!entitlementSecret) {
    res.status(500).json({ error: 'Entitlement secret is not configured' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const sessionId = body?.sessionId || body?.session_id;
  if (!sessionId) {
    res.status(400).json({ error: 'Missing session id' });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const isPaid = session.payment_status === 'paid' || session.status === 'complete';
    if (!isPaid) {
      res.status(403).json({ error: 'Payment not completed' });
      return;
    }

    const ttlSeconds = 60 * 60 * 24 * 30;
    const token = issueEntitlement(entitlementSecret, ttlSeconds);
    res.setHeader('Set-Cookie', [
      `pons_entitlement=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${ttlSeconds}`,
    ]);

    const cookies = parseCookies(req.headers.cookie);
    res.status(200).json({ entitled: true, existing: Boolean(cookies.pons_entitlement) });
  } catch (error) {
    console.error('Stripe verify error', error);
    res.status(500).json({ error: 'Failed to verify session' });
  }
}
