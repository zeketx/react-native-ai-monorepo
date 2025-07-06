/**
 * Payload CMS API Client
 * 
 * This client handles all communication with the Payload CMS backend API.
 * It provides a centralized way to make API requests with proper error handling,
 * authentication, and offline support.
 */

// import type { AuthUser } from '../auth/index.js' // Unused import
import { getAuthService } from '../auth/service.js'
import { SecureTokenStorage } from '../auth/storage.js'
import { 
  PayloadAPIError, 
  ErrorType, 
  parseResponseError, 
  parseNetworkError, 
  createOfflineError, 
  isOffline, 
  retryWithBackoff, 
  reportError,
  type RetryConfig,
  DEFAULT_RETRY_CONFIG
} from './errors.js'

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_CMS_API_URL || 'http://localhost:3001/api'
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000', 10)

import type {
  User,
  Trip,
  TripStatus,
  Media,
  UpdateProfileDTO,
  UpdatePreferencesDTO,
  CreateTripDTO,
  UpdateTripDTO,
  CreateItineraryItemDTO,
  UpdateItineraryItemDTO,
  ItineraryItem,
  TripSearchQuery,
  UserSearchQuery,
  PaginatedResponse,
  MediaUploadResponse,
  Notification,
  // APIResponse as BaseAPIResponse, // Unused import
} from './types.js'

// Re-export commonly used types
export type { User, Trip, TripStatus, Media, UpdateProfileDTO, UpdatePreferencesDTO }

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: PayloadAPIError
  message?: string
}

/**
 * Payload CMS API Client
 */
export class PayloadAPIClient {
  private baseURL: string
  private timeout: number
  private retryConfig: RetryConfig
  private offlineQueue: Array<{
    endpoint: string
    options: RequestInit
    resolve: (value: any) => void
    reject: (reason?: any) => void
  }> = []

  constructor(
    baseURL: string = API_BASE_URL, 
    timeout: number = API_TIMEOUT,
    retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
  ) {
    this.baseURL = baseURL
    this.timeout = timeout
    this.retryConfig = retryConfig
  }

  /**
   * Make authenticated API request with automatic token refresh
   */
  private async makeRequest<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    return retryWithBackoff(async () => {
      return this.makeRequestInternal<T>(endpoint, options)
    }, this.retryConfig)
  }

  /**
   * Internal request method with error handling
   */
  private async makeRequestInternal<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    // Check if offline
    if (isOffline()) {
      // Queue mutation requests for offline sync
      if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
        return this.queueOfflineRequest(endpoint, options)
      }
      
      throw createOfflineError()
    }
    
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
      
      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          const authService = getAuthService()
          const refreshResult = await authService.refreshToken()
          
          if (refreshResult.success) {
            // Retry request with new token
            return this.makeRequestInternal(endpoint, options)
          } else {
            // Authentication failed
            const error = new PayloadAPIError(
              'Authentication required',
              ErrorType.AUTHENTICATION,
              'AUTH_REQUIRED'
            )
            reportError(error, { endpoint, method: options.method })
            throw error
          }
        }
        
        // Parse HTTP error response
        const errorData = await response.json().catch(() => ({}))
        const error = parseResponseError(response, errorData)
        reportError(error, { endpoint, method: options.method })
        throw error
      }
      
      const data = await response.json()
      return {
        success: true,
        data,
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      // If it's already a PayloadAPIError, re-throw it
      if (error instanceof PayloadAPIError) {
        throw error
      }
      
      // Parse network error
      const networkError = parseNetworkError(error as Error)
      reportError(networkError, { endpoint, method: options.method })
      throw networkError
    }
  }

  /**
   * Queue request for offline sync
   */
  private async queueOfflineRequest<T = any>(
    endpoint: string, 
    options: RequestInit
  ): Promise<APIResponse<T>> {
    return new Promise((resolve, reject) => {
      this.offlineQueue.push({
        endpoint,
        options,
        resolve,
        reject,
      })
      
      // Return offline response
      resolve({
        success: false,
        error: createOfflineError(),
      })
    })
  }

  /**
   * Process offline queue when connection is restored
   */
  async processOfflineQueue(): Promise<void> {
    if (isOffline()) {
      console.warn('Cannot process offline queue: still offline')
      return
    }

    const queue = [...this.offlineQueue]
    this.offlineQueue = []
    
    for (const { endpoint, options, resolve, reject } of queue) {
      try {
        const result = await this.makeRequestInternal(endpoint, options)
        resolve(result)
      } catch (error) {
        if (error instanceof PayloadAPIError) {
          resolve({
            success: false,
            error,
          })
        } else {
          reject(error)
        }
      }
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<APIResponse<User>> {
    return this.makeRequest<User>('/users/me')
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileDTO): Promise<APIResponse<User>> {
    return this.makeRequest<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update user preferences
   */
  async updatePreferences(prefs: UpdatePreferencesDTO): Promise<APIResponse<void>> {
    return this.makeRequest<void>('/users/me/preferences', {
      method: 'PATCH',
      body: JSON.stringify(prefs),
    })
  }

  /**
   * Get user's trips
   */
  async getTrips(query?: TripSearchQuery): Promise<APIResponse<PaginatedResponse<Trip>>> {
    const params = new URLSearchParams()
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v))
          } else {
            params.append(key, value.toString())
          }
        }
      })
    }
    
    const queryString = params.toString()
    const endpoint = queryString ? `/trips?${queryString}` : '/trips'
    
    return this.makeRequest<PaginatedResponse<Trip>>(endpoint)
  }

  /**
   * Get trip details by ID
   */
  async getTripDetails(id: string): Promise<APIResponse<Trip>> {
    return this.makeRequest<Trip>(`/trips/${id}`)
  }

  /**
   * Create new trip
   */
  async createTrip(data: CreateTripDTO): Promise<APIResponse<Trip>> {
    return this.makeRequest<Trip>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update trip
   */
  async updateTrip(id: string, data: UpdateTripDTO): Promise<APIResponse<Trip>> {
    return this.makeRequest<Trip>(`/trips/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update trip status
   */
  async updateTripStatus(id: string, status: TripStatus): Promise<APIResponse<void>> {
    return this.makeRequest<void>(`/trips/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  /**
   * Delete trip
   */
  async deleteTrip(id: string): Promise<APIResponse<void>> {
    return this.makeRequest<void>(`/trips/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Upload media file
   */
  async uploadMedia(file: File): Promise<APIResponse<MediaUploadResponse>> {
    const formData = new FormData()
    formData.append('file', file)
    
    return this.makeRequest<MediaUploadResponse>('/media', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let the browser set it
      },
    })
  }

  /**
   * Delete media file
   */
  async deleteMedia(id: string): Promise<APIResponse<void>> {
    return this.makeRequest<void>(`/media/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Get media file details
   */
  async getMediaDetails(id: string): Promise<APIResponse<Media>> {
    return this.makeRequest<Media>(`/media/${id}`)
  }

  /**
   * Create itinerary item
   */
  async createItineraryItem(data: CreateItineraryItemDTO): Promise<APIResponse<ItineraryItem>> {
    return this.makeRequest<ItineraryItem>('/itinerary', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update itinerary item
   */
  async updateItineraryItem(id: string, data: UpdateItineraryItemDTO): Promise<APIResponse<ItineraryItem>> {
    return this.makeRequest<ItineraryItem>(`/itinerary/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * Delete itinerary item
   */
  async deleteItineraryItem(id: string): Promise<APIResponse<void>> {
    return this.makeRequest<void>(`/itinerary/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Get user notifications
   */
  async getNotifications(page: number = 1, limit: number = 20): Promise<APIResponse<PaginatedResponse<Notification>>> {
    return this.makeRequest<PaginatedResponse<Notification>>(`/notifications?page=${page}&limit=${limit}`)
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(id: string): Promise<APIResponse<void>> {
    return this.makeRequest<void>(`/notifications/${id}/read`, {
      method: 'PATCH',
    })
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<APIResponse<void>> {
    return this.makeRequest<void>('/notifications/read-all', {
      method: 'PATCH',
    })
  }

  /**
   * Search users (for inviting to trips)
   */
  async searchUsers(query: UserSearchQuery): Promise<APIResponse<PaginatedResponse<User>>> {
    const params = new URLSearchParams()
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString())
      }
    })
    
    const queryString = params.toString()
    const endpoint = queryString ? `/users/search?${queryString}` : '/users/search'
    
    return this.makeRequest<PaginatedResponse<User>>(endpoint)
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<APIResponse<{ status: string }>> {
    return this.makeRequest<{ status: string }>('/health')
  }

  /**
   * Check if client is online
   */
  get isOnline(): boolean {
    return !isOffline()
  }

  /**
   * Get offline queue size
   */
  get offlineQueueSize(): number {
    return this.offlineQueue.length
  }
}

/**
 * Singleton API client instance
 */
let apiClientInstance: PayloadAPIClient | null = null

/**
 * Get the API client instance
 */
export function getAPIClient(): PayloadAPIClient {
  if (!apiClientInstance) {
    apiClientInstance = new PayloadAPIClient()
  }
  
  return apiClientInstance
}

/**
 * Reset API client instance (useful for testing)
 */
export function resetAPIClient(): void {
  apiClientInstance = null
}

/**
 * Initialize API client with custom configuration
 */
export function initializeAPIClient(baseURL?: string, timeout?: number): PayloadAPIClient {
  apiClientInstance = new PayloadAPIClient(baseURL, timeout)
  return apiClientInstance
}