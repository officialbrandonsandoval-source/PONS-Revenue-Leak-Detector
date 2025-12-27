import type { VercelRequest, VercelResponse } from '@vercel/node';
import { issueToken, getAuthSecret } from './jwt.js';

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

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const email = body?.email?.toString().trim();
  const password = body?.password?.toString().trim();

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const requiredEmail = process.env.AUTH_EMAIL;
  const requiredPassword = process.env.AUTH_PASSWORD;
  if (requiredEmail && requiredPassword) {
    if (email !== requiredEmail || password !== requiredPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
  }

  const token = issueToken(secret, email);
  res.status(200).json({ token, expiresIn: 86400 });
}
