# CS-WEB-003: Enable Static Data Testing for Web Dashboard

## Priority
High

## Estimated Effort
4-6 hours

## Overview
Enable the web dashboard to run in a mock/static data mode for testing user experience and flow without requiring a connected database or fully configured CMS backend.

## Background
- The web dashboard authentication is currently integrated with Payload CMS
- Testing requires both servers to be running with a configured database
- We need to validate UX flow and identify integration issues before full backend setup

## Requirements

### 1. Mock Authentication Service
- Create a mock authentication service (`auth.mock.ts`) that simulates the auth flow
- Support static test credentials:
  - Admin: `admin@test.com` / `test123`
  - Organizer: `organizer@test.com` / `test123`
- Mock JWT token generation and storage
- Simulate token refresh functionality

### 2. Environment Configuration
- Add `VITE_USE_MOCK_DATA` flag to enable/disable mock mode
- Update auth service to conditionally use mock implementation
- Ensure easy switching between mock and real API modes

### 3. Static Data Providers
- Create mock data service for dashboard statistics:
  - Total clients count
  - Active/upcoming trips
  - Revenue data
- Mock recent activity feed with realistic entries
- Mock upcoming trips list with sample data

### 4. Error Handling
- Gracefully handle API connection failures
- Display appropriate messages when in mock mode
- Ensure no real API calls are made in mock mode

## Technical Implementation

### File Structure
```
packages/web-dashboard/src/
├── services/
│   ├── auth.mock.ts         # Mock auth service
│   ├── data.mock.ts         # Mock data providers
│   └── auth.ts              # Updated to support mock mode
└── .env.local               # Add VITE_USE_MOCK_DATA flag
```

### Key Changes
1. Modify `auth.ts` to conditionally export mock or real service
2. Create comprehensive mock data that represents realistic scenarios
3. Add visual indicator on dashboard when running in mock mode

## Testing Checklist
- [ ] Login flow works with both test accounts
- [ ] Dashboard displays mock statistics correctly
- [ ] Protected routes redirect unauthenticated users
- [ ] Token refresh simulation works
- [ ] Logout clears session properly
- [ ] No console errors during mock operation

## Acceptance Criteria
1. Developer can toggle mock mode via environment variable
2. Complete login → dashboard → logout flow works without backend
3. All dashboard widgets display realistic mock data
4. Clear documentation on using mock mode
5. No production code is affected when mock mode is disabled

## Dependencies
- None - this should work independently

## Notes
- Consider adding a banner/badge indicating "Mock Mode" when active
- Mock data should be realistic to properly test UI responsiveness
- Ensure TypeScript types are shared between real and mock services

## Related Tasks
- CS-WEB-001: Initialize web dashboard (completed)
- CS-WEB-002: Implement dashboard authentication (completed)