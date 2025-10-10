/**
 * Payload CMS Authentication Service
 *
 * This service handles authentication with the Payload CMS backend.
 * It provides login, registration, and session management for the mobile app.
 */

import { getAPIClient } from '../api/client.js';
import type {
  AuthSession,
  AuthUser,
  LoginData,
  RegistrationData,
} from './index.js';
import { SecureTokenStorage } from './storage.js';

// API Configuration
const API_BASE_URL =
  process.env.EXPO_PUBLIC_CMS_API_URL || 'http://localhost:3001/api';
const API_TIMEOUT = Number.parseInt(
  process.env.EXPO_PUBLIC_API_TIMEOUT || '30000',
  10,
);

export interface AuthService {
  getCurrentUser(): Promise<{
    error?: string;
    success: boolean;
    user?: AuthUser;
  }>;
  // Compatibility aliases for old Supabase-style API
  getSession(): Promise<{
    error?: string;
    session: { user: AuthUser } | null;
  }>;
  initializeFromStorage(): Promise<{
    session?: AuthSession;
    success: boolean;
    user?: AuthUser;
  }>;
  isAuthenticated(): Promise<boolean>;
  login(data: LoginData): Promise<{
    error?: string;
    session?: AuthSession;
    success: boolean;
    user?: AuthUser;
  }>;
  logout(): Promise<{ error?: string; success: boolean; }>;
  onAuthStateChange(
    callback: (event: { session?: AuthSession; user?: AuthUser }) => void,
  ): () => void;
  refreshToken(): Promise<{
    error?: string;
    session?: AuthSession;
    success: boolean;
    user?: AuthUser;
  }>;
  register(
    data: RegistrationData,
  ): Promise<{ error?: string; message?: string; success: boolean; }>;
  requestPasswordReset(
    email: string,
  ): Promise<{ error?: string; message?: string; success: boolean; }>;
  resetPassword(
    token: string,
    password: string,
    passwordConfirm: string,
  ): Promise<{ error?: string; message?: string; success: boolean; }>;
  signIn(data: LoginData): Promise<{
    error?: string;
    session?: AuthSession;
    user?: AuthUser;
  }>;
  signOut(): Promise<{ error?: string }>;
  signUp(data: RegistrationData): Promise<{
    error?: string;
    user?: AuthUser;
  }>;
  updatePreferences(prefs: {
    language?: string;
    location?: boolean;
    notifications?: {
      email?: boolean;
      promotions?: boolean;
      push?: boolean;
      reminders?: boolean;
      sms?: boolean;
      tripUpdates?: boolean;
    };
    theme?: 'light' | 'dark';
  }): Promise<{ error?: string; success: boolean; }>;
  updateProfile(data: {
    email?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{ error?: string; success: boolean; user?: AuthUser }>;
}

/**
 * Payload CMS Authentication Service Implementation
 */
class PayloadAuthService implements AuthService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Get access token for authenticated requests
      const accessToken = await SecureTokenStorage.getAccessToken();

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> {
    // Check if token is valid, refresh if needed
    const isValid = await SecureTokenStorage.isTokenValid();
    if (!isValid) {
      const refreshResult = await this.refreshToken();
      if (!refreshResult.success) {
        throw new Error('Authentication required - token refresh failed');
      }
    }

    return this.makeRequest(endpoint, options);
  }

  async login(data: LoginData): Promise<{
    error?: string;
    session?: AuthSession;
    success: boolean;
    user?: AuthUser;
  }> {
    try {
      const response = await this.makeRequest('/users/login', {
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error:
            errorData.message || `Login failed with status ${response.status}`,
          success: false,
        };
      }

      const result = await response.json();

      if (result.user) {
        const user: AuthUser = {
          email: result.user.email,
          emailVerified: result.user.emailVerified || false,
          firstName: result.user.firstName || '',
          id: result.user.id,
          lastName: result.user.lastName || '',
          role: result.user.role || 'user',
        };

        const session: AuthSession = {
          expiresAt: result.exp
            ? new Date(result.exp * 1000)
            : new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
          refreshToken: result.refreshToken,
          token: result.token,
        };

        // Store auth data securely
        await SecureTokenStorage.storeAuthData({ session, user });

        return { session, success: true, user };
      }

      return { error: 'Invalid response from server', success: false };
    } catch (error) {
      console.error('Login error:', error);
      return {
        error:
          error instanceof Error ? error.message : 'Network error during login',
        success: false,
      };
    }
  }

  async register(
    data: RegistrationData,
  ): Promise<{ error?: string; message?: string; success: boolean; }> {
    try {
      // First, check if email is allowed via allowlist endpoint
      const allowlistResponse = await this.makeRequest(
        '/auth/check-allowlist',
        {
          body: JSON.stringify({
            email: data.email,
          }),
          method: 'POST',
        },
      );

      if (!allowlistResponse.ok) {
        const allowlistError = await allowlistResponse.json().catch(() => ({}));
        return {
          error:
            allowlistError.error || 'Email not authorized for registration',
          success: false,
        };
      }

      const allowlistResult = await allowlistResponse.json();
      if (!allowlistResult.success || !allowlistResult.allowed) {
        return {
          error:
            allowlistResult.error || 'Email not authorized for registration',
          success: false,
        };
      }

      // Proceed with registration if allowlist check passed
      const response = await this.makeRequest('/users', {
        body: JSON.stringify({
          email: data.email,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          password: data.password,
          passwordConfirm: data.confirmPassword,
        }),
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error:
            errorData.message ||
            `Registration failed with status ${response.status}`,
          success: false,
        };
      }

      await response.json();

      return {
        message:
          'Account created successfully. Please check your email to verify your account.',
        success: true,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Network error during registration',
        success: false,
      };
    }
  }

  async logout(): Promise<{ error?: string; success: boolean; }> {
    try {
      const response = await this.makeRequest('/users/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        console.warn('Logout request failed, but continuing with local logout');
      }

      // Always clear local storage regardless of server response
      await SecureTokenStorage.clearAuthData();

      return { success: true };
    } catch (error) {
      console.warn('Logout error (continuing with local logout):', error);
      // Always clear local storage on logout
      await SecureTokenStorage.clearAuthData();
      return { success: true }; // Always succeed locally
    }
  }

  async getCurrentUser(): Promise<{
    error?: string;
    success: boolean;
    user?: AuthUser;
  }> {
    try {
      const response = await this.makeAuthenticatedRequest('/users/me');

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid stored auth data
          await SecureTokenStorage.clearAuthData();
        }
        return {
          error:
            response.status === 401
              ? 'Not authenticated'
              : 'Failed to get user info',
          success: false,
        };
      }

      const result = await response.json();

      if (result.user) {
        const user: AuthUser = {
          email: result.user.email,
          emailVerified: result.user.emailVerified || false,
          firstName: result.user.firstName || '',
          id: result.user.id,
          lastName: result.user.lastName || '',
          role: result.user.role || 'user',
        };

        // Update stored user data
        await SecureTokenStorage.updateStoredUser(user);

        return { success: true, user };
      }

      return { error: 'Invalid user data', success: false };
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        success: false,
      };
    }
  }

  async refreshToken(): Promise<{
    error?: string;
    session?: AuthSession;
    success: boolean;
    user?: AuthUser;
  }> {
    try {
      const refreshToken = await SecureTokenStorage.getRefreshToken();

      if (!refreshToken) {
        await SecureTokenStorage.clearAuthData();
        return {
          error: 'No refresh token available',
          success: false,
        };
      }

      const response = await fetch(`${this.baseUrl}/users/refresh-token`, {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Refresh token invalid, clear all auth data
          await SecureTokenStorage.clearAuthData();
        }
        return {
          error: 'Failed to refresh token',
          success: false,
        };
      }

      const result = await response.json();

      if (result.token && result.user) {
        const user: AuthUser = {
          email: result.user.email,
          emailVerified: result.user.emailVerified || false,
          firstName: result.user.firstName || '',
          id: result.user.id,
          lastName: result.user.lastName || '',
          role: result.user.role || 'user',
        };

        const session: AuthSession = {
          expiresAt: result.exp
            ? new Date(result.exp * 1000)
            : new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
          refreshToken: result.refreshToken || refreshToken, // Keep existing refresh token if not returned
          token: result.token,
        };

        // Update stored tokens
        await SecureTokenStorage.updateAccessToken(
          session.token,
          session.expiresAt,
        );
        await SecureTokenStorage.updateStoredUser(user);

        return { session, success: true, user };
      }

      return { error: 'Invalid refresh response', success: false };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Network error during token refresh',
        success: false,
      };
    }
  }

  async initializeFromStorage(): Promise<{
    session?: AuthSession;
    success: boolean;
    user?: AuthUser;
  }> {
    try {
      const storedAuth = await SecureTokenStorage.getAuthData();

      if (!storedAuth) {
        return { success: false };
      }

      // Check if token is still valid
      const isValid = await SecureTokenStorage.isTokenValid();

      if (isValid) {
        return {
          session: storedAuth.session,
          success: true,
          user: storedAuth.user,
        };
      }

      // Try to refresh token
      const refreshResult = await this.refreshToken();

      if (
        refreshResult.success &&
        refreshResult.user &&
        refreshResult.session
      ) {
        return {
          session: refreshResult.session,
          success: true,
          user: refreshResult.user,
        };
      }

      // Token refresh failed, clear storage
      await SecureTokenStorage.clearAuthData();
      return { success: false };
    } catch (error) {
      console.error('Initialize from storage error:', error);
      await SecureTokenStorage.clearAuthData();
      return { success: false };
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const hasStoredAuth = await SecureTokenStorage.hasStoredAuth();

      if (!hasStoredAuth) {
        return false;
      }

      const isValid = await SecureTokenStorage.isTokenValid();

      if (isValid) {
        return true;
      }

      // Try to refresh token
      const refreshResult = await this.refreshToken();
      return refreshResult.success;
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  }

  async requestPasswordReset(
    email: string,
  ): Promise<{ error?: string; message?: string; success: boolean; }> {
    try {
      const response = await this.makeRequest('/auth/forgot-password', {
        body: JSON.stringify({
          email: email.toLowerCase(),
        }),
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: errorData.error || 'Failed to send password reset email',
          success: false,
        };
      }

      const result = await response.json();

      return {
        message:
          result.message ||
          'If an account with this email exists, a password reset link has been sent.',
        success: true,
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Network error during password reset request',
        success: false,
      };
    }
  }

  async resetPassword(
    token: string,
    password: string,
    passwordConfirm: string,
  ): Promise<{ error?: string; message?: string; success: boolean; }> {
    try {
      if (password !== passwordConfirm) {
        return {
          error: 'Passwords do not match',
          success: false,
        };
      }

      if (password.length < 8) {
        return {
          error: 'Password must be at least 8 characters long',
          success: false,
        };
      }

      const response = await this.makeRequest('/auth/reset-password', {
        body: JSON.stringify({
          password,
          passwordConfirm,
          token,
        }),
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: errorData.error || 'Failed to reset password',
          success: false,
        };
      }

      const result = await response.json();

      return {
        message: result.message || 'Password has been successfully reset',
        success: true,
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Network error during password reset',
        success: false,
      };
    }
  }

  async updateProfile(data: {
    email?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{ error?: string; success: boolean; user?: AuthUser }> {
    try {
      const apiClient = getAPIClient();
      const response = await apiClient.updateProfile(data);

      if (!response.success) {
        return {
          error: response.error?.getUserMessage() || 'Failed to update profile',
          success: false,
        };
      }

      if (response.data) {
        // Update stored user data
        await SecureTokenStorage.updateStoredUser(response.data);

        return {
          success: true,
          user: response.data,
        };
      }

      return {
        error: 'Invalid response from server',
        success: false,
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Network error during profile update',
        success: false,
      };
    }
  }

  async updatePreferences(prefs: {
    language?: string;
    location?: boolean;
    notifications?: {
      email?: boolean;
      promotions?: boolean;
      push?: boolean;
      reminders?: boolean;
      sms?: boolean;
      tripUpdates?: boolean;
    };
    theme?: 'light' | 'dark';
  }): Promise<{ error?: string; success: boolean; }> {
    try {
      const apiClient = getAPIClient();
      const response = await apiClient.updatePreferences(prefs);

      if (!response.success) {
        return {
          error:
            response.error?.getUserMessage() || 'Failed to update preferences',
          success: false,
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Update preferences error:', error);
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Network error during preferences update',
        success: false,
      };
    }
  }

  // Compatibility methods for Supabase-style API
  async getSession(): Promise<{
    error?: string;
    session: { user: AuthUser } | null;
  }> {
    const authData = await SecureTokenStorage.getAuthData();
    if (authData && authData.user) {
      return {
        session: {
          user: authData.user,
        },
      };
    }
    return { session: null };
  }

  async signIn(data: LoginData): Promise<{
    error?: string;
    session?: AuthSession;
    user?: AuthUser;
  }> {
    const result = await this.login(data);
    return {
      error: result.error,
      session: result.session,
      user: result.user,
    };
  }

  async signUp(data: RegistrationData): Promise<{
    error?: string;
    user?: AuthUser;
  }> {
    const result = await this.register(data);
    return {
      error: result.error,
      user: undefined, // Registration doesn't return user immediately
    };
  }

  async signOut(): Promise<{ error?: string }> {
    const result = await this.logout();
    return {
      error: result.error,
    };
  }

  onAuthStateChange(
    callback: (event: { session?: AuthSession; user?: AuthUser }) => void,
  ): () => void {
    // For Payload CMS, we don't have real-time auth state changes
    // This is a compatibility shim - the actual implementation should
    // be handled at the app level through context/state management
    console.warn(
      'onAuthStateChange is a compatibility shim for Payload CMS and does not provide real-time updates',
    );
    return () => {}; // Return empty unsubscribe function
  }
}

/**
 * Authentication service instance for the mobile app
 */
let authServiceInstance: AuthService | null = null;

/**
 * Initialize and get the authentication service
 */
export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new PayloadAuthService();
  }

  return authServiceInstance;
}

/**
 * Reset the authentication service (useful for testing)
 */
export function resetAuthService(): void {
  authServiceInstance = null;
}

/**
 * Check if the authentication service is initialized
 */
export function isAuthServiceInitialized(): boolean {
  return authServiceInstance !== null;
}
