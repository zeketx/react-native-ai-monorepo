# Task: Add Phone Number Formatters and Validators

**ID:** CS-P2-007  
**Phase:** Onboarding  
**Dependencies:** CS-P2-006

## Objective
Implement a comprehensive phone number handling system that supports international formats, real-time formatting, and validation across the application.

## Context
The platform serves international travelers, requiring robust phone number handling for multiple countries. The formatter must handle various international formats while providing a seamless UX with real-time formatting as users type.

## Requirements
- Support for 50+ country codes with proper formatting
- Real-time formatting as user types
- Country code detection from device locale
- Validation for mobile vs landline numbers
- Copy/paste handling with format normalization
- E.164 format storage in database

## Technical Guidance
- Integrate `libphonenumber-js` for core functionality
- Create custom TextInput wrapper component
- Implement format-as-you-type functionality
- Use Country picker with search capability
- Cache country metadata for performance
- Handle edge cases (extensions, special characters)

## Component Architecture
```typescript
interface PhoneInputProps {
  value: string;
  onChangeText: (text: string, e164: string) => void;
  defaultCountry?: string;
  placeholder?: string;
  error?: string;
  allowLandline?: boolean;
}

// Utility functions
formatPhoneNumber(number: string, country: string): string
validatePhoneNumber(number: string, country: string): ValidationResult
parsePhoneNumber(input: string): ParsedNumber
```

## Implementation Details
- Country selector with flags and search
- Automatic country detection from number
- Format preservation during editing
- Cursor position management
- Performance optimization for large country lists

## Acceptance Criteria
- [ ] Formats numbers correctly for 50+ countries
- [ ] Real-time formatting without lag
- [ ] Validates mobile vs landline when required
- [ ] Handles paste events with auto-formatting
- [ ] Stores numbers in E.164 format
- [ ] Accessible country selector

## Where to Create
- `packages/mobile-app/src/components/form/PhoneInput.tsx`
- `packages/mobile-app/src/utils/phoneNumber.ts`
- `packages/shared/src/validators/phone.ts`

## Testing Requirements
- Unit tests for all format/validation functions
- Integration tests with form submission
- Edge case testing (special numbers, extensions)
- Performance testing with rapid input

## Estimated Effort
2 hours