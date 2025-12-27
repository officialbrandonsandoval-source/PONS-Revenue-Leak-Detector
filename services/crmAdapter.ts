import { CRMAdapter, CRMCredentials, CRMProvider } from '../types';
import { apiJson } from './apiClient';

export const CRM_PROVIDERS: Record<CRMProvider, CRMAdapter> = {
  salesforce: {
    id: 'salesforce',
    name: 'Salesforce',
    iconName: 'Cloud',
    validate: async (creds: CRMCredentials) => {
      return Boolean(creds.apiKey || creds.oauthToken);
    }
  },
  hubspot: {
    id: 'hubspot',
    name: 'HubSpot',
    iconName: 'Hexagon', // Approximate for HubSpot logo shape in lucide
    validate: async (creds: CRMCredentials) => {
      return Boolean(creds.apiKey || creds.oauthToken);
    }
  },
  pipedrive: {
    id: 'pipedrive',
    name: 'Pipedrive',
    iconName: 'Kanban',
    validate: async (creds: CRMCredentials) => {
      return Boolean(creds.apiKey || creds.oauthToken);
    }
  },
  zoho: {
    id: 'zoho',
    name: 'Zoho CRM',
    iconName: 'Box',
    validate: async (creds: CRMCredentials) => {
      return Boolean(creds.apiKey || creds.oauthToken);
    }
  },
  gohighlevel: {
    id: 'gohighlevel',
    name: 'GoHighLevel',
    iconName: 'Zap',
    validate: async (creds: CRMCredentials) => {
      return Boolean(creds.apiKey || creds.oauthToken);
    }
  }
};

export const authenticateCRM = async (credentials: CRMCredentials): Promise<{ success: boolean; error?: string }> => {
  try {
    const adapter = CRM_PROVIDERS[credentials.provider];
    if (!adapter) {
      throw new Error('Unsupported CRM Provider');
    }

    if (!credentials.apiKey && !credentials.oauthToken) {
      return { success: false, error: 'API Key or OAuth Token is required' };
    }

    const isValid = await adapter.validate(credentials);
    
    if (isValid) {
      await apiJson('/api/auth', {
        method: 'POST',
        body: JSON.stringify({
          provider: credentials.provider,
          apiKey: credentials.apiKey || undefined,
          oauthToken: credentials.oauthToken || undefined,
          domain: credentials.domain || undefined,
        }),
      });
      return { success: true };
    } else {
      return { success: false, error: 'Invalid API Credentials' };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Connection Failed';
    return { success: false, error: message || 'Connection Failed' };
  }
};
