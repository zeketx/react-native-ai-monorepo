// Authentication utility functions
import type { AuthUser, AuthError } from './types.js'
import { AuthErrorCode } from './types.js'
import { UserRole, ClientTier } from '../types.js'

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get user display name from auth user
 */
export function getUserDisplayName(user: AuthUser): string {
  // Try to get name from user metadata
  const metadata = user.user_metadata
  if (metadata?.full_name) return metadata.full_name
  if (metadata?.name) return metadata.name
  if (metadata?.first_name && metadata?.last_name) {
    return `${metadata.first_name} ${metadata.last_name}`
  }
  if (metadata?.first_name) return metadata.first_name
  
  // Fallback to email username
  return user.email?.split('@')[0] || 'User'
}

/**
 * Get user role with fallback
 */
export function getUserRole(user: AuthUser): UserRole {
  return user.user_metadata?.role || UserRole.CLIENT
}

/**
 * Get user tier with fallback
 */
export function getUserTier(user: AuthUser): ClientTier {
  return user.user_metadata?.tier || ClientTier.STANDARD
}

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding(user: AuthUser): boolean {
  return user.user_metadata?.onboarding_completed === true
}

/**
 * Format authentication error for display
 */
export function formatAuthError(error: AuthError): string {
  switch (error.code) {
    case AuthErrorCode.EMAIL_NOT_ALLOWED:
      return 'This email is not authorized. Please contact support for access.'
    
    case AuthErrorCode.EMAIL_ALREADY_REGISTERED:
      return 'An account with this email already exists. Try signing in instead.'
    
    case AuthErrorCode.WEAK_PASSWORD:
      return error.message || 'Please choose a stronger password.'
    
    case AuthErrorCode.INVALID_CREDENTIALS:
      return 'Invalid email or password. Please check your credentials and try again.'
    
    case AuthErrorCode.EMAIL_NOT_CONFIRMED:
      return 'Please check your email and click the confirmation link before signing in.'
    
    case AuthErrorCode.SESSION_EXPIRED:
      return 'Your session has expired. Please sign in again.'
    
    case AuthErrorCode.INSUFFICIENT_PERMISSIONS:
      return 'You don\'t have permission to perform this action.'
    
    case AuthErrorCode.NETWORK_ERROR:
      return 'Network connection failed. Please check your internet connection and try again.'
    
    case AuthErrorCode.SERVICE_UNAVAILABLE:
      return 'The service is temporarily unavailable. Please try again later.'
    
    default:
      return error.message || 'An unexpected error occurred. Please try again.'
  }
}

/**
 * Get user-friendly role name
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'client':
      return 'Client'
    case 'organizer':
      return 'Organizer'
    case 'admin':
      return 'Administrator'
    default:
      return 'User'
  }
}

/**
 * Get user-friendly tier name
 */
export function getTierDisplayName(tier: ClientTier): string {
  switch (tier) {
    case 'standard':
      return 'Standard'
    case 'premium':
      return 'Premium'
    case 'elite':
      return 'Elite'
    default:
      return 'Standard'
  }
}

/**
 * Generate initials from user name
 */
export function getUserInitials(user: AuthUser): string {
  const displayName = getUserDisplayName(user)
  const words = displayName.split(' ')
  
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }
  
  return displayName.slice(0, 2).toUpperCase()
}

/**
 * Check if error code indicates a recoverable authentication issue
 */
export function isRecoverableAuthError(errorCode: AuthErrorCode): boolean {
  const recoverableErrors: AuthErrorCode[] = [
    AuthErrorCode.INVALID_CREDENTIALS,
    AuthErrorCode.EMAIL_NOT_CONFIRMED,
    AuthErrorCode.WEAK_PASSWORD,
    AuthErrorCode.NETWORK_ERROR,
    AuthErrorCode.SESSION_EXPIRED,
    AuthErrorCode.TOKEN_INVALID
  ]
  
  return recoverableErrors.includes(errorCode)
}

/**
 * Check if error code indicates a permanent authentication issue
 */
export function isPermanentAuthError(errorCode: AuthErrorCode): boolean {
  const permanentErrors: AuthErrorCode[] = [
    AuthErrorCode.EMAIL_NOT_ALLOWED,
    AuthErrorCode.EMAIL_ALREADY_REGISTERED,
    AuthErrorCode.ACCOUNT_LOCKED,
    AuthErrorCode.INSUFFICIENT_PERMISSIONS,
    AuthErrorCode.ROLE_NOT_ASSIGNED
  ]
  
  return permanentErrors.includes(errorCode)
}

/**
 * Get recommended action for authentication error
 */
export function getErrorAction(errorCode: AuthErrorCode): string {
  switch (errorCode) {
    case AuthErrorCode.EMAIL_NOT_ALLOWED:
      return 'Contact support for account access'
    
    case AuthErrorCode.EMAIL_ALREADY_REGISTERED:
      return 'Try signing in instead'
    
    case AuthErrorCode.WEAK_PASSWORD:
      return 'Choose a stronger password'
    
    case AuthErrorCode.INVALID_CREDENTIALS:
      return 'Check your email and password'
    
    case AuthErrorCode.EMAIL_NOT_CONFIRMED:
      return 'Check your email for confirmation link'
    
    case AuthErrorCode.SESSION_EXPIRED:
      return 'Sign in again'
    
    case AuthErrorCode.NETWORK_ERROR:
      return 'Check your internet connection'
    
    case AuthErrorCode.SERVICE_UNAVAILABLE:
      return 'Try again later'
    
    default:
      return 'Try again or contact support'
  }
}

/**
 * Sanitize user data for logging (remove sensitive information)
 */
export function sanitizeUserForLogging(user: AuthUser): Record<string, unknown> {
  return {
    id: user.id,
    email: user.email,
    role: getUserRole(user),
    tier: getUserTier(user),
    onboarding_completed: hasCompletedOnboarding(user),
    created_at: user.created_at,
    email_confirmed_at: user.email_confirmed_at,
    last_sign_in_at: user.last_sign_in_at
  }
}

/**
 * Create a timeout promise for authentication operations
 */
export function createAuthTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Authentication operation timed out'))
    }, timeoutMs)
  })
  
  return Promise.race([promise, timeoutPromise])
}