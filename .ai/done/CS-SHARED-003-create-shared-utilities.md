# CS-SHARED-003: Create Shared Utilities and Constants

## Priority
P1 - Core Feature

## Status
PENDING

## Description
Implement shared utility functions and constants that are used across both the CMS and mobile app. This includes validation functions, formatters, API constants, and common helper functions.

## Acceptance Criteria
- [ ] Create validation utilities for common fields
- [ ] Create formatting utilities for dates, phone numbers, etc.
- [ ] Define API endpoint constants
- [ ] Define app configuration constants
- [ ] Create error handling utilities
- [ ] Add unit tests for all utilities
- [ ] Document all exported functions

## Technical Details

### Utilities to Implement:

```typescript
// src/utils/validation.ts
export const isValidEmail = (email: string): boolean => { /* ... */ }
export const isValidPhone = (phone: string): boolean => { /* ... */ }
export const isAllowedDomain = (email: string): boolean => { /* ... */ }

// src/utils/formatting.ts
export const formatPhone = (phone: string): string => { /* ... */ }
export const formatDate = (date: string | Date): string => { /* ... */ }
export const formatCurrency = (amount: number): string => { /* ... */ }

// src/constants/api.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    CHECK_ALLOWLIST: '/api/auth/check-allowlist'
  },
  USERS: {
    ME: '/api/users/me',
    PREFERENCES: '/api/users/me/preferences'
  },
  TRIPS: {
    LIST: '/api/trips',
    DETAIL: '/api/trips/:id'
  }
} as const;

// src/constants/app.ts
export const APP_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  TOKEN_REFRESH_BUFFER: 5 * 60 * 1000, // 5 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  ALLOWED_EMAIL_DOMAINS: ['@company.com', '@partner.com']
} as const;
```

### Error Handling:
```typescript
// src/utils/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(message);
  }
}

export const ERROR_CODES = {
  AUTH_FAILED: 'AUTH_FAILED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_ALLOWED: 'NOT_ALLOWED'
} as const;
```

## Dependencies
- CS-SHARED-001 (Shared package structure must exist)
- CS-SHARED-002 (Types should be defined first)

## Notes
- These utilities eliminate code duplication
- Should be well-tested as they're used throughout the app
- Keep utilities pure and side-effect free where possible