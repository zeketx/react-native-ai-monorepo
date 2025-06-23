# Task: Create Shared Constants and Configuration

**ID:** CS-P0-008  
**Phase:** Foundation  
**Dependencies:** CS-P0-007

## Objective
Define shared constants including tier-based options, API routes, validation patterns, and other configuration values used across both mobile and web applications.

## Acceptance Criteria
- [ ] Tier-based flight and hotel options are defined
- [ ] API route constants are created
- [ ] Validation patterns (email, phone) are included
- [ ] All constants are properly typed
- [ ] Constants are exported from index.ts

## Implementation Notes
1. Create packages/shared/src/constants.ts:
   ```typescript
   import { ClientTier } from './types.js'

   // Tier-based options
   export const FLIGHT_CLASSES_BY_TIER = {
     [ClientTier.STANDARD]: ['economy'],
     [ClientTier.PREMIUM]: ['economy', 'business'],
     [ClientTier.ELITE]: ['business', 'first']
   } as const

   export const HOTEL_CATEGORIES_BY_TIER = {
     [ClientTier.STANDARD]: ['3-star'],
     [ClientTier.PREMIUM]: ['4-star', 'boutique'],
     [ClientTier.ELITE]: ['5-star', 'boutique']
   } as const

   // API Routes
   export const API_ROUTES = {
     AUTH: {
       LOGIN: '/auth/login',
       LOGOUT: '/auth/logout',
       VERIFY_EMAIL: '/auth/verify-email'
     },
     CLIENTS: {
       LIST: '/clients',
       DETAIL: '/clients/:id',
       PREFERENCES: '/clients/:id/preferences'
     },
     TRIPS: {
       LIST: '/trips',
       DETAIL: '/trips/:id'
     },
     ALLOWLIST: {
       LIST: '/allowlist',
       ADD: '/allowlist/add',
       REMOVE: '/allowlist/:id'
     }
   } as const

   // Validation
   export const VALIDATION = {
     EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
     PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
     MIN_PASSWORD_LENGTH: 8
   } as const
   ```

2. Additional constants to include:
   - Default values for preferences
   - Activity types and intensity levels
   - Date/time formats
   - Error messages
   - Feature flags

3. Update packages/shared/src/index.ts:
   ```typescript
   export * from './types.js'
   export * from './constants.js'
   ```

## Testing
- Build the package and verify constants are accessible
- Import in a test file and check TypeScript inference
- Verify `as const` provides literal types

## Estimated Effort
1 hour