# Task: Create Onboarding Screen Template

**ID:** CS-P2-005  
**Phase:** Onboarding  
**Dependencies:** CS-P2-003, CS-P2-004

## Objective
Develop a higher-order component (HOC) that provides a consistent wrapper for all onboarding screens, reducing boilerplate and ensuring uniform UX patterns.

## Context
Each onboarding screen shares common requirements: header, progress indicator, content area, footer navigation, and error handling. A template pattern will enforce consistency and accelerate development of individual screens.

## Requirements
- Consistent screen structure with header, content, and footer zones
- Automatic progress indicator integration
- Built-in form validation state management
- Error boundary for graceful error handling
- Analytics event tracking for screen views
- Scroll view with keyboard dismissal

## Technical Guidance
- Implement as a generic React component with TypeScript
- Use render props or children pattern for content injection
- Integrate with OnboardingContext for state management
- Apply SafeAreaView for proper device spacing
- Include ScrollView with `keyboardShouldPersistTaps`
- Support both controlled and uncontrolled form patterns

## API Design
```typescript
interface OnboardingScreenTemplateProps<T> {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onValidate?: () => boolean;
  onSubmit: (data: T) => Promise<void>;
  analyticsScreenName: string;
}
```

## Component Structure
- SafeAreaView wrapper
- Progress indicator (from CS-P2-001)
- Header with title/subtitle
- ScrollView for content
- OnboardingFooter (from CS-P2-004)
- Error toast/alert component

## Acceptance Criteria
- [ ] Template reduces boilerplate by 70% per screen
- [ ] Consistent spacing and styling across all screens
- [ ] Keyboard handling works seamlessly
- [ ] Error states display appropriately
- [ ] Analytics events fire on mount
- [ ] TypeScript provides full type safety

## Where to Create
- `packages/mobile-app/src/components/onboarding/OnboardingScreenTemplate.tsx`
- Export from components index for easy importing

## Code Quality Standards
- 100% TypeScript coverage
- JSDoc comments for public API
- Unit tests for validation logic
- Storybook story for development

## Estimated Effort
1.5 hours