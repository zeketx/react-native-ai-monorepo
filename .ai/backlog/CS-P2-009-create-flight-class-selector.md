# Task: Create Flight Class Selector Component

**ID:** CS-P2-009  
**Phase:** Onboarding  
**Dependencies:** CS-P2-001

## Objective
Build a reusable flight cabin class selector component that dynamically adjusts available options based on client tier, with rich visual feedback and accessibility support.

## Context
The cabin class selector is a critical component used in both onboarding and trip planning. It must clearly communicate available options while preventing selection of unavailable classes based on business rules.

## Requirements
- Visual cards for each cabin class with icons
- Tier-based availability with clear messaging
- Disabled state for unavailable options
- Price range indicators (when applicable)
- Animated selection transitions
- Support for both single and multi-select modes

## Technical Guidance
- Build as a controlled component
- Use Reanimated for smooth transitions
- Implement with accessibility in mind
- Support theme customization
- Optimize for performance with memoization
- Include haptic feedback on selection

## Component API
```typescript
interface FlightClassSelectorProps {
  value: CabinClass | CabinClass[];
  onChange: (value: CabinClass | CabinClass[]) => void;
  availableClasses: CabinClass[];
  multiSelect?: boolean;
  showPriceRanges?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

interface ClassOption {
  id: CabinClass;
  label: string;
  icon: string;
  description: string;
  priceRange?: { min: number; max: number };
  features: string[];
}
```

## Visual Design
- Card-based layout with clear boundaries
- Icons for each class (seat illustrations)
- Gradient backgrounds for premium classes
- Disabled state with reduced opacity
- Selected state with border highlight
- Smooth scale animation on press

## Accessibility Features
- VoiceOver/TalkBack descriptions
- Keyboard navigation support
- High contrast mode compatibility
- Focus indicators
- Semantic HTML roles

## Acceptance Criteria
- [ ] Component renders all cabin classes correctly
- [ ] Tier-based filtering works as expected
- [ ] Selection animations are smooth (60fps)
- [ ] Accessibility audit passes
- [ ] Component is fully typed with TypeScript
- [ ] Storybook stories cover all states

## Where to Create
- `packages/mobile-app/src/components/travel/FlightClassSelector.tsx`
- Stories in `.storybook/stories/FlightClassSelector.stories.tsx`
- Shared types in `packages/shared/src/types/travel.ts`

## Performance Requirements
- Initial render < 16ms
- Selection response < 100ms
- No memory leaks on unmount
- Optimized for lists with 4-6 items

## Estimated Effort
1.5 hours