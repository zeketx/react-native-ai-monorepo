/**
 * Error Handling Utilities
 * Custom error classes and error handling helpers for the application
 */

// Base application error class
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

// Authentication error class
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', code: string = 'AUTH_FAILED') {
    super(code, message, 401);
    this.name = 'AuthenticationError';
  }
}

// Authorization error class  
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', code: string = 'ACCESS_DENIED') {
    super(code, message, 403);
    this.name = 'AuthorizationError';
  }
}

// Validation error class
export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation failed',
    public field?: string,
    code: string = 'VALIDATION_ERROR'
  ) {
    super(code, message, 400);
    this.name = 'ValidationError';
  }
}

// Not found error class
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', code: string = 'NOT_FOUND') {
    super(code, `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

// Conflict error class
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', code: string = 'CONFLICT') {
    super(code, message, 409);
    this.name = 'ConflictError';
  }
}

// Rate limit error class
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', code: string = 'RATE_LIMIT_EXCEEDED') {
    super(code, message, 429);
    this.name = 'RateLimitError';
  }
}

// Error codes enum
export const ERROR_CODES = {
  // Authentication errors
  AUTH_FAILED: 'AUTH_FAILED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  
  // Authorization errors
  ACCESS_DENIED: 'ACCESS_DENIED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  NOT_ALLOWED: 'NOT_ALLOWED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PHONE: 'INVALID_PHONE',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  EMAIL_NOT_ALLOWED: 'EMAIL_NOT_ALLOWED',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  
  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  
  // File upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
} as const;

// Type for error codes
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Error response interface
export interface ErrorResponse {
  code: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  details?: Record<string, any>;
}

// Helper to check if error is operational (expected) vs programming error
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

// Helper to create standardized error response
export function createErrorResponse(
  error: AppError | Error,
  path?: string,
  details?: Record<string, any>
): ErrorResponse {
  const isAppError = error instanceof AppError;
  
  return {
    code: isAppError ? error.code : ERROR_CODES.INTERNAL_ERROR,
    message: error.message,
    statusCode: isAppError ? error.statusCode : 500,
    timestamp: new Date().toISOString(),
    path,
    details,
  };
}

// Helper to format validation errors
export function formatValidationErrors(errors: ValidationError[]): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  errors.forEach(error => {
    const field = error.field || 'general';
    if (!formatted[field]) {
      formatted[field] = [];
    }
    formatted[field].push(error.message);
  });
  
  return formatted;
}

// Helper to handle async errors
export function handleAsyncError<T>(
  promise: Promise<T>
): Promise<[Error | null, T | null]> {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[Error, null]>((error: Error) => [error, null]);
}

// Helper to wrap functions with error handling
export function withErrorHandler<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => TReturn | Promise<TReturn>,
  errorHandler?: (error: Error) => void
) {
  return async (...args: TArgs): Promise<TReturn | null> => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      if (errorHandler) {
        errorHandler(err);
      }
      
      // Re-throw operational errors, log programming errors
      if (!isOperationalError(err)) {
        console.error('Programming error:', err);
      }
      
      throw err;
    }
  };
}

// Helper to safely parse JSON with error handling
export function safeJsonParse<T = any>(jsonString: string): [Error | null, T | null] {
  try {
    const parsed = JSON.parse(jsonString);
    return [null, parsed];
  } catch (error) {
    return [error instanceof Error ? error : new Error('JSON parse error'), null];
  }
}

// Helper to retry operations with exponential backoff
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}