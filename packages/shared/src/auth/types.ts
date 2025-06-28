// Authentication types for ClientSync platform
import type { User, Session } from '@supabase/supabase-js'
import type { UserRole, ClientTier } from '../types.js'

/**
 * Extended user information including profile data
 */
export interface AuthUser extends User {
  user_metadata: {
    role?: UserRole
    tier?: ClientTier
    onboarding_completed?: boolean
    full_name?: string
    name?: string
    first_name?: string
    last_name?: string
  }
}

/**
 * Authentication session with extended user data
 */
export interface AuthSession extends Session {
  user: AuthUser
}

/**
 * Authentication state for the application
 */
export interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  error: AuthError | null
}

/**
 * Standardized authentication error types
 */
export interface AuthError {
  code: AuthErrorCode
  message: string
  details?: Record<string, unknown>
}

/**
 * Authentication error codes for consistent error handling
 */
export enum AuthErrorCode {
  // Registration errors
  EMAIL_NOT_ALLOWED = 'email_not_allowed',
  EMAIL_ALREADY_REGISTERED = 'email_already_registered',
  WEAK_PASSWORD = 'weak_password',
  
  // Login errors
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_NOT_CONFIRMED = 'email_not_confirmed',
  ACCOUNT_LOCKED = 'account_locked',
  
  // Session errors
  SESSION_EXPIRED = 'session_expired',
  TOKEN_INVALID = 'token_invalid',
  REFRESH_FAILED = 'refresh_failed',
  
  // Permission errors
  INSUFFICIENT_PERMISSIONS = 'insufficient_permissions',
  ROLE_NOT_ASSIGNED = 'role_not_assigned',
  
  // Network errors
  NETWORK_ERROR = 'network_error',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  
  // Generic errors
  UNKNOWN_ERROR = 'unknown_error',
  INITIALIZATION_FAILED = 'initialization_failed'
}

/**
 * Registration form data
 */
export interface RegistrationData {
  email: string
  password: string
  confirmPassword: string
}

/**
 * Login form data
 */
export interface LoginData {
  email: string
  password: string
}

/**
 * Password reset request data
 */
export interface PasswordResetData {
  email: string
}

/**
 * Authentication service configuration
 */
export interface AuthConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  redirectTo?: string
  autoRefreshToken?: boolean
  persistSession?: boolean
  detectSessionInUrl?: boolean
}

/**
 * Authentication event types
 */
export enum AuthEventType {
  SIGNED_IN = 'SIGNED_IN',
  SIGNED_OUT = 'SIGNED_OUT',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',
  USER_UPDATED = 'USER_UPDATED',
  PASSWORD_RECOVERY = 'PASSWORD_RECOVERY'
}

/**
 * Authentication event data
 */
export interface AuthEvent {
  type: AuthEventType
  session: AuthSession | null
  user: AuthUser | null
  error?: AuthError
}

/**
 * Authentication event listener function
 */
export type AuthEventListener = (event: AuthEvent) => void

/**
 * User permission check result
 */
export interface PermissionCheck {
  allowed: boolean
  reason?: string
  requiredRole?: UserRole
  requiredTier?: ClientTier
}

/**
 * Authentication service interface
 */
export interface AuthService {
  // Authentication methods
  signUp(data: RegistrationData): Promise<{ user: AuthUser | null; error: AuthError | null }>
  signIn(data: LoginData): Promise<{ user: AuthUser | null; session: AuthSession | null; error: AuthError | null }>
  signOut(): Promise<{ error: AuthError | null }>
  
  // Session management
  getSession(): Promise<{ session: AuthSession | null; error: AuthError | null }>
  refreshSession(): Promise<{ session: AuthSession | null; error: AuthError | null }>
  
  // User management
  getUser(): Promise<{ user: AuthUser | null; error: AuthError | null }>
  updateUser(updates: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: AuthError | null }>
  
  // Password management
  resetPassword(data: PasswordResetData): Promise<{ error: AuthError | null }>
  updatePassword(newPassword: string): Promise<{ error: AuthError | null }>
  
  // Permission checks
  checkPermission(requiredRole?: UserRole, requiredTier?: ClientTier): Promise<PermissionCheck>
  hasRole(role: UserRole): Promise<boolean>
  hasTier(tier: ClientTier): Promise<boolean>
  
  // Event handling
  onAuthStateChange(listener: AuthEventListener): () => void
  
  // Utility methods
  isAuthenticated(): Promise<boolean>
  isEmailAllowed(email: string): Promise<{ allowed: boolean; tier?: ClientTier; error?: AuthError }>
}