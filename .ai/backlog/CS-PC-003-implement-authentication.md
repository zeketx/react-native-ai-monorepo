# CS-PC-003: Implement Authentication Strategy

## Priority
P1 - Core Feature

## Description
Set up authentication flow using Payload CMS auth system, including email verification, allowlist functionality, and JWT token management for the React Native app.

## Acceptance Criteria
- [ ] Email/password authentication working
- [ ] Email verification flow implemented
- [ ] Allowlist check before account creation
- [ ] JWT tokens for mobile app authentication
- [ ] Refresh token mechanism
- [ ] Logout functionality
- [ ] Password reset flow

## Technical Details

### Auth Flow:
1. User enters email on mobile app
2. Check email against allowlist (custom endpoint)
3. If allowed, create user with verification token
4. Send verification email
5. User verifies email
6. User sets password
7. Issue JWT + refresh token
8. Store tokens securely in mobile app

### Implementation:
- Use Payload's auth-enabled Users collection
- Create custom allowlist endpoint
- Implement email verification hooks
- Configure JWT strategy for mobile
- Use secure storage for tokens (expo-secure-store)

## Dependencies
- CS-PC-002 (Collections must exist)
- Email service configuration (SendGrid/Resend)

## Notes
- Consider magic link authentication as alternative
- Implement rate limiting on auth endpoints
- Add comprehensive error handling