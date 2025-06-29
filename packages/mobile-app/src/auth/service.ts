// Mobile app authentication service instance
// TODO: Replace with Payload CMS authentication
// Previously used Supabase client from @clientsync/shared (removed in Payload transition)

/**
 * Placeholder authentication service - will be replaced with Payload CMS
 */
export interface AuthService {
  // TODO: Define Payload CMS auth interface
}

/**
 * Authentication service instance for the mobile app
 */
let authServiceInstance: AuthService | null = null

/**
 * Initialize and get the authentication service
 * TODO: Replace with Payload CMS authentication initialization
 */
export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    // TODO: Initialize Payload CMS client
    throw new Error('Authentication service not yet implemented for Payload CMS')
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