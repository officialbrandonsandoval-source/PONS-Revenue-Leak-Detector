type ErrorIdInput = {
  type: string;
  endpoint: string;
  status?: number;
  code?: string;
};

const stableHash = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
};

export const createErrorId = ({ type, endpoint, status, code }: ErrorIdInput) =>
  `E_${stableHash([type, endpoint, status ?? 'na', code ?? 'na'].join('|'))}`;
