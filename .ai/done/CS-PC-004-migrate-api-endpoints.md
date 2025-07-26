# CS-PC-004: Migrate API Endpoints

## Priority
P1 - Core Feature

## Description
Create Payload CMS API endpoints to replace existing Supabase Edge Functions, ensuring all business logic is preserved and enhanced.

## Acceptance Criteria
- [x] Allowlist check endpoint
- [x] User preferences CRUD endpoints  
- [x] Trip management endpoints
- [ ] File upload endpoints
- [x] Custom business logic endpoints
- [ ] GraphQL schema properly configured
- [ ] REST API documentation generated

## Technical Details

### Implemented Endpoints:

#### ✅ Authentication
- POST /api/auth/check-allowlist - Check email allowlist
- POST /api/auth/register - User registration  
- POST /api/auth/verify-email - Email verification
- POST /api/auth/resend-verification - Resend verification email
- POST /api/auth/forgot-password - Password reset request
- POST /api/auth/reset-password - Password reset confirmation
- POST /api/auth/refresh-token - Token refresh
- POST /api/auth/logout - User logout

#### ✅ User Management
- GET /api/users/me - Get current user profile
- PUT /api/users/me - Update current user profile  
- GET /api/users/me/preferences - Get user preferences
- PATCH /api/users/me/preferences - Update user preferences
- GET /api/users/me/trips - Get user's trips
- GET /api/users/search - Search users for invitations
- GET /api/users/:id - Get user profile by ID

#### ✅ Trip Management
- GET /api/trips - Get trips with filtering
- GET /api/trips/:id - Get trip details by ID
- POST /api/trips - Create new trip
- PATCH /api/trips/:id - Update trip
- DELETE /api/trips/:id - Delete trip
- PATCH /api/trips/:id/status - Update trip status

#### 🚧 Still Needed
- POST /api/trips/:id/activities - Add trip activities/itinerary
- POST /api/media - File upload endpoint
- GraphQL schema configuration

### ✅ Implementation Completed:
- ✅ Used Payload's custom endpoints feature
- ✅ Implemented as Next.js API routes via Payload endpoints
- ✅ Added comprehensive validation and error handling utilities
- ✅ Included rate limiting middleware with configurable limits
- ✅ Proper authentication and authorization checks
- ✅ Standardized error responses and logging
- ✅ Input sanitization and validation
- ✅ CORS configuration for mobile app integration

### 📁 Files Created:
- `src/endpoints/auth-register.ts` - User registration
- `src/endpoints/auth-verify.ts` - Email verification  
- `src/endpoints/auth-refresh.ts` - Token refresh & logout
- `src/endpoints/user-me.ts` - User profile management (existing)
- `src/endpoints/user-preferences.ts` - User preferences CRUD
- `src/endpoints/user-trips.ts` - User trips & search
- `src/endpoints/trips-crud.ts` - Trip management CRUD
- `src/endpoints/check-allowlist.ts` - Allowlist validation (existing)
- `src/endpoints/password-reset.ts` - Password reset flow (existing)
- `src/middleware/rate-limit.ts` - Rate limiting middleware
- `src/utils/validation.ts` - Validation utilities
- `src/utils/error-handler.ts` - Error handling utilities

## Dependencies
- CS-PC-003 (Auth must be working)
- API documentation tool setup

## Notes
- Consider GraphQL for complex queries
- Implement request/response logging
- Add API key authentication for external access