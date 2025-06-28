# Task: Implement Personal Details Screen

**ID:** CS-P2-006  
**Phase:** Onboarding  
**Dependencies:** CS-P2-005

## Objective
Create the personal details collection screen as the first step in the onboarding flow, gathering essential client information with proper validation and tier-based field requirements.

## Context
This screen collects foundational client data including full name, phone number, date of birth, and emergency contact information. Field requirements vary by client tier, with Platinum tier requiring additional verification fields.

## Requirements
- Form fields: full name, phone, date of birth, emergency contact
- International phone number formatting and validation
- Date picker with age validation (18+ requirement)
- Tier-based conditional fields (Platinum: passport number)
- Real-time validation with error messages
- Auto-save draft to AsyncStorage

## Technical Guidance
- Use React Hook Form for form state management
- Implement `libphonenumber-js` for phone validation
- Use platform-specific date pickers (iOS/Android)
- Apply Zod schema for runtime validation
- Store draft data in AsyncStorage for recovery
- Use OnboardingScreenTemplate from CS-P2-005

## Form Schema
```typescript
const personalDetailsSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phoneNumber: z.string().regex(phoneRegex),
  dateOfBirth: z.date().max(eighteenYearsAgo),
  emergencyContact: z.object({
    name: z.string().min(2),
    phoneNumber: z.string().regex(phoneRegex),
    relationship: z.enum(['spouse', 'parent', 'sibling', 'other'])
  }),
  passportNumber: z.string().optional() // Required for Platinum
});
```

## UI Components
- TextInput with floating labels
- PhoneInput with country code selector
- DatePicker with modal presentation
- Dropdown for relationship selection
- Error text with red highlighting

## Acceptance Criteria
- [ ] All fields validate according to schema
- [ ] Phone numbers format automatically as typed
- [ ] Date picker prevents future dates and under-18
- [ ] Tier-based fields show/hide correctly
- [ ] Form data persists to context on valid submission
- [ ] Draft saves recover on app restart

## Where to Create
- `packages/mobile-app/src/app/(app)/onboarding/personal-details.tsx`
- Reusable components in `src/components/form/`

## Accessibility Requirements
- Form labels associated with inputs
- Error messages announced to screen readers
- Keyboard navigation between fields
- High contrast mode support

## Estimated Effort
2 hours