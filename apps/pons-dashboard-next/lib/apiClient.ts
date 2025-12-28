import { createErrorId } from './errorId';
import { getSchemaKeyForPath, validateSchema } from './schemas';

export class ApiError extends Error {
  status: number;
  code: string;
  endpoint: string;
  errorId: string;
  payload?: string;

  constructor(params: {
    message: string;
    status: number;
    code: string;
    endpoint: string;
    errorId: string;
    payload?: string;
  }) {
    super(params.message);
    this.status = params.status;
    this.code = params.code;
    this.endpoint = params.endpoint;
    this.errorId = params.errorId;
    this.payload = params.payload;
  }
}

const DEFAULT_TIMEOUT_MS = 10000;
const MAX_BODY_BYTES = 64 * 1024;

const getBodySize = (body: BodyInit | null | undefined) => {
  if (!body || typeof body !== 'string') return 0;
  return new TextEncoder().encode(body).length;
};

const ensureJsonResponse = async (response: Response, endpoint: string) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const payload = await response.text();
    const errorId = createErrorId({
      type: 'response',
      endpoint,
      status: response.status,
      code: 'NON_JSON',
    });
    throw new ApiError({
      message: 'Expected JSON response',
      status: response.status,
      code: 'NON_JSON',
      endpoint,
      errorId,
      payload,
    });
  }
};

const validateResponseShape = (endpoint: string, data: unknown) => {
  const schemaKey = getSchemaKeyForPath(endpoint);
  if (!schemaKey) return;
  if (!validateSchema(schemaKey, data)) {
    const errorId = createErrorId({
      type: 'schema',
      endpoint,
      status: 422,
      code: 'SCHEMA_INVALID',
    });
    throw new ApiError({
      message: 'Response schema invalid',
      status: 422,
      code: 'SCHEMA_INVALID',
      endpoint,
      errorId,
    });
  }
};

const requestJson = async <T>(
  endpoint: string,
  url: string,
  options: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<T> => {
  const bodySize = getBodySize(options.body);
  if (bodySize > MAX_BODY_BYTES) {
    const errorId = createErrorId({
      type: 'request',
      endpoint,
      status: 413,
      code: 'PAYLOAD_TOO_LARGE',
    });
    throw new ApiError({
      message: 'Payload Too Large',
      status: 413,
      code: 'PAYLOAD_TOO_LARGE',
      endpoint,
      errorId,
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    await ensureJsonResponse(response, endpoint);

    const payload = await response.json();

    if (!response.ok) {
      const errorId =
        (payload && typeof payload === 'object' && 'errorId' in payload && payload.errorId) ||
        createErrorId({
          type: 'http',
          endpoint,
          status: response.status,
          code: 'HTTP_ERROR',
        });
      throw new ApiError({
        message: 'Request failed',
        status: response.status,
        code: 'HTTP_ERROR',
        endpoint,
        errorId: String(errorId),
        payload: JSON.stringify(payload),
      });
    }

    validateResponseShape(endpoint, payload);
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      const errorId = createErrorId({
        type: 'timeout',
        endpoint,
        status: 408,
        code: 'TIMEOUT',
      });
      throw new ApiError({
        message: 'Request timed out',
        status: 408,
        code: 'TIMEOUT',
        endpoint,
        errorId,
      });
    }
    const errorId = createErrorId({
      type: 'unknown',
      endpoint,
      status: 500,
      code: 'UNKNOWN',
    });
    throw new ApiError({
      message: 'Unexpected request error',
      status: 500,
      code: 'UNKNOWN',
      endpoint,
      errorId,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

export const requestInternalJson = async <T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
) => {
  if (!path.startsWith('/')) {
    throw new Error('Internal API paths must start with /');
  }
  return requestJson<T>(path, path, options, timeoutMs);
};

export const requestCloudRunJson = async <T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
) => {
  if (typeof window !== 'undefined') {
    throw new Error('Cloud Run requests must be made on the server.');
  }

  const { getApiAuthToken, getPublicApiBaseUrl } = await import('./env');
  const baseUrl = getPublicApiBaseUrl().replace(/\/$/, '');
  const token = getApiAuthToken();
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${endpoint}`;

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return requestJson<T>(endpoint, url, { ...options, headers }, timeoutMs);
};
