/**
 * Payload CMS Client Configuration
 * 
 * This file provides client configuration for Payload CMS.
 * The actual client implementation is now in ../api/payload-client.ts
 */

import { createPayloadClient, type PayloadClient, type PayloadClientConfig } from '../api/payload-client';

let payloadClientInstance: PayloadClient | null = null;

export interface PayloadConfig {
  baseURL: string;
  timeout?: number;
  authTokenProvider?: () => Promise<string | null>;
  onTokenExpired?: () => Promise<void>;
}

export function createPayloadAuthClient(config: PayloadConfig): PayloadClient {
  if (!config.baseURL) {
    throw new Error('Payload base URL is required');
  }

  if (payloadClientInstance) {
    return payloadClientInstance;
  }

  const clientConfig: Partial<PayloadClientConfig> = {
    baseURL: config.baseURL,
    timeout: config.timeout,
    authTokenProvider: config.authTokenProvider,
    onTokenExpired: config.onTokenExpired,
  };

  payloadClientInstance = createPayloadClient(clientConfig);
  return payloadClientInstance;
}

export function getPayloadClient(): PayloadClient {
  if (!payloadClientInstance) {
    throw new Error('Payload client not initialized. Call createPayloadAuthClient first.');
  }
  return payloadClientInstance;
}

export function resetPayloadClient(): void {
  payloadClientInstance = null;
}