// Authentication service implementation
import type { AuthError as SupabaseAuthError } from '@supabase/supabase-js'
import { getSupabaseClient } from './client.js'
import type {
  AuthService,
  AuthUser,
  AuthSession,
  AuthError,
  RegistrationData,
  LoginData,
  PasswordResetData,
  AuthEventListener,
  PermissionCheck
} from './types.js'
import { AuthErrorCode } from './types.js'
import type { UserRole, ClientTier } from '../types.js'

/**
 * Convert Supabase auth error to our standardized error format
 */
function mapAuthError(error: SupabaseAuthError | Error): AuthError {
  if ('message' in error) {
    // Handle specific Supabase error codes
    if (error.message.includes('Invalid login credentials')) {
      return {
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: 'Invalid email or password'
      }
    }
    
    if (error.message.includes('Email not confirmed')) {
      return {
        code: AuthErrorCode.EMAIL_NOT_CONFIRMED,
        message: 'Please check your email and click the confirmation link'
      }
    }
    
    if (error.message.includes('Password should be at least')) {
      return {
        code: AuthErrorCode.WEAK_PASSWORD,
        message: 'Password must be at least 6 characters long'
      }
    }
    
    if (error.message.includes('User already registered')) {
      return {
        code: AuthErrorCode.EMAIL_ALREADY_REGISTERED,
        message: 'An account with this email already exists'
      }
    }
    
    if (error.message.includes('Network request failed')) {
      return {
        code: AuthErrorCode.NETWORK_ERROR,
        message: 'Network connection failed. Please check your internet connection.'
      }
    }
  }
  
  // Default error mapping
  return {
    code: AuthErrorCode.UNKNOWN_ERROR,
    message: error.message || 'An unexpected error occurred',
    details: { originalError: error }
  }
}

/**
 * Authentication service implementation using Supabase
 */
export class SupabaseAuthService implements AuthService {
  private eventListeners: AuthEventListener[] = []
  
  constructor() {
    // Set up auth state change listener
    this.setupAuthStateListener()
  }
  
  private setupAuthStateListener(): void {
    const supabase = getSupabaseClient()
    
    supabase.auth.onAuthStateChange((event, session) => {
      const authEvent = {
        type: event as any,
        session: session as AuthSession | null,
        user: session?.user as AuthUser | null
      }
      
      // Notify all listeners
      this.eventListeners.forEach(listener => {
        try {
          listener(authEvent)
        } catch (error) {
          console.error('Error in auth event listener:', error)
        }
      })
    })
  }
  
  async signUp(data: RegistrationData): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      // First check if email is allowed
      const allowlistCheck = await this.isEmailAllowed(data.email)
      if (allowlistCheck.error) {
        return { user: null, error: allowlistCheck.error }
      }
      
      if (!allowlistCheck.allowed) {
        return {
          user: null,
          error: {
            code: AuthErrorCode.EMAIL_NOT_ALLOWED,
            message: 'This email is not authorized to create an account. Please contact support.'
          }
        }
      }
      
      // Validate password confirmation
      if (data.password !== data.confirmPassword) {
        return {
          user: null,
          error: {
            code: AuthErrorCode.WEAK_PASSWORD,
            message: 'Passwords do not match'
          }
        }
      }
      
      const supabase = getSupabaseClient()
      
      // Sign up with Supabase
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: 'client',
            tier: allowlistCheck.tier || 'standard',
            onboarding_completed: false
          }
        }
      })
      
      if (error) {
        return { user: null, error: mapAuthError(error) }
      }
      
      // Initialize client data using database helper function
      if (authData.user) {
        try {
          await supabase.rpc('initialize_client_data', {
            p_user_id: authData.user.id,
            p_email: data.email,
            p_tier: allowlistCheck.tier || 'standard'
          })
        } catch (initError) {
          console.error('Failed to initialize client data:', initError)
          // Don't fail the signup, but log the error
        }
      }
      
      return { user: authData.user as AuthUser | null, error: null }
    } catch (error) {
      return { user: null, error: mapAuthError(error as Error) }
    }
  }
  
  async signIn(data: LoginData): Promise<{ user: AuthUser | null; session: AuthSession | null; error: AuthError | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })
      
      if (error) {
        return { user: null, session: null, error: mapAuthError(error) }
      }
      
      return {
        user: authData.user as AuthUser | null,
        session: authData.session as AuthSession | null,
        error: null
      }
    } catch (error) {
      return { user: null, session: null, error: mapAuthError(error as Error) }
    }
  }
  
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { error: mapAuthError(error) }
      }
      
      return { error: null }
    } catch (error) {
      return { error: mapAuthError(error as Error) }
    }
  }
  
  async getSession(): Promise<{ session: AuthSession | null; error: AuthError | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        return { session: null, error: mapAuthError(error) }
      }
      
      return { session: session as AuthSession | null, error: null }
    } catch (error) {
      return { session: null, error: mapAuthError(error as Error) }
    }
  }
  
  async refreshSession(): Promise<{ session: AuthSession | null; error: AuthError | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        return { session: null, error: mapAuthError(error) }
      }
      
      return { session: session as AuthSession | null, error: null }
    } catch (error) {
      return { session: null, error: mapAuthError(error as Error) }
    }
  }
  
  async getUser(): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        return { user: null, error: mapAuthError(error) }
      }
      
      return { user: user as AuthUser | null, error: null }
    } catch (error) {
      return { user: null, error: mapAuthError(error as Error) }
    }
  }
  
  async updateUser(updates: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data: { user }, error } = await supabase.auth.updateUser({
        data: updates.user_metadata
      })
      
      if (error) {
        return { user: null, error: mapAuthError(error) }
      }
      
      return { user: user as AuthUser | null, error: null }
    } catch (error) {
      return { user: null, error: mapAuthError(error as Error) }
    }
  }
  
  async resetPassword(data: PasswordResetData): Promise<{ error: AuthError | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase.auth.resetPasswordForEmail(data.email)
      
      if (error) {
        return { error: mapAuthError(error) }
      }
      
      return { error: null }
    } catch (error) {
      return { error: mapAuthError(error as Error) }
    }
  }
  
  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) {
        return { error: mapAuthError(error) }
      }
      
      return { error: null }
    } catch (error) {
      return { error: mapAuthError(error as Error) }
    }
  }
  
  async checkPermission(requiredRole?: UserRole, requiredTier?: ClientTier): Promise<PermissionCheck> {
    const { session } = await this.getSession()
    
    if (!session?.user) {
      return {
        allowed: false,
        reason: 'User not authenticated'
      }
    }
    
    const userRole = session.user.user_metadata?.role
    const userTier = session.user.user_metadata?.tier
    
    // Check role requirement
    if (requiredRole && userRole !== requiredRole) {
      // Allow admin to access organizer features
      if (requiredRole === 'organizer' && userRole === 'admin') {
        // Admin can access organizer features
      } else {
        return {
          allowed: false,
          reason: `Required role: ${requiredRole}`,
          requiredRole
        }
      }
    }
    
    // Check tier requirement
    if (requiredTier && userTier !== requiredTier) {
      // Define tier hierarchy
      const tierHierarchy = { 'standard': 1, 'premium': 2, 'elite': 3 }
      const userTierLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] || 0
      const requiredTierLevel = tierHierarchy[requiredTier as keyof typeof tierHierarchy] || 0
      
      if (userTierLevel < requiredTierLevel) {
        return {
          allowed: false,
          reason: `Required tier: ${requiredTier}`,
          requiredTier
        }
      }
    }
    
    return { allowed: true }
  }
  
  async hasRole(role: UserRole): Promise<boolean> {
    const result = await this.getSession()
    if (!result.session?.user) return false
    
    const userRole = result.session.user.user_metadata?.role
    return userRole === role || (role === 'organizer' && userRole === 'admin')
  }
  
  async hasTier(tier: ClientTier): Promise<boolean> {
    const result = await this.getSession()
    if (!result.session?.user) return false
    
    const userTier = result.session.user.user_metadata?.tier
    const tierHierarchy = { 'standard': 1, 'premium': 2, 'elite': 3 }
    const userTierLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] || 0
    const requiredTierLevel = tierHierarchy[tier as keyof typeof tierHierarchy] || 0
    
    return userTierLevel >= requiredTierLevel
  }
  
  onAuthStateChange(listener: AuthEventListener): () => void {
    this.eventListeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.eventListeners.indexOf(listener)
      if (index > -1) {
        this.eventListeners.splice(index, 1)
      }
    }
  }
  
  async isAuthenticated(): Promise<boolean> {
    const result = await this.getSession()
    return !!result.session?.user
  }
  
  async isEmailAllowed(email: string): Promise<{ allowed: boolean; tier?: ClientTier; error?: AuthError }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase.rpc('check_email_allowlist', {
        email_to_check: email
      })
      
      if (error) {
        return { allowed: false, error: mapAuthError(error) }
      }
      
      if (!data || data.length === 0) {
        return { allowed: false }
      }
      
      const result = data[0]
      return {
        allowed: result.allowed,
        tier: result.tier,
        error: undefined
      }
    } catch (error) {
      return { allowed: false, error: mapAuthError(error as Error) }
    }
  }
}

/**
 * Create and configure the authentication service
 */
export function createAuthService(): AuthService {
  return new SupabaseAuthService()
}