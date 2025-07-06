/**
 * API Module - Entry Point
 * 
 * This module provides a centralized API interface for the mobile app
 * to communicate with the Payload CMS backend.
 */

// Export API Client
export { 
  PayloadAPIClient, 
  getAPIClient, 
  resetAPIClient, 
  initializeAPIClient,
  type APIResponse,
  type User,
  type Trip,
  type TripStatus,
  type Media,
  type UpdateProfileDTO,
  type UpdatePreferencesDTO,
} from './client.js'

// Export Error Handling
export {
  PayloadAPIError,
  ErrorType,
  parseResponseError,
  parseNetworkError,
  createOfflineError,
  isOffline,
  retryWithBackoff,
  reportError,
  setErrorReporter,
  calculateRetryDelay,
  DEFAULT_RETRY_CONFIG,
  type ErrorReporter,
  type RetryConfig,
} from './errors.js'

// Re-export auth service for convenience
export { getAuthService } from '../auth/service.js'

// Export All Types
export * from './types.js'

// Export Utilities
export const createAPIClient = (baseURL?: string, timeout?: number) => {
  const { initializeAPIClient } = require('./client.js')
  return initializeAPIClient(baseURL, timeout)
}

export const isAPIClientOnline = () => {
  const { getAPIClient } = require('./client.js')
  return getAPIClient().isOnline
}

export const getOfflineQueueSize = () => {
  const { getAPIClient } = require('./client.js')
  return getAPIClient().offlineQueueSize
}

export const syncOfflineQueue = async () => {
  const { getAPIClient } = require('./client.js')
  return getAPIClient().processOfflineQueue()
}

// Version information
export const API_VERSION = '1.0.0'
export const SUPPORTED_PAYLOAD_VERSION = '2.x'