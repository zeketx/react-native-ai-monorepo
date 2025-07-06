/**
 * Payload CMS Authentication Service
 * 
 * This service handles authentication with the Payload CMS backend.
 * It provides login, registration, and session management for the mobile app.
 */

import type { LoginData, RegistrationData, AuthUser, AuthSession } from './index.js'
import { SecureTokenStorage } from './storage.js'

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_CMS_API_URL || 'http://localhost:3001/api'
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000', 10)

export interface AuthService {
  login(data: LoginData): Promise<{ success: boolean; error?: string; user?: AuthUser; session?: AuthSession }>
  register(data: RegistrationData): Promise<{ success: boolean; error?: string; message?: string }>
  logout(): Promise<{ success: boolean; error?: string }>
  getCurrentUser(): Promise<{ success: boolean; user?: AuthUser; error?: string }>
  refreshToken(): Promise<{ success: boolean; error?: string; user?: AuthUser; session?: AuthSession }>
  initializeFromStorage(): Promise<{ success: boolean; user?: AuthUser; session?: AuthSession }>
  isAuthenticated(): Promise<boolean>
}

/**
 * Payload CMS Authentication Service Implementation
 */
class PayloadAuthService implements AuthService {
  private baseUrl: string
  private timeout: number

  constructor(baseUrl: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseUrl = baseUrl
    this.timeout = timeout
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    
    try {
      // Get access token for authenticated requests
      const accessToken = await SecureTokenStorage.getAccessToken()
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
          ...options.headers,
        },
      })
      
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    // Check if token is valid, refresh if needed
    const isValid = await SecureTokenStorage.isTokenValid()
    if (!isValid) {
      const refreshResult = await this.refreshToken()
      if (!refreshResult.success) {
        throw new Error('Authentication required - token refresh failed')
      }
    }
    
    return this.makeRequest(endpoint, options)
  }

  async login(data: LoginData): Promise<{ success: boolean; error?: string; user?: AuthUser; session?: AuthSession }> {
    try {
      const response = await this.makeRequest('/users/login', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.message || `Login failed with status ${response.status}`,
        }
      }

      const result = await response.json()
      
      if (result.user) {
        const user: AuthUser = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName || '',
          lastName: result.user.lastName || '',
          role: result.user.role || 'user',
          emailVerified: result.user.emailVerified || false,
        }

        const session: AuthSession = {
          token: result.token,
          refreshToken: result.refreshToken,
          expiresAt: result.exp ? new Date(result.exp * 1000) : new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        }

        // Store auth data securely
        await SecureTokenStorage.storeAuthData({ user, session })

        return { success: true, user, session }
      }

      return { success: false, error: 'Invalid response from server' }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error during login',
      }
    }
  }

  async register(data: RegistrationData): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const response = await this.makeRequest('/users', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          passwordConfirm: data.confirmPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.message || `Registration failed with status ${response.status}`,
        }
      }

      await response.json()
      
      return {
        success: true,
        message: 'Account created successfully. Please check your email to verify your account.',
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error during registration',
      }
    }
  }

  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.makeRequest('/users/logout', {
        method: 'POST',
      })

      if (!response.ok) {
        console.warn('Logout request failed, but continuing with local logout')
      }

      // Always clear local storage regardless of server response
      await SecureTokenStorage.clearAuthData()

      return { success: true }
    } catch (error) {
      console.warn('Logout error (continuing with local logout):', error)
      // Always clear local storage on logout
      await SecureTokenStorage.clearAuthData()
      return { success: true } // Always succeed locally
    }
  }

  async getCurrentUser(): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const response = await this.makeAuthenticatedRequest('/users/me')

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid stored auth data
          await SecureTokenStorage.clearAuthData()
        }
        return {
          success: false,
          error: response.status === 401 ? 'Not authenticated' : 'Failed to get user info',
        }
      }

      const result = await response.json()
      
      if (result.user) {
        const user: AuthUser = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName || '',
          lastName: result.user.lastName || '',
          role: result.user.role || 'user',
          emailVerified: result.user.emailVerified || false,
        }

        // Update stored user data
        await SecureTokenStorage.updateStoredUser(user)

        return { success: true, user }
      }

      return { success: false, error: 'Invalid user data' }
    } catch (error) {
      console.error('Get current user error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  async refreshToken(): Promise<{ success: boolean; error?: string; user?: AuthUser; session?: AuthSession }> {
    try {
      const refreshToken = await SecureTokenStorage.getRefreshToken()
      
      if (!refreshToken) {
        await SecureTokenStorage.clearAuthData()
        return {
          success: false,
          error: 'No refresh token available',
        }
      }

      const response = await fetch(`${this.baseUrl}/users/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Refresh token invalid, clear all auth data
          await SecureTokenStorage.clearAuthData()
        }
        return {
          success: false,
          error: 'Failed to refresh token',
        }
      }

      const result = await response.json()
      
      if (result.token && result.user) {
        const user: AuthUser = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName || '',
          lastName: result.user.lastName || '',
          role: result.user.role || 'user',
          emailVerified: result.user.emailVerified || false,
        }

        const session: AuthSession = {
          token: result.token,
          refreshToken: result.refreshToken || refreshToken, // Keep existing refresh token if not returned
          expiresAt: result.exp ? new Date(result.exp * 1000) : new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        }

        // Update stored tokens
        await SecureTokenStorage.updateAccessToken(session.token, session.expiresAt)
        await SecureTokenStorage.updateStoredUser(user)

        return { success: true, user, session }
      }

      return { success: false, error: 'Invalid refresh response' }
    } catch (error) {
      console.error('Token refresh error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error during token refresh',
      }
    }
  }

  async initializeFromStorage(): Promise<{ success: boolean; user?: AuthUser; session?: AuthSession }> {
    try {
      const storedAuth = await SecureTokenStorage.getAuthData()
      
      if (!storedAuth) {
        return { success: false }
      }

      // Check if token is still valid
      const isValid = await SecureTokenStorage.isTokenValid()
      
      if (isValid) {
        return { 
          success: true, 
          user: storedAuth.user, 
          session: storedAuth.session 
        }
      }

      // Try to refresh token
      const refreshResult = await this.refreshToken()
      
      if (refreshResult.success && refreshResult.user && refreshResult.session) {
        return { 
          success: true, 
          user: refreshResult.user, 
          session: refreshResult.session 
        }
      }

      // Token refresh failed, clear storage
      await SecureTokenStorage.clearAuthData()
      return { success: false }
    } catch (error) {
      console.error('Initialize from storage error:', error)
      await SecureTokenStorage.clearAuthData()
      return { success: false }
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const hasStoredAuth = await SecureTokenStorage.hasStoredAuth()
      
      if (!hasStoredAuth) {
        return false
      }

      const isValid = await SecureTokenStorage.isTokenValid()
      
      if (isValid) {
        return true
      }

      // Try to refresh token
      const refreshResult = await this.refreshToken()
      return refreshResult.success
    } catch (error) {
      console.error('Authentication check error:', error)
      return false
    }
  }
}

/**
 * Authentication service instance for the mobile app
 */
let authServiceInstance: AuthService | null = null

/**
 * Initialize and get the authentication service
 */
export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new PayloadAuthService()
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