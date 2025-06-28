# Task: Implement Dining Preferences Screen

**ID:** CS-P2-012  
**Phase:** Onboarding  
**Dependencies:** CS-P2-005

## Objective
Create the dining preferences screen that captures detailed food preferences, dietary restrictions, cuisine preferences, and dining style choices to enable personalized restaurant recommendations and meal planning.

## Context
Dining is a crucial aspect of travel experiences, especially for high-value clients. This screen must comprehensively capture dietary needs while discovering cuisine preferences and dining styles, ensuring every meal enhances the travel experience.

## Requirements
- Comprehensive dietary restriction selection
- Cuisine preference ranking system
- Dining style preferences (casual to fine dining)
- Meal timing preferences
- Allergy and intolerance management
- Special dietary programs (keto, vegan, etc.)

## Technical Guidance
- Implement searchable dietary restriction list
- Create drag-and-drop cuisine ranking
- Use visual dining style selector
- Apply smart conflict detection
- Store medical dietary needs separately
- Integrate with OnboardingScreenTemplate

## Data Model
```typescript
interface DiningPreferences {
  dietaryRestrictions: {
    allergies: Allergy[];
    intolerances: string[];
    religious: 'none' | 'halal' | 'kosher' | 'hindu' | 'buddhist';
    lifestyle: ('vegetarian' | 'vegan' | 'pescatarian')[];
    medical: string[]; // Diabetes, celiac, etc.
  };
  cuisinePreferences: {
    loved: string[]; // Ordered by preference
    liked: string[];
    disliked: string[];
    never: string[]; // Will not eat
  };
  diningStyle: {
    preferred: DiningStyle[];
    mealPacing: 'quick' | 'moderate' | 'leisurely';
    adventurousness: 'conservative' | 'moderate' | 'adventurous';
  };
  mealSchedule: {
    breakfast: { preferred: boolean; typical: string };
    lunch: { preferred: boolean; typical: string };
    dinner: { preferred: boolean; typical: string };
    snacks: boolean;
  };
  beveragePreferences: {
    alcohol: 'none' | 'wine' | 'beer' | 'spirits' | 'all';
    coffee: boolean;
    tea: boolean;
    specialRequests: string[];
  };
}

type DiningStyle = 'street_food' | 'casual' | 'bistro' | 'fine_dining' | 'michelin';
```

## UI Components
- Searchable allergy/restriction list
- Draggable cuisine preference cards
- Visual dining style selector
- Meal schedule timeline
- Severity indicators for allergies
- Quick templates (vegan, gluten-free, etc.)

## Safety Features
- Clear allergy severity indicators
- Medical vs preference distinction
- Emergency dietary card generation
- Translation of restrictions
- Cross-contamination warnings

## Acceptance Criteria
- [ ] All major allergies are listed
- [ ] Cuisine ranking is intuitive
- [ ] Dietary conflicts are detected
- [ ] Medical needs are highlighted
- [ ] Preferences save correctly
- [ ] Emergency info is accessible

## Where to Create
- `packages/mobile-app/src/app/(app)/onboarding/dining-preferences.tsx`
- Components in `src/components/dining/`
- Allergy database in `src/data/dietary.json`

## Compliance & Safety
- FALCPA allergen compliance
- Medical information handling
- Clear severity indicators
- Multi-language support for allergies

## Estimated Effort
3 hours