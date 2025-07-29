# CS-PC-005: Update Mobile App Services

## Priority
P1 - Core Feature

## Description
Refactor all mobile app services to use Payload CMS APIs instead of Supabase, maintaining the same functionality while improving type safety and error handling.

## Acceptance Criteria
- [ ] Replace Supabase client with Payload API client
- [ ] Update auth service to use Payload endpoints
- [ ] Update user service for profile management
- [ ] Update trip service for trip operations
- [ ] Implement proper error handling
- [ ] Add retry logic for network failures
- [ ] Update TypeScript types to match Payload schema

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