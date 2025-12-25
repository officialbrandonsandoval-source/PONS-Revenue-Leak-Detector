import { CRMAdapter, CRMCredentials, CRMProvider } from '../types';

// Mock validation delay
const simulateNetworkDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const CRM_PROVIDERS: Record<CRMProvider, CRMAdapter> = {
  salesforce: {
    id: 'salesforce',
    name: 'Salesforce',
    iconName: 'Cloud',
    validate: async (creds: CRMCredentials) => {
      await simulateNetworkDelay(1800);
      // Basic mock validation
      return creds.apiKey.length > 5;
    }
  },
  hubspot: {
    id: 'hubspot',
    name: 'HubSpot',
    iconName: 'Hexagon', // Approximate for HubSpot logo shape in lucide
    validate: async (creds: CRMCredentials) => {
      await simulateNetworkDelay(1200);
      return creds.apiKey.length > 5;
    }
  },
  pipedrive: {
    id: 'pipedrive',
    name: 'Pipedrive',
    iconName: 'Kanban',
    validate: async (creds: CRMCredentials) => {
      await simulateNetworkDelay(1500);
      return creds.apiKey.length > 5;
    }
  },
  zoho: {
    id: 'zoho',
    name: 'Zoho CRM',
    iconName: 'Box',
    validate: async (creds: CRMCredentials) => {
      await simulateNetworkDelay(1400);
      return creds.apiKey.length > 5;
    }
  },
  gohighlevel: {
    id: 'gohighlevel',
    name: 'GoHighLevel',
    iconName: 'Zap',
    validate: async (creds: CRMCredentials) => {
      await simulateNetworkDelay(1600);
      return creds.apiKey.length > 5;
    }
  }
};

export const authenticateCRM = async (credentials: CRMCredentials): Promise<{ success: boolean; error?: string }> => {
  try {
    const adapter = CRM_PROVIDERS[credentials.provider];
    if (!adapter) {
      throw new Error('Unsupported CRM Provider');
    }

    if (!credentials.apiKey) {
        return { success: false, error: 'API Key is required' };
    }

    const isValid = await adapter.validate(credentials);
    
    if (isValid) {
      return { success: true };
    } else {
      return { success: false, error: 'Invalid API Credentials' };
    }
  } catch (err) {
    return { success: false, error: 'Connection Timeout' };
  }
};