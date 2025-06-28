# Task: Create Progress Indicator Component

**ID:** CS-P2-001  
**Phase:** Onboarding  
**Dependencies:** CS-P1-010 (Authentication complete)

## Objective
Build a reusable progress indicator component that shows users their progress through the multi-step onboarding flow.

## Context
The onboarding process has 5 steps (Personal, Flight, Hotel, Activities, Review). Users need visual feedback about where they are in the process and how many steps remain.

## Requirements
- Show current step and total steps visually
- Support smooth animations between steps
- Be reusable across different multi-step flows
- Work well on different screen sizes
- Follow the app's design system

## Technical Guidance
- Consider using React Native's Animated API or Reanimated library
- The component should accept: current step number, total steps, and step labels
- Look at existing UI components in `src/ui/` for styling patterns
- Consider accessibility - ensure screen readers can understand progress

## Acceptance Criteria
- [ ] Component renders progress visually (bar, dots, or similar)
- [ ] Current step is clearly highlighted
- [ ] Animations are smooth and performant
- [ ] Component is responsive to screen width
- [ ] Can handle 3-10 steps flexibly

## Where to Create
- `packages/mobile-app/src/ui/ProgressIndicator.tsx`
- Export from `packages/mobile-app/src/ui/index.ts`

## Testing Approach
- Create a test screen with buttons to advance/go back through steps
- Verify animations work in both directions
- Test with different numbers of steps
- Check performance with fast step changes

## Estimated Effort
1 hour