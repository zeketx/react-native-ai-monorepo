/**
 * Payload CMS API Client
 * 
 * A unified API client for interacting with Payload CMS endpoints.
 * Provides authentication, user management, and trip operations with
 * proper error handling and retry logic.
 */

import type { AuthUser, AuthSession, LoginCredentials, RegisterCredentials } from '../auth/types';
import type { BaseUser, UserPreferences } from '../types/user';
import type { BaseTrip } from '../types/trip';
import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS, API_ERROR_CODES } from '../constants/api';

export interface PayloadAPIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode?: number;
}

export interface PayloadAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: PayloadAPIError;
  message?: string;
}

export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
}

export interface PayloadClientConfig {
  baseURL: string;
  timeout: number;
  retryOptions: RetryOptions;
  authTokenProvider?: () => Promise<string | null>;
  onTokenExpired?: () => Promise<void>;
}

/**
 * Default configuration for PayloadClient
 */
const DEFAULT_CONFIG: PayloadClientConfig = {
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  retryOptions: {
    maxAttempts: API_CONFIG.RETRY_ATTEMPTS,
    delayMs: API_CONFIG.RETRY_DELAY,
    backoffMultiplier: 2,
  },
};

/**
 * Unified Payload CMS API Client
 */
export class PayloadClient {
  private config: PayloadClientConfig;
  private abortController: AbortController | null = null;

  constructor(config: Partial<PayloadClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Authentication Methods
   */
  public auth = {
    login: async (credentials: LoginCredentials): Promise<PayloadAPIResponse<{ user: AuthUser; session: AuthSession }>> => {
      const response = await this.request('/users/login', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.success || !response.data) {
        return response;
      }

      const result = response.data;

      if (result.user && result.token) {
        const user: AuthUser = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName || '',
          lastName: result.user.lastName || '',
          role: result.user.role || 'client',
          emailVerified: result.user.emailVerified || false,
        };

        const session: AuthSession = {
          access_token: result.token,
          refresh_token: result.refreshToken || '',
          expires_at: result.exp || Math.floor(Date.now() / 1000) + 2 * 60 * 60, // 2 hours
          token_type: 'bearer',
          user,
        };

        return { 
          success: true, 
          data: { user, session }
        };
      }

      return {
        success: false,
        error: {
          code: 'INVALID_RESPONSE',
          message: 'Invalid response from server',
        },
      };
    },

    register: async (credentials: RegisterCredentials): Promise<PayloadAPIResponse<{ message: string }>> => {
      // First check allowlist
      const allowlistResult = await this.request('/auth/check-allowlist', {
        method: 'POST',
        body: JSON.stringify({ email: credentials.email }),
      });

      if (!allowlistResult.success || !allowlistResult.data?.allowed) {
        return {
          success: false,
          error: {
            code: API_ERROR_CODES.RESOURCE_ACCESS_DENIED,
            message: 'Email not authorized for registration',
          },
        };
      }

      // Proceed with registration
      return this.request('/users', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          passwordConfirm: credentials.password,
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          phone: credentials.phone,
          role: credentials.role || 'client',
        }),
      });
    },

    logout: async (): Promise<PayloadAPIResponse<void>> => {
      return this.request('/users/logout', {
        method: 'POST',
      });
    },

    refreshToken: async (refreshToken: string): Promise<PayloadAPIResponse<{ user: AuthUser; session: AuthSession }>> => {
      const response = await this.request('/users/refresh-token', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!response.success || !response.data) {
        return response;
      }

      const result = response.data;

      if (result.user && result.token) {
        const user: AuthUser = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName || '',
          lastName: result.user.lastName || '',
          role: result.user.role || 'client',
          emailVerified: result.user.emailVerified || false,
        };

        const session: AuthSession = {
          access_token: result.token,
          refresh_token: result.refreshToken || refreshToken, // Keep existing refresh token if not returned
          expires_at: result.exp || Math.floor(Date.now() / 1000) + 2 * 60 * 60, // 2 hours
          token_type: 'bearer',
          user,
        };

        return { 
          success: true, 
          data: { user, session }
        };
      }

      return {
        success: false,
        error: {
          code: 'INVALID_RESPONSE',
          message: 'Invalid refresh response',
        },
      };
    },

    forgotPassword: async (email: string): Promise<PayloadAPIResponse<{ message: string }>> => {
      return this.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.toLowerCase() }),
      });
    },

    resetPassword: async (token: string, password: string, passwordConfirm: string): Promise<PayloadAPIResponse<{ message: string }>> => {
      return this.request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          password,
          passwordConfirm,
        }),
      });
    },
  };

  /**
   * User Methods
   */
  public users = {
    getCurrentUser: async (): Promise<PayloadAPIResponse<AuthUser>> => {
      return this.authenticatedRequest('/users/me');
    },

    updateProfile: async (data: Partial<BaseUser>): Promise<PayloadAPIResponse<AuthUser>> => {
      return this.authenticatedRequest('/users/me/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    updatePreferences: async (preferences: Partial<UserPreferences>): Promise<PayloadAPIResponse<UserPreferences>> => {
      return this.authenticatedRequest('/users/me/preferences', {
        method: 'PATCH',
        body: JSON.stringify(preferences),
      });
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<PayloadAPIResponse<{ message: string }>> => {
      return this.authenticatedRequest('/users/me/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          passwordConfirm: newPassword,
        }),
      });
    },

    deleteAccount: async (): Promise<PayloadAPIResponse<{ message: string }>> => {
      return this.authenticatedRequest('/users/me/delete', {
        method: 'DELETE',
      });
    },
  };

  /**
   * Trip Methods
   */
  public trips = {
    getAll: async (params?: { page?: number; limit?: number; status?: string }): Promise<PayloadAPIResponse<{ docs: BaseTrip[]; totalPages: number; page: number; limit: number }>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.status) searchParams.append('status', params.status);

      const url = `/trips${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      return this.authenticatedRequest(url);
    },

    getById: async (id: string): Promise<PayloadAPIResponse<BaseTrip>> => {
      return this.authenticatedRequest(`/trips/${id}`);
    },

    create: async (tripData: Omit<BaseTrip, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'>): Promise<PayloadAPIResponse<BaseTrip>> => {
      return this.authenticatedRequest('/trips', {
        method: 'POST',
        body: JSON.stringify(tripData),
      });
    },

    update: async (id: string, tripData: Partial<BaseTrip>): Promise<PayloadAPIResponse<BaseTrip>> => {
      return this.authenticatedRequest(`/trips/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(tripData),
      });
    },

    delete: async (id: string): Promise<PayloadAPIResponse<{ message: string }>> => {
      return this.authenticatedRequest(`/trips/${id}`, {
        method: 'DELETE',
      });
    },

    approve: async (id: string): Promise<PayloadAPIResponse<BaseTrip>> => {
      return this.authenticatedRequest(`/trips/${id}/approve`, {
        method: 'POST',
      });
    },

    cancel: async (id: string, reason?: string): Promise<PayloadAPIResponse<BaseTrip>> => {
      return this.authenticatedRequest(`/trips/${id}/cancel`, {
        method: 'POST',
        body: reason ? JSON.stringify({ reason }) : undefined,
      });
    },

    duplicate: async (id: string): Promise<PayloadAPIResponse<BaseTrip>> => {
      return this.authenticatedRequest(`/trips/${id}/duplicate`, {
        method: 'POST',
      });
    },
  };

  /**
   * Make an authenticated request
   */
  private async authenticatedRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<PayloadAPIResponse<T>> {
    const token = await this.getAuthToken();
    
    if (!token) {
      return {
        success: false,
        error: {
          code: API_ERROR_CODES.TOKEN_INVALID,
          message: 'No authentication token available',
          statusCode: HTTP_STATUS.UNAUTHORIZED,
        },
      };
    }

    return this.request(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Make a request to the Payload API with retry logic
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<PayloadAPIResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    let attempt = 0;

    while (attempt < this.config.retryOptions.maxAttempts) {
      try {
        this.abortController = new AbortController();
        const timeoutId = setTimeout(() => this.abortController?.abort(), this.config.timeout);

        const response = await fetch(url, {
          ...options,
          signal: this.abortController.signal,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        // Handle successful responses
        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            data,
          };
        }

        // Handle error responses
        const errorData = await response.json().catch(() => ({}));
        
        // Handle token expiration
        if (response.status === HTTP_STATUS.UNAUTHORIZED && this.config.onTokenExpired) {
          await this.config.onTokenExpired();
        }

        return {
          success: false,
          error: {
            code: errorData.code || this.getErrorCodeFromStatus(response.status),
            message: errorData.message || `Request failed with status ${response.status}`,
            details: errorData.details,
            statusCode: response.status,
          },
        };

      } catch (error) {
        attempt++;

        // Don't retry on abort or non-network errors
        if (error instanceof Error && error.name === 'AbortError') {
          return {
            success: false,
            error: {
              code: 'REQUEST_TIMEOUT',
              message: 'Request timed out',
            },
          };
        }

        // If this was the last attempt, return the error
        if (attempt >= this.config.retryOptions.maxAttempts) {
          return {
            success: false,
            error: {
              code: 'NETWORK_ERROR',
              message: error instanceof Error ? error.message : 'Network error occurred',
            },
          };
        }

        // Wait before retrying
        const delay = this.config.retryOptions.delayMs * Math.pow(this.config.retryOptions.backoffMultiplier, attempt - 1);
        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript needs it
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Unknown error occurred',
      },
    };
  }

  /**
   * Get authentication token from provider
   */
  private async getAuthToken(): Promise<string | null> {
    if (this.config.authTokenProvider) {
      return this.config.authTokenProvider();
    }
    return null;
  }

  /**
   * Map HTTP status codes to error codes
   */
  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return API_ERROR_CODES.TOKEN_INVALID;
      case HTTP_STATUS.FORBIDDEN:
        return API_ERROR_CODES.INSUFFICIENT_PERMISSIONS;
      case HTTP_STATUS.NOT_FOUND:
        return API_ERROR_CODES.RESOURCE_NOT_FOUND;
      case HTTP_STATUS.CONFLICT:
        return API_ERROR_CODES.RESOURCE_CONFLICT;
      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        return API_ERROR_CODES.VALIDATION_FAILED;
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return API_ERROR_CODES.RATE_LIMIT_EXCEEDED;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return API_ERROR_CODES.INTERNAL_ERROR;
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return API_ERROR_CODES.SERVICE_UNAVAILABLE;
      default:
        return API_ERROR_CODES.INTERNAL_ERROR;
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cancel any ongoing requests
   */
  public cancelRequests(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Update client configuration
   */
  public updateConfig(config: Partial<PayloadClientConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Create a PayloadClient instance with custom configuration
 */
export function createPayloadClient(config?: Partial<PayloadClientConfig>): PayloadClient {
  return new PayloadClient(config);
}

/**
 * Default PayloadClient instance
 */
export const payloadClient = createPayloadClient();