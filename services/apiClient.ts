const TOKEN_KEY = 'pons_token';

export const getStoredAuthToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getApiBase = () => {
  const base = import.meta.env.VITE_PONS_API_URL || 'http://localhost:8080';
  return base.replace(/\/$/, '');
};

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getStoredAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, { ...options, headers });
};

export const apiJson = async <T>(url: string, options: RequestInit = {}) => {
  const res = await apiFetch(url, options);
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Request failed');
  }
  return res.json() as Promise<T>;
};
