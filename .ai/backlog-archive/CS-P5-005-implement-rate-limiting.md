# Task: Implement Rate Limiting

**ID:** CS-P5-005  
**Phase:** Testing & Deployment  
**Dependencies:** CS-P4-005, CS-P1-004

## Objective
Implement comprehensive rate limiting across all API endpoints and authentication flows to prevent abuse, ensure fair usage, and protect system resources from malicious actors or misbehaving clients.

## Context
Rate limiting is essential for protecting the platform from various attacks including brute force, DDoS, and API abuse. The implementation must be intelligent enough to differentiate between legitimate high-usage patterns and potential abuse while maintaining excellent user experience for valid users.

## Requirements
- API endpoint rate limiting
- Authentication attempt limiting
- Tiered limits based on user type
- Distributed rate limiting
- Custom limit configuration
- Monitoring and alerting

## Technical Guidance
- Use token bucket algorithm
- Implement with Redis
- Apply at multiple layers
- Create bypass mechanisms
- Log limit violations
- Generate metrics

## Rate Limiting Architecture
```typescript
interface RateLimitingSystem {
  // Core limiting
  checkLimit(key: string, rule: RateLimitRule): Promise<RateLimitResult>;
  consumeToken(key: string, tokens?: number): Promise<boolean>;
  
  // Configuration
  setRule(endpoint: string, rule: RateLimitRule): Promise<void>;
  getRules(): Promise<Map<string, RateLimitRule>>;
  
  // Management
  resetLimit(key: string): Promise<void>;
  getUsage(key: string): Promise<UsageStats>;
  
  // Monitoring
  getViolations(timeRange: TimeRange): Promise<Violation[]>;
  subscribeToViolations(callback: (violation: Violation) => void): Unsubscribe;
}

interface RateLimitRule {
  windowMs: number;           // Time window in milliseconds
  maxRequests: number;        // Max requests per window
  keyGenerator?: KeyGenerator; // How to identify clients
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  handler?: RateLimitHandler;
  message?: string;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}
```

## Supabase Edge Function Implementation
```typescript
// supabase/functions/shared/rateLimiter.ts
import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';

export class RateLimiter {
  private redis: Redis;
  private rules: Map<string, RateLimitRule>;
  
  constructor() {
    this.redis = new Redis({
      url: Deno.env.get('REDIS_URL')!,
      token: Deno.env.get('REDIS_TOKEN')!,
    });
    
    this.rules = this.initializeRules();
  }
  
  private initializeRules(): Map<string, RateLimitRule> {
    return new Map([
      // Authentication endpoints
      ['auth.login', {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5,
        skipSuccessfulRequests: true,
        message: 'Too many login attempts. Please try again later.',
      }],
      
      ['auth.password-reset', {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 3,
        message: 'Too many password reset requests.',
      }],
      
      // API endpoints - default
      ['api.default', {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 60,
      }],
      
      // API endpoints - expensive operations
      ['api.export', {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 10,
      }],
      
      ['api.bulk-update', {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 5,
      }],
      
      // Mobile app endpoints
      ['mobile.allowlist-check', {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10,
      }],
      
      ['mobile.preferences-update', {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 20,
      }],
    ]);
  }
  
  async checkLimit(
    endpoint: string,
    identifier: string,
    options?: CheckOptions
  ): Promise<RateLimitResult> {
    const rule = this.rules.get(endpoint) || this.rules.get('api.default')!;
    const key = this.generateKey(endpoint, identifier);
    
    // Get current usage
    const usage = await this.redis.get<number>(key) || 0;
    const ttl = await this.redis.ttl(key);
    
    // Check if limit exceeded
    const allowed = usage < rule.maxRequests;
    const remaining = Math.max(0, rule.maxRequests - usage);
    const resetAt = ttl > 0 
      ? new Date(Date.now() + ttl * 1000)
      : new Date(Date.now() + rule.windowMs);
    
    // Consume token if allowed and not just checking
    if (allowed && !options?.dryRun) {
      const shouldIncrement = this.shouldIncrement(rule, options);
      
      if (shouldIncrement) {
        await this.incrementUsage(key, rule.windowMs);
      }
    }
    
    return {
      allowed,
      limit: rule.maxRequests,
      remaining,
      resetAt,
      retryAfter: allowed ? undefined : Math.ceil(ttl),
    };
  }
  
  private async incrementUsage(key: string, windowMs: number): Promise<void> {
    const multi = this.redis.multi();
    multi.incr(key);
    multi.expire(key, Math.ceil(windowMs / 1000));
    await multi.exec();
  }
  
  private shouldIncrement(rule: RateLimitRule, options?: CheckOptions): boolean {
    if (options?.success && rule.skipSuccessfulRequests) return false;
    if (!options?.success && rule.skipFailedRequests) return false;
    return true;
  }
  
  private generateKey(endpoint: string, identifier: string): string {
    return `rate_limit:${endpoint}:${identifier}`;
  }
  
  async resetLimit(endpoint: string, identifier: string): Promise<void> {
    const key = this.generateKey(endpoint, identifier);
    await this.redis.del(key);
  }
  
  async getUsageStats(identifier: string): Promise<UsageStats> {
    const pattern = `rate_limit:*:${identifier}`;
    const keys = await this.redis.keys(pattern);
    
    const stats: UsageStats = {
      identifier,
      endpoints: {},
      totalRequests: 0,
    };
    
    for (const key of keys) {
      const [, endpoint] = key.split(':').slice(1);
      const usage = await this.redis.get<number>(key) || 0;
      const ttl = await this.redis.ttl(key);
      
      stats.endpoints[endpoint] = {
        usage,
        resetAt: new Date(Date.now() + ttl * 1000),
      };
      stats.totalRequests += usage;
    }
    
    return stats;
  }
}
```

## Middleware Implementation
```typescript
// packages/web-dashboard/src/middleware/rateLimiter.ts
import { Request, Response, NextFunction } from 'express';
import { RateLimiter } from '../services/rateLimiter';

export interface RateLimitOptions {
  endpoint?: string;
  keyGenerator?: (req: Request) => string;
  onLimitReached?: (req: Request, res: Response) => void;
  skipIf?: (req: Request) => boolean;
}

export function rateLimitMiddleware(options: RateLimitOptions = {}) {
  const rateLimiter = new RateLimiter();
  
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip if condition met
      if (options.skipIf?.(req)) {
        return next();
      }
      
      // Generate identifier
      const identifier = options.keyGenerator?.(req) || 
        req.ip || 
        req.headers['x-forwarded-for'] as string ||
        'anonymous';
      
      // Determine endpoint
      const endpoint = options.endpoint || req.path;
      
      // Check rate limit
      const result = await rateLimiter.checkLimit(endpoint, identifier);
      
      // Set headers
      res.setHeader('X-RateLimit-Limit', result.limit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());
      
      if (!result.allowed) {
        res.setHeader('Retry-After', result.retryAfter || 60);
        
        if (options.onLimitReached) {
          return options.onLimitReached(req, res);
        }
        
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: result.retryAfter,
        });
      }
      
      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open - allow request if rate limiting fails
      next();
    }
  };
}

// Specific middleware instances
export const authRateLimiter = rateLimitMiddleware({
  endpoint: 'auth.login',
  keyGenerator: (req) => req.body.email || req.ip,
  onLimitReached: (req, res) => {
    // Log potential brute force attempt
    logger.warn('Login rate limit exceeded', {
      email: req.body.email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Your account has been temporarily locked. Please try again in 15 minutes.',
    });
  },
});

export const apiRateLimiter = rateLimitMiddleware({
  keyGenerator: (req) => {
    // Use API key if available, otherwise IP
    const apiKey = req.headers['x-api-key'] as string;
    return apiKey ? `api:${apiKey}` : `ip:${req.ip}`;
  },
  skipIf: (req) => {
    // Skip rate limiting for internal services
    const internalToken = req.headers['x-internal-token'];
    return internalToken === process.env.INTERNAL_SERVICE_TOKEN;
  },
});
```

## React Hook for Client-Side Rate Limiting
```typescript
// packages/web-dashboard/src/hooks/useRateLimit.ts
interface UseRateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
  onLimitReached?: () => void;
}

export const useRateLimit = ({
  key,
  limit,
  windowMs,
  onLimitReached,
}: UseRateLimitOptions) => {
  const [attempts, setAttempts] = useState<number[]>([]);
  const [isLimited, setIsLimited] = useState(false);
  
  useEffect(() => {
    // Load attempts from localStorage
    const stored = localStorage.getItem(`rateLimit:${key}`);
    if (stored) {
      const parsedAttempts = JSON.parse(stored);
      setAttempts(parsedAttempts.filter(
        (timestamp: number) => Date.now() - timestamp < windowMs
      ));
    }
  }, [key, windowMs]);
  
  const checkLimit = useCallback((): boolean => {
    const now = Date.now();
    const recentAttempts = attempts.filter(
      timestamp => now - timestamp < windowMs
    );
    
    if (recentAttempts.length >= limit) {
      setIsLimited(true);
      onLimitReached?.();
      return false;
    }
    
    return true;
  }, [attempts, limit, windowMs, onLimitReached]);
  
  const recordAttempt = useCallback(() => {
    const now = Date.now();
    const newAttempts = [...attempts, now].filter(
      timestamp => now - timestamp < windowMs
    );
    
    setAttempts(newAttempts);
    localStorage.setItem(`rateLimit:${key}`, JSON.stringify(newAttempts));
    
    if (newAttempts.length >= limit) {
      setIsLimited(true);
    }
  }, [attempts, key, limit, windowMs]);
  
  const reset = useCallback(() => {
    setAttempts([]);
    setIsLimited(false);
    localStorage.removeItem(`rateLimit:${key}`);
  }, [key]);
  
  const getRemainingAttempts = useCallback((): number => {
    const now = Date.now();
    const recentAttempts = attempts.filter(
      timestamp => now - timestamp < windowMs
    );
    return Math.max(0, limit - recentAttempts.length);
  }, [attempts, limit, windowMs]);
  
  const getResetTime = useCallback((): Date | null => {
    if (attempts.length === 0) return null;
    
    const oldestAttempt = Math.min(...attempts);
    return new Date(oldestAttempt + windowMs);
  }, [attempts, windowMs]);
  
  return {
    checkLimit,
    recordAttempt,
    reset,
    isLimited,
    remainingAttempts: getRemainingAttempts(),
    resetTime: getResetTime(),
  };
};

// Usage example
const LoginForm = () => {
  const { checkLimit, recordAttempt, isLimited, remainingAttempts } = useRateLimit({
    key: 'login-attempts',
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    onLimitReached: () => {
      toast.error('Too many login attempts. Please try again later.');
    },
  });
  
  const handleSubmit = async (data: LoginData) => {
    if (!checkLimit()) {
      return;
    }
    
    try {
      await login(data);
    } catch (error) {
      recordAttempt();
      
      if (remainingAttempts <= 2) {
        toast.warning(`${remainingAttempts} attempts remaining`);
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <Button type="submit" disabled={isLimited}>
        {isLimited ? 'Too many attempts' : 'Login'}
      </Button>
    </form>
  );
};
```

## Tiered Rate Limits
```typescript
// src/config/rateLimits.ts
export const RATE_LIMIT_TIERS = {
  anonymous: {
    'api.default': { windowMs: 60000, maxRequests: 30 },
    'api.export': { windowMs: 3600000, maxRequests: 2 },
    'auth.login': { windowMs: 900000, maxRequests: 3 },
  },
  
  authenticated: {
    'api.default': { windowMs: 60000, maxRequests: 120 },
    'api.export': { windowMs: 3600000, maxRequests: 20 },
    'api.bulk-update': { windowMs: 60000, maxRequests: 10 },
  },
  
  organizer: {
    'api.default': { windowMs: 60000, maxRequests: 300 },
    'api.export': { windowMs: 3600000, maxRequests: 50 },
    'api.bulk-update': { windowMs: 60000, maxRequests: 30 },
    'api.analytics': { windowMs: 60000, maxRequests: 100 },
  },
  
  admin: {
    'api.default': { windowMs: 60000, maxRequests: 1000 },
    'api.export': { windowMs: 3600000, maxRequests: 200 },
    'api.bulk-update': { windowMs: 60000, maxRequests: 100 },
    'api.admin': { windowMs: 60000, maxRequests: 500 },
  },
  
  service: {
    // Internal services have higher limits
    'api.default': { windowMs: 60000, maxRequests: 10000 },
  },
};

export function getRateLimitForUser(
  user: User | null,
  endpoint: string
): RateLimitRule {
  const tier = user?.role || 'anonymous';
  const limits = RATE_LIMIT_TIERS[tier];
  
  return limits[endpoint] || limits['api.default'];
}
```

## Monitoring and Alerting
```typescript
// src/services/rateLimitMonitor.ts
export class RateLimitMonitor {
  private violations: Violation[] = [];
  private subscribers: Set<(violation: Violation) => void> = new Set();
  
  async logViolation(violation: Violation): Promise<void> {
    this.violations.push(violation);
    
    // Store in database
    await supabase.from('rate_limit_violations').insert({
      identifier: violation.identifier,
      endpoint: violation.endpoint,
      timestamp: violation.timestamp,
      metadata: violation.metadata,
    });
    
    // Notify subscribers
    this.subscribers.forEach(callback => callback(violation));
    
    // Check for patterns
    await this.detectPatterns(violation);
  }
  
  private async detectPatterns(violation: Violation): Promise<void> {
    const recentViolations = this.violations.filter(
      v => Date.now() - v.timestamp.getTime() < 3600000 // Last hour
    );
    
    // Detect brute force attempts
    const loginViolations = recentViolations.filter(
      v => v.endpoint === 'auth.login' && v.identifier === violation.identifier
    );
    
    if (loginViolations.length >= 3) {
      await this.triggerAlert({
        type: 'BRUTE_FORCE_ATTEMPT',
        severity: 'high',
        identifier: violation.identifier,
        details: {
          attempts: loginViolations.length,
          endpoints: ['auth.login'],
        },
      });
    }
    
    // Detect API abuse
    const apiViolations = recentViolations.filter(
      v => v.identifier === violation.identifier
    );
    
    if (apiViolations.length >= 10) {
      await this.triggerAlert({
        type: 'API_ABUSE',
        severity: 'medium',
        identifier: violation.identifier,
        details: {
          violations: apiViolations.length,
          endpoints: [...new Set(apiViolations.map(v => v.endpoint))],
        },
      });
    }
  }
  
  private async triggerAlert(alert: SecurityAlert): Promise<void> {
    // Send to monitoring system
    await monitoringService.sendAlert(alert);
    
    // Log for audit
    await auditLogger.log({
      type: 'SECURITY_ALERT',
      alert,
      timestamp: new Date(),
    });
    
    // Take automatic action if needed
    if (alert.severity === 'high') {
      await this.blockIdentifier(alert.identifier);
    }
  }
  
  private async blockIdentifier(identifier: string): Promise<void> {
    await redis.setex(
      `blocked:${identifier}`,
      86400, // 24 hours
      JSON.stringify({
        reason: 'Automatic block due to rate limit violations',
        blockedAt: new Date(),
      })
    );
  }
}
```

## Testing Rate Limits
```typescript
// cypress/e2e/security/rate-limiting.cy.ts
describe('Rate Limiting', () => {
  it('should enforce login rate limits', () => {
    // Make 5 failed login attempts
    for (let i = 0; i < 5; i++) {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: 'test@example.com',
          password: `wrong${i}`,
        },
        failOnStatusCode: false,
      });
    }
    
    // 6th attempt should be rate limited
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'test@example.com',
        password: 'password',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(429);
      expect(response.headers).to.have.property('x-ratelimit-remaining', '0');
      expect(response.headers).to.have.property('retry-after');
      expect(response.body).to.have.property('error', 'Too many login attempts');
    });
  });
  
  it('should respect tier-based limits', () => {
    // Test as anonymous user
    cy.makeRequests('/api/clients', 31).then((responses) => {
      const lastResponse = responses[responses.length - 1];
      expect(lastResponse.status).to.equal(429);
    });
    
    // Test as authenticated user
    cy.login();
    cy.makeRequests('/api/clients', 121).then((responses) => {
      const validResponses = responses.filter(r => r.status === 200);
      expect(validResponses).to.have.length(120);
    });
  });
});
```

## Acceptance Criteria
- [ ] Rate limits enforce correctly
- [ ] Headers return limit info
- [ ] Tiered limits work properly
- [ ] Violations are logged
- [ ] Alerts trigger for patterns
- [ ] Client-side limiting works

## Where to Create
- `supabase/functions/shared/rateLimiter.ts`
- `packages/web-dashboard/src/middleware/rateLimiter.ts`
- `packages/web-dashboard/src/hooks/useRateLimit.ts`

## Configuration
- Redis for distributed state
- Environment-based limits
- Dynamic rule updates
- Bypass for internal services
- Monitoring integration

## Estimated Effort
3 hours