# CS-MOBILE-001: Complete Mobile App Payload CMS Integration

## Priority
P1 - Core Feature

## Status
PENDING

## Description
Complete the integration between the React Native mobile app and Payload CMS APIs. Currently, the mobile app has basic auth setup but needs full integration with all Payload CMS endpoints for user management, trips, and preferences.

## Acceptance Criteria
- [ ] Update auth service to use all Payload CMS auth endpoints
- [ ] Create API client for Payload CMS communication
- [ ] Implement proper error handling for API calls
- [ ] Add request/response interceptors
- [ ] Configure API base URL from environment
- [ ] Add TypeScript types for all API responses
- [ ] Implement offline queue for failed requests

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