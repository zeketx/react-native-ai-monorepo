# Task: Implement Activities & Interests Preferences Screen

**ID:** CS-P2-011  
**Phase:** Onboarding  
**Dependencies:** CS-P2-005

## Objective
Build the activities and interests preferences screen that captures client preferences for experiences, tours, and activities during their travels, with intelligent categorization and tier-appropriate suggestions.

## Context
Understanding client activity preferences enables travel organizers to craft personalized itineraries. This screen must balance comprehensive preference collection with an intuitive UX, using smart categorization and visual elements to make selection enjoyable.

## Requirements
- Multi-category activity selection interface
- Intensity level preferences (relaxed to adventurous)
- Interest-based filtering and suggestions
- Physical ability considerations
- Group size preferences
- Time-of-day preferences for activities

## Technical Guidance
- Implement category-based navigation
- Use image-rich selection cards
- Apply smart filtering algorithms
- Create preference scoring system
- Support batch selection actions
- Integrate with OnboardingScreenTemplate

## Data Structure
```typescript
interface ActivitiesPreferences {
  categories: {
    cultural: ActivityInterest[];
    adventure: ActivityInterest[];
    culinary: ActivityInterest[];
    wellness: ActivityInterest[];
    entertainment: ActivityInterest[];
    shopping: ActivityInterest[];
  };
  intensity: {
    preferred: 'relaxed' | 'moderate' | 'active' | 'adventurous';
    max: 'relaxed' | 'moderate' | 'active' | 'adventurous';
  };
  groupSize: 'private' | 'small_group' | 'large_group' | 'no_preference';
  timing: {
    morningPerson: boolean;
    preferredStartTime: string; // HH:mm format
    maxDailyActivities: number;
  };
  accessibility: {
    wheelchairAccessible: boolean;
    mobilityConsiderations: string[];
  };
  interests: string[]; // Tags for personalization
}

interface ActivityInterest {
  id: string;
  name: string;
  level: 'high' | 'medium' | 'low' | 'never';
}
```

## UI Design
- Tab-based category navigation
- Visual cards with activity images
- Slider for intensity preferences
- Quick filters for common interests
- Batch actions (select all/none)
- Preview of selected activities count

## Smart Features
- AI-powered activity suggestions
- Conflicting preference warnings
- Seasonal activity indicators
- Duration estimates per activity
- Budget level indicators

## Acceptance Criteria
- [ ] All activity categories are accessible
- [ ] Selection state persists during navigation
- [ ] Intensity preferences affect suggestions
- [ ] Accessibility options are prominent
- [ ] Interest tags auto-generate from selections
- [ ] Progress saves to context properly

## Where to Create
- `packages/mobile-app/src/app/(app)/onboarding/activities-preferences.tsx`
- Components in `src/components/activities/`
- Activity data in `src/data/activities.json`

## Analytics Events
- Category view time
- Activity selection patterns
- Intensity preference distribution
- Accessibility requirement frequency

## Estimated Effort
2.5 hours