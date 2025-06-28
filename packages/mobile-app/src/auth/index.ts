// Mobile app authentication exports
export * from './service.js'

// Re-export commonly used types and utilities from shared package
export {
  type AuthUser,
  type AuthSession,
  type AuthError,
  type AuthState,
  type RegistrationData,
  type LoginData,
  type PasswordResetData,
  AuthErrorCode,
  formatAuthError,
  getUserDisplayName,
  getUserRole,
  getUserTier,
  hasCompletedOnboarding,
  getUserInitials
} from '@clientsync/shared'