# CS-MOBILE-002: Implement Login UI and Flow

## Priority
P1 - Core Feature

## Status
PENDING

## Description
Create a polished login screen and authentication flow for the mobile app. Currently, there's a basic login.tsx file, but it needs to be fully implemented with proper UI, validation, and integration with the Payload CMS auth system.

## Acceptance Criteria
- [ ] Design and implement login screen UI
- [ ] Add email and password input validation
- [ ] Implement "Remember Me" functionality
- [ ] Add loading states during authentication
- [ ] Handle and display authentication errors
- [ ] Implement forgot password flow
- [ ] Add biometric authentication option (Face ID/Touch ID)
- [ ] Navigate to main app after successful login

## Technical Details

### UI Components:
1. **Login Screen Design**
   - Logo/branding at top
   - Email input with validation
   - Password input with show/hide toggle
   - Remember me checkbox
   - Login button with loading state
   - Forgot password link
   - Error message display area

2. **Form Validation**
   ```typescript
   // Validation rules
   - Email: Required, valid email format
   - Password: Required, minimum 8 characters
   - Show inline validation errors
   - Disable login button until valid
   ```

3. **Biometric Authentication**
   ```typescript
   import * as LocalAuthentication from 'expo-local-authentication';
   
   // Check if biometrics available
   // Prompt for biometric auth if enabled
   // Fall back to password if needed
   ```

4. **Error Handling**
   - Invalid credentials → "Email or password incorrect"
   - Network error → "Unable to connect. Please try again."
   - Account locked → "Account locked. Contact support."
   - Email not verified → Show verification prompt

### Navigation Flow:
```
Login Screen → (Success) → Main App
     ↓
Forgot Password → Password Reset Screen
```

## Dependencies
- CS-MOBILE-001 (Payload integration must be complete)
- Expo Local Authentication
- React Hook Form (for form handling)

## Notes
- Follow platform-specific design guidelines
- Ensure keyboard handling works properly
- Test on various screen sizes
- Consider adding social login in future