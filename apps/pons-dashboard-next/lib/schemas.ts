type SchemaKey = '/health' | '/providers' | '/leaks/analyze';

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isString = (v: unknown): v is string => typeof v === 'string';
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

const validateHealth = (d: unknown) =>
  isRecord(d) && isString(d.status);

const validateProviders = (d: unknown) =>
  Array.isArray(d) && d.every(isString);

const validateLeakAnalyze = (d: unknown) => {
  if (!isRecord(d)) return false;
  if (!isNumber(d.totalLeads)) return false;
  if (!isNumber(d.leaksFound)) return false;
  if (!isNumber(d.estimatedRevenueLost)) return false;
  if (!Array.isArray(d.leaks)) return false;
  for (const l of d.leaks) {
    if (!isRecord(l)) return false;
    if (!isString(l.type)) return false;
    if (!isString(l.severity)) return false;
    if (!isNumber(l.estimatedLoss)) return false;
    if (!isString(l.explanation)) return false;
  }
  return true;
};

export const validateSchema = (key: SchemaKey, data: unknown) => {
  switch (key) {
    case '/health': return validateHealth(data);
    case '/providers': return validateProviders(data);
    case '/leaks/analyze': return validateLeakAnalyze(data);
    default: return false;
  }
};

export const getSchemaKeyForPath = (path: string): SchemaKey | null => {
  if (path.includes('/health')) return '/health';
  if (path.includes('/providers')) return '/providers';
  if (path.includes('/api/leaks/analyze')) return '/leaks/analyze';
  return null;
};
