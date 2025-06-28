// Authentication module exports
export * from './types.js'

// Export specific functions from client to avoid conflicts
export {
  initializeSupabaseClient,
  getSupabaseClient,
  createSupabaseClientFromEnv,
  isClientInitialized,
  resetSupabaseClient
} from './client.js'

// Export specific functions from service to avoid conflicts
export {
  SupabaseAuthService,
  createAuthService
} from './service.js'

// Export specific functions from utils to avoid conflicts with main utils
export {
  validatePassword,
  getUserDisplayName,
  getUserRole,
  getUserTier,
  hasCompletedOnboarding,
  formatAuthError,
  getRoleDisplayName,
  getUserInitials,
  sanitizeUserForLogging,
  createAuthTimeout,
  isRecoverableAuthError,
  isPermanentAuthError,
  getErrorAction
} from './utils.js'