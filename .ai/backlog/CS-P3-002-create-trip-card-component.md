# Task: Create Trip Card Component

**ID:** CS-P3-002  
**Phase:** Trip Management  
**Dependencies:** CS-P3-001

## Objective
Design and implement a visually rich trip card component that displays key trip information, status, and actions in a scannable format optimized for mobile viewing.

## Context
The trip card is the primary interface element users interact with to view and manage their trips. It must convey essential information at a glance while providing quick access to detailed views and common actions.

## Requirements
- Responsive card design with trip essentials
- Visual status indicators with colors
- Countdown/days remaining display
- Quick action buttons (view, share, download)
- Swipe gestures for additional actions
- Skeleton loading states

## Technical Guidance
- Build with React Native components
- Use Reanimated for gestures
- Implement with NativeWind styling
- Apply proper accessibility
- Optimize for list rendering
- Support both iOS and Android

## Component API
```typescript
interface TripCardProps {
  trip: Trip;
  onPress: (trip: Trip) => void;
  onShare?: (trip: Trip) => void;
  onDownload?: (trip: Trip) => void;
  variant?: 'compact' | 'expanded';
  showActions?: boolean;
}

interface TripCardState {
  isPressed: boolean;
  swipeProgress: Animated.Value;
  actionsVisible: boolean;
}
```

## Visual Design
```
┌─────────────────────────────────┐
│ [Status Badge]     3 days away  │
│                                 │
│ Paris Adventure                 │
│ Dec 15-22, 2024                │
│                                 │
│ ✈️ NYC → CDG                    │
│ 🏨 Hotel Le Marais             │
│ 📍 7 activities planned        │
│                                 │
│ [View] [Share] [Download]      │
└─────────────────────────────────┘
```

## Interactive Features
- Press: Navigate to detail view
- Long press: Show quick actions
- Swipe right: Mark as favorite
- Swipe left: More options
- Pull down: Refresh status

## Status Indicators
- Draft: Gray with draft icon
- Confirmed: Green with check
- In Progress: Blue with pulse
- Completed: Muted with archive
- Cancelled: Red with strike

## Accessibility
- VoiceOver descriptions
- Semantic HTML roles
- Touch target sizing (44pt)
- High contrast support
- Reduced motion respect

## Acceptance Criteria
- [ ] Cards render efficiently in lists
- [ ] Status colors are WCAG compliant
- [ ] Gestures feel natural
- [ ] Loading states are smooth
- [ ] Actions are easily discoverable
- [ ] Performance: 60fps scrolling

## Where to Create
- `packages/mobile-app/src/components/trips/TripCard.tsx`
- Gesture handlers in `src/components/trips/TripCardGestures.ts`
- Stories in `.storybook/stories/TripCard.stories.tsx`

## Performance Optimization
- Use React.memo
- Implement getItemLayout
- Optimize image loading
- Minimize re-renders
- Lazy load actions

## Estimated Effort
2 hours