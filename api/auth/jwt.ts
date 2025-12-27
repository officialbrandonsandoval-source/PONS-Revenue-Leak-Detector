import crypto from 'crypto';

type JwtPayload = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

const base64Url = (value: string) =>
  Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const fromBase64Url = (value: string) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const normalized = padded + '==='.slice((padded.length + 3) % 4);
  return Buffer.from(normalized, 'base64').toString('utf8');
};

const sign = (data: string, secret: string) =>
  crypto.createHmac('sha256', secret).update(data).digest('base64url');

export const issueToken = (secret: string, email: string, ttlSeconds = 60 * 60 * 24) => {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload: JwtPayload = { sub: email, email, iat: now, exp: now + ttlSeconds };
  const body = base64Url(JSON.stringify(payload));
  const signature = sign(`${header}.${body}`, secret);
  return `${header}.${body}.${signature}`;
};

export const verifyToken = (token: string, secret: string) => {
  const [header, body, signature] = token.split('.');
  if (!header || !body || !signature) return null;
  const expected = sign(`${header}.${body}`, secret);
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(fromBase64Url(body)) as JwtPayload;
  if (!payload.exp || payload.exp * 1000 < Date.now()) return null;
  return payload;
};

export const getAuthSecret = () => {
  return process.env.AUTH_JWT_SECRET || '';
};
