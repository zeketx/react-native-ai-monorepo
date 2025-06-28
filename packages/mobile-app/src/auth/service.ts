// Mobile app authentication service instance
import { 
  createSupabaseClientFromEnv,
  createAuthService,
  type AuthService 
} from '@clientsync/shared'

/**
 * Authentication service instance for the mobile app
 */
let authServiceInstance: AuthService | null = null

/**
 * Initialize and get the authentication service
 */
export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    // Initialize Supabase client first
    try {
      createSupabaseClientFromEnv()
      authServiceInstance = createAuthService()
    } catch (error) {
      throw new Error(`Failed to initialize authentication service: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  return authServiceInstance
}

/**
 * Reset the authentication service (useful for testing)
 */
export function resetAuthService(): void {
  authServiceInstance = null
}

/**
 * Check if the authentication service is initialized
 */
export function isAuthServiceInitialized(): boolean {
  return authServiceInstance !== null
}