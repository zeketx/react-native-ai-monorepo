# CS-PC-004: Migrate API Endpoints

## Priority
P1 - Core Feature

## Status
IN PROGRESS - Started 2025-07-06

## Description
Create Payload CMS API endpoints to replace existing Supabase Edge Functions, ensuring all business logic is preserved and enhanced.

## Acceptance Criteria
- [ ] Allowlist check endpoint ✅ COMPLETED (in CS-PC-003)
- [ ] User preferences CRUD endpoints  
- [ ] Trip management endpoints
- [ ] File upload endpoints
- [ ] Custom business logic endpoints
- [ ] GraphQL schema properly configured
- [ ] REST API documentation generated

## Technical Details

### Endpoints to Implement:
1. **Auth Related** ✅ COMPLETED
   - POST /api/auth/check-allowlist ✅
   - POST /api/auth/verify-email ✅ (built-in)
   - POST /api/auth/refresh-token ✅ (built-in)

2. **User Management** 🔄 IN PROGRESS
   - GET/PUT /api/users/me
   - GET/PUT /api/users/me/preferences
   - GET /api/users/me/trips

3. **Trip Management** ⏳ PENDING
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
- CS-PC-003 (Auth must be working) ✅ COMPLETED

## Progress Notes

### Phase 1: Task Initiation (COMPLETED ✅)
- [x] Moved task from backlog to doing
- [x] Authentication endpoints already implemented in CS-PC-003
- [x] Ready to implement user and trip management endpoints

### Phase 2: Development (IN PROGRESS 🔄)
**Next Steps:**
1. Create user profile management endpoints
2. Implement trip CRUD endpoints  
3. Add file upload functionality
4. Configure GraphQL schema
5. Add proper API documentation

## Estimated Effort
- Original: 4-6 hours  
- Authentication endpoints: ✅ DONE (completed in CS-PC-003)
- Remaining: ~3-4 hours for user/trip endpoints

## Notes
- Consider GraphQL for complex queries
- Implement request/response logging
- Add API key authentication for external access