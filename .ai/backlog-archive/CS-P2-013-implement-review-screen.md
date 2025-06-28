# Task: Implement Review & Confirmation Screen

**ID:** CS-P2-013  
**Phase:** Onboarding  
**Dependencies:** CS-P2-006 through CS-P2-012

## Objective
Build the final review screen that displays all collected preferences in an organized, editable format, allowing clients to review, modify, and confirm their information before submission.

## Context
The review screen serves as the final checkpoint in the onboarding process. It must present complex preference data in a digestible format while providing easy navigation to edit specific sections and clear confirmation of data submission.

## Requirements
- Organized display of all preference categories
- Quick edit navigation to specific sections
- Visual summary cards for each category
- Progress completion indicators
- Terms acceptance and privacy consent
- Submit with loading and success states

## Technical Guidance
- Implement accordion-style sections
- Use deep linking for edit navigation
- Create preference summary components
- Apply optimistic UI updates
- Handle partial save states
- Show submission progress

## Screen Structure
```typescript
interface ReviewScreenSections {
  personalDetails: {
    title: string;
    summary: PersonalSummary;
    isComplete: boolean;
    editRoute: string;
  };
  flightPreferences: {
    title: string;
    summary: FlightSummary;
    isComplete: boolean;
    editRoute: string;
  };
  hotelPreferences: {
    title: string;
    summary: HotelSummary;
    isComplete: boolean;
    editRoute: string;
  };
  activities: {
    title: string;
    summary: ActivitiesSummary;
    isComplete: boolean;
    editRoute: string;
  };
  dining: {
    title: string;
    summary: DiningSummary;
    isComplete: boolean;
    editRoute: string;
  };
}
```

## UI Components
- Collapsible section cards
- Edit action buttons per section
- Completion checkmarks
- Summary statistics
- Legal consent checkboxes
- Submit button with states

## Navigation Flow
- Edit button navigates to specific screen
- Maintains scroll position on return
- Shows unsaved changes warning
- Supports swipe-back gesture
- Deep link support for sections

## Submission Process
1. Validate all required sections
2. Show terms & conditions
3. Collect consent checkboxes
4. Display submission progress
5. Handle success/error states
6. Navigate to main app on success

## Acceptance Criteria
- [ ] All preference data displays accurately
- [ ] Edit navigation works for each section
- [ ] Incomplete sections are highlighted
- [ ] Terms acceptance is required
- [ ] Submission progress is visible
- [ ] Success leads to main app

## Where to Create
- `packages/mobile-app/src/app/(app)/onboarding/review.tsx`
- Summary components in `src/components/onboarding/summaries/`

## Error Handling
- Network failure recovery
- Partial submission handling
- Validation error display
- Retry mechanisms
- Offline queue support

## Estimated Effort
2 hours