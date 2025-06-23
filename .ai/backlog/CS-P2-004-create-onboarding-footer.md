# Task: Create Onboarding Footer Component

**ID:** CS-P2-004  
**Phase:** Onboarding  
**Dependencies:** CS-P2-003

## Objective
Build a reusable footer component for onboarding screens that provides consistent navigation controls and state management across all onboarding steps.

## Context
The onboarding flow requires a unified navigation experience with contextual actions (Back/Next/Complete) that adapt based on the current step. The footer must handle keyboard avoidance and maintain consistent positioning across different screen sizes.

## Requirements
- Adaptive button states based on current step and validation
- Keyboard-aware positioning to prevent input field overlap
- Loading states during async operations
- Accessibility support with proper labels and focus management
- Smooth transitions between button state changes

## Technical Guidance
- Implement as a compound component pattern for flexibility
- Use `KeyboardAvoidingView` with platform-specific behavior
- Leverage `useOnboardingContext` for state management
- Apply Reanimated for smooth height adjustments
- Consider `useSafeAreaInsets` for proper spacing
- Button states: disabled, loading, primary, secondary

## API Design
```typescript
interface OnboardingFooterProps {
  onNext: () => void | Promise<void>;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isValid?: boolean;
  isLoading?: boolean;
  isFinalStep?: boolean;
}
```

## Acceptance Criteria
- [ ] Footer maintains consistent height across screens
- [ ] Keyboard avoidance works on both iOS and Android
- [ ] Loading states prevent double submissions
- [ ] Buttons have proper disabled states based on validation
- [ ] Accessibility labels are contextual and descriptive
- [ ] Smooth animations for state transitions

## Where to Create
- `packages/mobile-app/src/components/onboarding/OnboardingFooter.tsx`
- Import in onboarding screen template

## Performance Considerations
- Memoize component to prevent unnecessary re-renders
- Use `useCallback` for event handlers
- Optimize animation performance with `useNativeDriver`

## Estimated Effort
1 hour