const requiredEnv = ['PUBLIC_API_BASE_URL', 'NODE_ENV', 'API_AUTH_TOKEN'] as const;

export type RequiredEnv = (typeof requiredEnv)[number];

export const validateEnv = () => {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    console.error(message);
    throw new Error(message);
  }
};

export const getPublicApiBaseUrl = () => {
  validateEnv();
  return process.env.PUBLIC_API_BASE_URL as string;
};

export const getApiAuthToken = () => {
  const token = process.env.API_AUTH_TOKEN;
  if (!token) {
    const message = 'Missing API_AUTH_TOKEN. Set a server-side API token.';
    console.error(message);
    throw new Error(message);
  }
  return token;
};
