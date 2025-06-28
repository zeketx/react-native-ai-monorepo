# Task: Create Onboarding Layout

**ID:** CS-P2-003  
**Phase:** Onboarding  
**Dependencies:** CS-P2-002

## Objective
Build the layout wrapper for onboarding screens that includes navigation, progress indicator, and consistent styling.

## Context
All onboarding screens need a consistent layout with:
- Progress indicator at the top
- Back button for navigation
- Consistent padding and styling
- Keyboard handling for forms

## Requirements
- Integrate the ProgressIndicator component
- Handle navigation between onboarding steps
- Provide consistent header/footer areas
- Support keyboard avoidance for form inputs
- Initialize and provide OnboardingContext

## Technical Guidance
- This is an Expo Router layout file for the onboarding route group
- Should receive email and tier as route params from login
- Wrap children with OnboardingProvider
- Use Stack navigator for screen transitions
- Consider SafeAreaView for proper spacing

## Navigation Flow
- Personal Details → Flight Preferences → Hotel Preferences → Activities & Dining → Review
- Back button should go to previous step or exit onboarding
- Handle edge cases like trying to skip steps

## Acceptance Criteria
- [ ] Layout provides consistent UI wrapper
- [ ] Progress indicator shows current step
- [ ] Navigation between steps works smoothly
- [ ] Back button behavior is correct
- [ ] Keyboard doesn't cover form inputs

## Where to Create
- `packages/mobile-app/src/app/(app)/onboarding/_layout.tsx`

## Related Files to Reference
- Current app layouts for patterns
- ViewerContext for user state
- Expo Router documentation for typed routes

## Estimated Effort
1 hour