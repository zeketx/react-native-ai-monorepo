/**
 * Comprehensive error handling utilities for API endpoints
 */

export interface ApiError extends Error {
  statusCode?: number
  code?: string
  details?: any
}

export class CustomApiError extends Error implements ApiError {
  public statusCode: number
  public code: string
  public details?: any

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message)
    this.name = 'CustomApiError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

/**
 * Standard error response builder
 */
export function createErrorResponse(
  error: string | Error | ApiError,
  statusCode: number = 500,
  additionalData?: Record<string, any>
): Response {
  let message: string
  let code: string = 'INTERNAL_ERROR'
  let details: any = null
  let finalStatusCode = statusCode

  if (typeof error === 'string') {
    message = error
  } else if (error instanceof CustomApiError) {
    message = error.message
    code = error.code
    details = error.details
    finalStatusCode = error.statusCode
  } else if (error instanceof Error) {
    message = error.message
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      code = 'VALIDATION_ERROR'
      finalStatusCode = 400
      details = error.message || 'Validation failed'
    } else if (error.name === 'CastError') {
      code = 'INVALID_ID'
      finalStatusCode = 400
      message = 'Invalid ID format'
    } else if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
      code = 'DUPLICATE_ERROR'
      finalStatusCode = 409
      message = 'Resource already exists'
    } else if (error.message?.includes('not found')) {
      code = 'NOT_FOUND'
      finalStatusCode = 404
      message = 'Resource not found'
    }
  } else {
    message = 'An unexpected error occurred'
  }

  const responseBody = {
    success: false,
    error: message,
    code,
    ...(details && { details }),
    ...(additionalData && additionalData),
    timestamp: new Date().toISOString()
  }

  return new Response(JSON.stringify(responseBody), {
    status: finalStatusCode,
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * Authentication error responses
 */
export const authErrors = {
  unauthorized: () => createErrorResponse(
    'Authentication required', 
    401, 
    { code: 'UNAUTHORIZED', message: 'You must be logged in to access this endpoint' }
  ),
  
  forbidden: (message: string = 'Access denied') => createErrorResponse(
    message, 
    403, 
    { code: 'FORBIDDEN' }
  ),
  
  invalidToken: () => createErrorResponse(
    'Invalid or expired token', 
    401, 
    { code: 'INVALID_TOKEN' }
  ),
  
  accountLocked: () => createErrorResponse(
    'Account is locked or suspended', 
    403, 
    { code: 'ACCOUNT_LOCKED' }
  )
}

/**
 * Validation error responses
 */
export const validationErrors = {
  required: (field: string) => createErrorResponse(
    `${field} is required`, 
    400, 
    { code: 'REQUIRED_FIELD', field }
  ),
  
  invalid: (field: string, reason?: string) => createErrorResponse(
    `Invalid ${field}${reason ? `: ${reason}` : ''}`, 
    400, 
    { code: 'INVALID_FIELD', field }
  ),
  
  tooShort: (field: string, minLength: number) => createErrorResponse(
    `${field} must be at least ${minLength} characters`, 
    400, 
    { code: 'TOO_SHORT', field, minLength }
  ),
  
  tooLong: (field: string, maxLength: number) => createErrorResponse(
    `${field} must be no more than ${maxLength} characters`, 
    400, 
    { code: 'TOO_LONG', field, maxLength }
  )
}

/**
 * Resource error responses
 */
export const resourceErrors = {
  notFound: (resource: string = 'Resource') => createErrorResponse(
    `${resource} not found`, 
    404, 
    { code: 'NOT_FOUND' }
  ),
  
  alreadyExists: (resource: string = 'Resource') => createErrorResponse(
    `${resource} already exists`, 
    409, 
    { code: 'ALREADY_EXISTS' }
  ),
  
  cannotDelete: (resource: string, reason?: string) => createErrorResponse(
    `Cannot delete ${resource}${reason ? `: ${reason}` : ''}`, 
    400, 
    { code: 'CANNOT_DELETE' }
  )
}

/**
 * Rate limiting error response
 */
export const rateLimitError = (retryAfter: number) => createErrorResponse(
  'Rate limit exceeded', 
  429, 
  { 
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter,
    message: `Too many requests. Please try again in ${retryAfter} seconds.`
  }
)

/**
 * Server error responses
 */
export const serverErrors = {
  internal: (message: string = 'Internal server error') => createErrorResponse(
    message, 
    500, 
    { code: 'INTERNAL_ERROR' }
  ),
  
  serviceUnavailable: (service?: string) => createErrorResponse(
    `Service unavailable${service ? `: ${service}` : ''}`, 
    503, 
    { code: 'SERVICE_UNAVAILABLE' }
  ),
  
  timeout: () => createErrorResponse(
    'Request timeout', 
    408, 
    { code: 'TIMEOUT' }
  )
}

/**
 * Error logging utility
 */
export function logError(error: Error | ApiError | string, context?: Record<string, any>) {
  const timestamp = new Date().toISOString()
  const errorData = {
    timestamp,
    message: typeof error === 'string' ? error : error.message,
    ...(typeof error !== 'string' && {
      name: error.name,
      stack: error.stack,
      ...(error as ApiError).statusCode && { statusCode: (error as ApiError).statusCode },
      ...(error as ApiError).code && { code: (error as ApiError).code }
    }),
    ...(context && { context })
  }

  console.error('API Error:', JSON.stringify(errorData, null, 2))
}

/**
 * Async error handler wrapper
 */
export function asyncHandler(fn: Function) {
  return async (req: any, ...args: any[]) => {
    try {
      return await fn(req, ...args)
    } catch (error) {
      logError(error, { 
        path: req.url,
        method: req.method,
        user: req.user?.id,
        ip: req.ip
      })
      
      return createErrorResponse(error as Error)
    }
  }
}

/**
 * Success response builder
 */
export function createSuccessResponse(
  data?: any,
  message?: string,
  statusCode: number = 200,
  additionalData?: Record<string, any>
): Response {
  const responseBody = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    ...(additionalData && additionalData),
    timestamp: new Date().toISOString()
  }

  return new Response(JSON.stringify(responseBody), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * Standardized pagination response
 */
export function createPaginatedResponse(
  docs: any[],
  totalDocs: number,
  page: number,
  limit: number,
  additionalData?: Record<string, any>
): Response {
  const totalPages = Math.ceil(totalDocs / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return createSuccessResponse(
    docs,
    undefined,
    200,
    {
      pagination: {
        totalDocs,
        totalPages,
        page,
        limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      },
      ...(additionalData && additionalData)
    }
  )
}