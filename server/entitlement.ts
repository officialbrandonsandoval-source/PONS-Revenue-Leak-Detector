import crypto from 'crypto';

type EntitlementPayload = {
  exp: number;
  iat: number;
};

const toBase64Url = (value: string) =>
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

const sign = (payload: EntitlementPayload, secret: string) => {
  const body = toBase64Url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
};

const verify = (token: string, secret: string) => {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const payload = JSON.parse(fromBase64Url(body)) as EntitlementPayload;
  if (!payload.exp || payload.exp * 1000 < Date.now()) return null;
  return payload;
};

export const issueEntitlement = (secret: string, ttlSeconds: number) => {
  const now = Math.floor(Date.now() / 1000);
  return sign({ iat: now, exp: now + ttlSeconds }, secret);
};

export const verifyEntitlement = (token: string | undefined, secret: string) => {
  if (!token) return false;
  return Boolean(verify(token, secret));
};
