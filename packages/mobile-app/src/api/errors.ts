/**
 * API Error Handling Utilities
 * 
 * This module provides comprehensive error handling for API requests,
 * including user-friendly error messages and proper error categorization.
 */

export interface APIError {
  message: string
  code?: string
  errors?: Array<{
    field: string
    message: string
  }>
}

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  TIMEOUT = 'TIMEOUT',
  OFFLINE = 'OFFLINE',
  UNKNOWN = 'UNKNOWN',
}

export class PayloadAPIError extends Error {
  public readonly type: ErrorType
  public readonly code?: string
  public readonly errors?: Array<{ field: string; message: string }>
  public readonly originalError?: Error

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    code?: string,
    errors?: Array<{ field: string; message: string }>,
    originalError?: Error
  ) {
    super(message)
    this.name = 'PayloadAPIError'
    this.type = type
    this.code = code
    this.errors = errors
    this.originalError = originalError
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    switch (this.type) {
      case ErrorType.NETWORK:
        return 'Unable to connect to the server. Please check your internet connection and try again.'
      
      case ErrorType.AUTHENTICATION:
        return 'Please log in to continue.'
      
      case ErrorType.AUTHORIZATION:
        return 'You do not have permission to perform this action.'
      
      case ErrorType.VALIDATION:
        return this.errors && this.errors.length > 0
          ? this.errors[0].message
          : 'Please check your input and try again.'
      
      case ErrorType.SERVER:
        return 'Something went wrong on our end. Please try again later.'
      
      case ErrorType.TIMEOUT:
        return 'The request took too long to complete. Please try again.'
      
      case ErrorType.OFFLINE:
        return 'You are currently offline. Your changes will be synced when you reconnect.'
      
      default:
        return this.message || 'An unexpected error occurred. Please try again.'
    }
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return [
      ErrorType.NETWORK,
      ErrorType.TIMEOUT,
      ErrorType.SERVER,
    ].includes(this.type)
  }

  /**
   * Check if error requires authentication
   */
  requiresAuth(): boolean {
    return this.type === ErrorType.AUTHENTICATION
  }

  /**
   * Get validation errors for form fields
   */
  getFieldErrors(): Record<string, string> {
    if (!this.errors || this.type !== ErrorType.VALIDATION) {
      return {}
    }

    return this.errors.reduce((acc, error) => {
      acc[error.field] = error.message
      return acc
    }, {} as Record<string, string>)
  }
}

/**
 * Parse HTTP response error into PayloadAPIError
 */
export function parseResponseError(
  response: Response,
  data?: any
): PayloadAPIError {
  const status = response.status
  const statusText = response.statusText
  
  // Determine error type based on status code
  let errorType: ErrorType
  switch (status) {
    case 400:
      errorType = ErrorType.VALIDATION
      break
    case 401:
      errorType = ErrorType.AUTHENTICATION
      break
    case 403:
      errorType = ErrorType.AUTHORIZATION
      break
    case 408:
    case 504:
      errorType = ErrorType.TIMEOUT
      break
    case 500:
    case 502:
    case 503:
      errorType = ErrorType.SERVER
      break
    default:
      errorType = ErrorType.UNKNOWN
  }

  // Extract error details from response data
  const message = data?.message || data?.error || statusText || 'Request failed'
  const code = data?.code || `HTTP_${status}`
  const errors = data?.errors || []

  return new PayloadAPIError(message, errorType, code, errors)
}

/**
 * Parse network error into PayloadAPIError
 */
export function parseNetworkError(error: Error): PayloadAPIError {
  if (error.name === 'AbortError') {
    return new PayloadAPIError(
      'Request timeout',
      ErrorType.TIMEOUT,
      'TIMEOUT',
      [],
      error
    )
  }

  if (error.message.includes('network') || error.message.includes('fetch')) {
    return new PayloadAPIError(
      'Network error',
      ErrorType.NETWORK,
      'NETWORK_ERROR',
      [],
      error
    )
  }

  return new PayloadAPIError(
    error.message,
    ErrorType.UNKNOWN,
    'UNKNOWN_ERROR',
    [],
    error
  )
}

/**
 * Check if device is offline
 */
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine
}

/**
 * Create offline error
 */
export function createOfflineError(): PayloadAPIError {
  return new PayloadAPIError(
    'Device is offline',
    ErrorType.OFFLINE,
    'OFFLINE'
  )
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
}

/**
 * Calculate retry delay with exponential backoff
 */
export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const delay = Math.min(
    config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
    config.maxDelay
  )
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * delay
  return Math.floor(delay + jitter)
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry non-retryable errors
      if (error instanceof PayloadAPIError && !error.isRetryable()) {
        throw error
      }

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        break
      }

      // Wait before retrying
      const delay = calculateRetryDelay(attempt, config)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

/**
 * Error reporter for logging and analytics
 */
export interface ErrorReporter {
  reportError(error: PayloadAPIError, context?: Record<string, any>): void
}

class DefaultErrorReporter implements ErrorReporter {
  reportError(error: PayloadAPIError, context?: Record<string, any>): void {
    // Log error to console in development
    if (__DEV__) {
      console.error('PayloadAPIError:', {
        message: error.message,
        type: error.type,
        code: error.code,
        errors: error.errors,
        context,
        stack: error.stack,
      })
    }
    
    // In production, you might want to send to a service like Sentry
    // Sentry.captureException(error, { extra: context })
  }
}

let errorReporter: ErrorReporter = new DefaultErrorReporter()

/**
 * Set custom error reporter
 */
export function setErrorReporter(reporter: ErrorReporter): void {
  errorReporter = reporter
}

/**
 * Report error to configured reporter
 */
export function reportError(error: PayloadAPIError, context?: Record<string, any>): void {
  errorReporter.reportError(error, context)
}