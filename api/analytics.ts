import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthSecret, verifyToken } from './auth/jwt.js';

const getBearerToken = (header?: string) => {
  if (!header) return '';
  const [, token] = header.split(' ');
  return token || '';
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
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

  res.status(200).json({
    pipelineValue: [
      { date: 'Week 1', value: 980000 },
      { date: 'Week 2', value: 1125000 },
      { date: 'Week 3', value: 1050000 },
      { date: 'Week 4', value: 1240000 },
    ],
    leakCount: [
      { date: 'Week 1', count: 3 },
      { date: 'Week 2', count: 5 },
      { date: 'Week 3', count: 2 },
      { date: 'Week 4', count: 4 },
    ],
  });
}
