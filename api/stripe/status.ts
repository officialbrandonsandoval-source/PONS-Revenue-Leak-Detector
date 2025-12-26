import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyEntitlement } from './entitlement';

const parseCookies = (cookieHeader?: string) => {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split('=');
    acc[key] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const entitlementSecret = process.env.ENTITLEMENT_SECRET;
  if (!entitlementSecret) {
    res.status(200).json({ entitled: false });
    return;
  }

  const cookies = parseCookies(req.headers.cookie);
  const entitled = verifyEntitlement(cookies.pons_entitlement, entitlementSecret);
  res.status(200).json({ entitled });
}
