# CS-MOBILE-001: Complete Mobile App Payload CMS Integration

## Priority
P1 - Core Feature

## Status
COMPLETED ✅

## Description
Complete the integration between the React Native mobile app and Payload CMS APIs. Currently, the mobile app has basic auth setup but needs full integration with all Payload CMS endpoints for user management, trips, and preferences.

## Acceptance Criteria
- [x] Update auth service to use all Payload CMS auth endpoints
- [x] Create API client for Payload CMS communication
- [x] Implement proper error handling for API calls
- [x] Add request/response interceptors
- [x] Configure API base URL from environment
- [x] Add TypeScript types for all API responses
- [x] Implement offline queue for failed requests

## Implementation Summary

### Files Created/Modified:
1. `src/api/client.ts` - Complete PayloadAPIClient with all endpoints
2. `src/api/errors.ts` - Comprehensive error handling system
3. `src/api/types.ts` - Full TypeScript type definitions
4. `src/api/index.ts` - Clean API module exports
5. `src/auth/service.ts` - Updated with new profile/preferences methods
6. `src/test-payload-api.ts` - Integration test suite
7. `.env.example` - Added Payload CMS configuration

### Key Features Implemented:
- ✅ Full API client with user, trip, media, and notification endpoints
- ✅ Automatic token refresh and authentication handling
- ✅ Comprehensive error handling with user-friendly messages
- ✅ Offline queue for mutation requests
- ✅ Retry logic with exponential backoff
- ✅ Complete TypeScript type safety
- ✅ Environment-based configuration
- ✅ Request/response interceptors for auth
- ✅ Integration with existing auth service

## Technical Details

### API Client Architecture:
```typescript
// src/api/client.ts
export class PayloadAPIClient {
  private baseURL: string;
  private authService: PayloadAuthService;
  
  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_PAYLOAD_URL;
    this.setupInterceptors();
  }
  
  // User endpoints
  async getCurrentUser(): Promise<User>
  async updateProfile(data: UpdateProfileDTO): Promise<User>
  async updatePreferences(prefs: PreferencesDTO): Promise<void>
  
  // Trip endpoints
  async getTrips(): Promise<Trip[]>
  async getTripDetails(id: string): Promise<Trip>
  async updateTripStatus(id: string, status: TripStatus): Promise<void>
  
  // Media endpoints
  async uploadMedia(file: File): Promise<MediaResponse>
}
```

### Environment Configuration:
```env
EXPO_PUBLIC_PAYLOAD_URL=http://localhost:3000
EXPO_PUBLIC_PAYLOAD_API_KEY=your-api-key
```

### Error Handling:
- Network errors → Show offline message
- 401 errors → Trigger token refresh
- 403 errors → Show permission denied
- 500 errors → Show generic error with retry

### Offline Support:
- Queue mutations when offline
- Sync when connection restored
- Show offline indicator in UI

## Dependencies
- CS-PC-003 (Payload auth must be complete)
- CS-PC-004 (API endpoints must be implemented)
- CS-SHARED-002 (Shared types must exist)

## Notes
- Should reuse existing auth storage implementation
- Consider implementing React Query for caching
- Must handle both iOS and Android networking