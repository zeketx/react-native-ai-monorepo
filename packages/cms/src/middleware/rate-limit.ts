// Simple in-memory rate limiter for API endpoints
// In production, consider using Redis or a dedicated rate limiting service

interface RateLimitRecord {
  count: number
  resetTime: number
}

class InMemoryRateLimiter {
  private records: Map<string, RateLimitRecord> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired records every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, record] of this.records.entries()) {
      if (now > record.resetTime) {
        this.records.delete(key)
      }
    }
  }

  checkLimit(identifier: string, maxRequests: number, windowMs: number): {
    allowed: boolean
    remaining: number
    resetTime: number
  } {
    const now = Date.now()
    const record = this.records.get(identifier)

    if (!record || now > record.resetTime) {
      // First request or window expired
      const newRecord: RateLimitRecord = {
        count: 1,
        resetTime: now + windowMs
      }
      this.records.set(identifier, newRecord)
      
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: newRecord.resetTime
      }
    }

    if (record.count >= maxRequests) {
      // Limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      }
    }

    // Increment count
    record.count++
    this.records.set(identifier, record)

    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

// Global rate limiter instance
const rateLimiter = new InMemoryRateLimiter()

export interface RateLimitOptions {
  maxRequests: number // Maximum requests per window
  windowMs: number    // Time window in milliseconds
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean     // Don't count failed requests
}

/**
 * Rate limiting middleware for Payload endpoints
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    maxRequests,
    windowMs,
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options

  return async (req: any, res: any, next?: Function) => {
    try {
      // Generate identifier (IP + user ID if authenticated)
      const ip = req.ip || req.connection?.remoteAddress || 'unknown'
      const userId = req.user?.id || 'anonymous'
      const identifier = `${ip}:${userId}`

      // Check rate limit
      const result = rateLimiter.checkLimit(identifier, maxRequests, windowMs)

      // Add rate limit headers
      const headers = {
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
      }

      if (!result.allowed) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: `Too many requests. Please try again after ${new Date(result.resetTime).toISOString()}`,
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...headers,
              'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
            }
          }
        )
      }

      // Set headers on successful request
      if (next) {
        // If used as express middleware
        Object.entries(headers).forEach(([key, value]) => {
          res.setHeader(key, value)
        })
        next()
      }

      return null // Allow request to proceed
    } catch (error) {
      console.error('Rate limit middleware error:', error)
      
      // Don't block requests if rate limiter fails
      if (next) {
        next()
      }
      return null
    }
  }
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Authentication endpoints - stricter limits
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  
  // General API endpoints
  api: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    skipSuccessfulRequests: false,
    skipFailedRequests: true
  },
  
  // Search endpoints - more lenient
  search: {
    maxRequests: 50,
    windowMs: 15 * 60 * 1000, // 15 minutes
    skipSuccessfulRequests: true,
    skipFailedRequests: true
  },
  
  // Upload endpoints - stricter limits
  upload: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }
}

/**
 * Utility function to apply rate limiting to an endpoint handler
 */
export function withRateLimit(handler: Function, config: RateLimitOptions) {
  return async (req: any) => {
    const rateLimitCheck = await rateLimit(config)(req, null)
    
    if (rateLimitCheck) {
      // Rate limit exceeded, return the rate limit response
      return rateLimitCheck
    }
    
    // Continue with original handler
    return handler(req)
  }
}

// Export the rate limiter instance for manual cleanup if needed
export { rateLimiter }