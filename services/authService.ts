import { apiJson } from './apiClient';

export type AuthResponse = {
  token: string;
};

export const login = async (email: string, password: string) => {
  return apiJson<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};
