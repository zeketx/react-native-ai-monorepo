# CS-PC-004: Migrate API Endpoints

## Priority
P1 - Core Feature

## Description
Create Payload CMS API endpoints to replace existing Supabase Edge Functions, ensuring all business logic is preserved and enhanced.

## Acceptance Criteria
- [ ] Allowlist check endpoint
- [ ] User preferences CRUD endpoints  
- [ ] Trip management endpoints
- [ ] File upload endpoints
- [ ] Custom business logic endpoints
- [ ] GraphQL schema properly configured
- [ ] REST API documentation generated

## Technical Details

### Endpoints to Implement:
1. **Auth Related**
   - POST /api/auth/check-allowlist
   - POST /api/auth/verify-email
   - POST /api/auth/refresh-token

2. **User Management**
   - GET/PUT /api/users/me
   - GET/PUT /api/users/me/preferences
   - GET /api/users/me/trips

3. **Trip Management**
   - CRUD /api/trips
   - POST /api/trips/:id/activities
   - POST /api/trips/:id/upload

### Implementation:
- Use Payload's custom endpoints feature
- Implement as Next.js API routes
- Add proper validation and error handling
- Include rate limiting
- Set up API versioning

## Dependencies
- CS-PC-003 (Auth must be working)
- API documentation tool setup

## Notes
- Consider GraphQL for complex queries
- Implement request/response logging
- Add API key authentication for external access