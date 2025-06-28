# Task: Create Onboarding Context

**ID:** CS-P2-002  
**Phase:** Onboarding  
**Dependencies:** CS-P2-001

## Objective
Create a React context to manage onboarding state and data collection across multiple screens.

## Context
The onboarding flow needs to collect various pieces of information across 5 different screens. This data needs to persist as users navigate back and forth, and be submitted together at the end.

## Requirements
- Manage form data across multiple screens
- Track current step in the onboarding flow
- Support navigation between steps
- Validate data before allowing progression
- Handle final submission to Supabase

## Technical Guidance
- Use React Context API with a provider pattern
- Store: email, tier, profile data, preferences data, current step
- Provide methods: updateProfile, updatePreferences, nextStep, previousStep
- Consider using useReducer for complex state management
- Reference the shared types from `@clientsync/shared` for data structures

## Key Considerations
- Data should persist if user navigates backwards
- Context should be initialized with email and tier from login flow
- Consider saving draft data to AsyncStorage for recovery
- Handle edge cases like app backgrounding

## Acceptance Criteria
- [ ] Context provider wraps onboarding screens
- [ ] Data persists across navigation
- [ ] Methods update the correct parts of state
- [ ] Current step tracking works correctly
- [ ] TypeScript types match shared package types

## Where to Create
- `packages/mobile-app/src/contexts/OnboardingContext.tsx`
- Use in `packages/mobile-app/src/app/(app)/onboarding/_layout.tsx`

## Estimated Effort
1.5 hours