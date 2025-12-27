import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthSecret, verifyToken } from './auth/jwt.js';
import crypto from 'crypto';

const getBearerToken = (header?: string) => {
  if (!header) return '';
  const [, token] = header.split(' ');
  return token || '';
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = getAuthSecret();
  if (!secret) {
    res.status(500).json({ error: 'Auth is not configured' });
    return;
  }

  const token = getBearerToken(req.headers.authorization);
  const payload = token ? verifyToken(token, secret) : null;
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  if (!body?.leakId) {
    res.status(400).json({ error: 'Missing leakId' });
    return;
  }

  res.status(200).json({ id: crypto.randomUUID(), status: 'created' });
}
