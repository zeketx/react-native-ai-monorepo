# CS-PC-005: Update Mobile App Services

## Priority
P1 - Core Feature

## Description
Refactor all mobile app services to use Payload CMS APIs instead of Supabase, maintaining the same functionality while improving type safety and error handling.

## Acceptance Criteria
- [x] Replace Supabase client with Payload API client
- [x] Update auth service to use Payload endpoints
- [x] Update user service for profile management
- [x] Update trip service for trip operations
- [x] Implement proper error handling
- [x] Add retry logic for network failures
- [x] Update TypeScript types to match Payload schema

## Technical Details

### Services to Update:
1. **packages/shared/src/auth/**
   - Replace Supabase auth with Payload JWT auth
   - Update token management
   - Implement secure storage

2. **packages/mobile-app/src/auth/**
   - Update auth hooks and context
   - Modify login/logout flows
   - Handle token refresh

3. **API Client Setup**
   - Create PayloadClient class
   - Configure axios/fetch with interceptors
   - Add request/response transformers
   - Implement offline queue

### Code Structure:
```typescript
// packages/shared/src/api/payload-client.ts
class PayloadClient {
  constructor(baseURL: string)
  auth: AuthMethods
  users: UserMethods
  trips: TripMethods
}
```

## Dependencies
- CS-PC-004 (APIs must be ready)
- Updated TypeScript types from Payload

## Notes
- Maintain backward compatibility during transition
- Add feature flags for gradual rollout
- Ensure proper error messages for users

---

## Implementation Completed ✅

### What was delivered:
1. **PayloadClient class** (`packages/shared/src/api/payload-client.ts`)
   - Unified API client with auth, user, and trip methods
   - Proper error handling with retry logic and exponential backoff
   - Request/response transformers for Payload CMS format
   - Token management and authentication flow

2. **Updated Auth Service** (`packages/shared/src/auth/service.ts`)
   - Replaced Supabase auth with Payload JWT auth
   - Updated token management and session handling
   - Added password reset and user management methods
   - Maintained compatible API interface

3. **User Service** (`packages/shared/src/services/user-service.ts`)
   - Profile management operations
   - Password change functionality  
   - Preferences management
   - Proper validation and error handling

4. **Trip Service** (`packages/shared/src/services/trip-service.ts`)
   - Complete CRUD operations for trips
   - Trip approval and cancellation workflows
   - Search, filtering, and pagination
   - Trip statistics and analytics

5. **Updated Types** (`packages/shared/src/auth/types.ts`)
   - Removed Supabase dependencies
   - Added Payload-specific types and interfaces
   - Compatible AuthUser and AuthSession interfaces

6. **Package Structure**
   - Updated exports in `packages/shared/src/index.ts`
   - Removed Supabase dependency from package.json
   - All TypeScript compilation passes

### Key Features Implemented:
All acceptance criteria have been completed successfully. The mobile app services have been refactored to use Payload CMS APIs while maintaining backward compatibility and providing robust error handling.