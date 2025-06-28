# Task: Implement Flight Preferences Screen

**ID:** CS-P2-008  
**Phase:** Onboarding  
**Dependencies:** CS-P2-005, CS-P2-009

## Objective
Build the flight preferences screen that captures detailed travel preferences including cabin class, airlines, seating, and special requirements based on client tier.

## Context
Flight preferences are tier-dependent, with Silver clients choosing economy options, Gold having access to premium economy and business, while Platinum can select first class. The screen must present options intelligently based on the user's tier while collecting comprehensive preferences.

## Requirements
- Tier-based cabin class selection
- Preferred airline selection (multiple)
- Seat preference options (aisle, window, etc.)
- Meal preferences and dietary restrictions
- Special assistance requirements
- Frequent flyer program integration

## Technical Guidance
- Implement tiered option filtering in selectors
- Use multi-select components for airlines
- Create visual seat selector component
- Store preferences in normalized format
- Integrate with airline databases (future)
- Apply OnboardingScreenTemplate

## Data Structure
```typescript
interface FlightPreferences {
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  preferredAirlines: string[];
  seatPreference: {
    position: 'aisle' | 'window' | 'middle' | 'no_preference';
    location: 'front' | 'back' | 'wing' | 'no_preference';
  };
  mealPreference: 'regular' | 'vegetarian' | 'vegan' | 'kosher' | 'halal';
  specialAssistance: string[];
  frequentFlyerPrograms: Array<{
    airline: string;
    number: string;
  }>;
}
```

## UI Components
- Segmented control for cabin class (tier-filtered)
- Searchable multi-select for airlines
- Visual seat map for preference selection
- Checkbox group for special requirements
- Dynamic form array for FF programs

## Business Logic
- Filter cabin classes by tier:
  - Silver: economy only
  - Gold: economy, premium economy, business
  - Platinum: all classes
- Validate at least one airline selected
- Limit frequent flyer programs to selected airlines

## Acceptance Criteria
- [ ] Cabin class options respect tier limitations
- [ ] Airline search includes major carriers
- [ ] Seat preference selector is intuitive
- [ ] Meal preferences cover common requirements
- [ ] Frequent flyer fields validate format
- [ ] Data persists to onboarding context

## Where to Create
- `packages/mobile-app/src/app/(app)/onboarding/flight-preferences.tsx`
- Reusable components in `src/components/travel/`

## Integration Points
- Future: Airline API for real-time validation
- Future: Seat map visualization
- Future: Alliance preferences

## Estimated Effort
2.5 hours