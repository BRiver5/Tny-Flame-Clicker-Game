import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { BuyResponse, PlayerState, SessionResponse, UpgradeDefinition } from '@/src/game/types';

function getLanHost(): string | null {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    Constants.expoConfig?.hostUri?.split(':')[0] ??
    null;
  if (!debuggerHost) {
    return null;
  }
  return debuggerHost.split(':')[0] ?? null;
}

function getBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  const lanHost = getLanHost();
  if (lanHost) {
    return `http://${lanHost}:8000`;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://localhost:8000';
}

const API_BASE = getBaseUrl();

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  baseUrl: API_BASE,
  createSession: () => request<SessionResponse>('/session', { method: 'POST' }),
  getState: (sessionId: string) => request<PlayerState>(`/state/${sessionId}`),
  tap: (sessionId: string, count?: number) => request<PlayerState>(`/tap/${sessionId}`, {
    method: 'POST',
    body: JSON.stringify({ count: count ?? 1 }),
  }),
  buy: (sessionId: string, upgradeSlug: string) =>
    request<BuyResponse>(`/buy/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify({ upgrade_slug: upgradeSlug }),
    }),
  getUpgrades: () => request<UpgradeDefinition[]>('/upgrades'),
};

export const APP_VERSION =
  Constants.expoConfig?.version ?? Constants.manifest2?.extra?.expoClient?.version ?? '1.0.0';
