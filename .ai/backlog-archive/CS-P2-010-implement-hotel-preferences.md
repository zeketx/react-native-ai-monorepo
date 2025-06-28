# Task: Implement Hotel Preferences Screen

**ID:** CS-P2-010  
**Phase:** Onboarding  
**Dependencies:** CS-P2-005

## Objective
Create the hotel preferences screen that captures accommodation preferences including hotel categories, room types, amenities, and special requirements based on client tier.

## Context
Hotel preferences directly correlate with client tiers: Silver clients have access to 3-4 star properties, Gold to 4-5 star hotels, and Platinum to luxury and boutique properties. The screen must intelligently present options while collecting detailed preferences for personalized trip planning.

## Requirements
- Tier-based hotel category selection
- Room type preferences (king, twin, suite)
- Essential amenity requirements
- Location preferences (city center, quiet area)
- Brand loyalty program integration
- Special accessibility needs

## Technical Guidance
- Implement smart filtering based on tier
- Use visual cards for hotel categories
- Create amenity selector with icons
- Support multiple loyalty programs
- Store preferences in structured format
- Integrate with OnboardingScreenTemplate

## Data Model
```typescript
interface HotelPreferences {
  categories: HotelCategory[];
  roomTypes: RoomType[];
  bedPreference: 'king' | 'queen' | 'twin' | 'no_preference';
  amenities: {
    essential: string[];
    preferred: string[];
  };
  location: {
    preference: 'city_center' | 'business_district' | 'quiet_area' | 'near_airport';
    maxDistanceFromVenue?: number; // in km
  };
  loyaltyPrograms: Array<{
    brand: string;
    memberNumber: string;
    tier?: string;
  }>;
  specialRequirements: {
    accessibility: boolean;
    smokingPreference: 'non_smoking' | 'smoking';
    floorPreference?: 'high' | 'low' | 'no_preference';
    additionalNotes?: string;
  };
}
```

## UI Components
- Hotel category cards with images
- Room type visual selector
- Amenity grid with toggle states
- Location preference map view
- Loyalty program form list
- Expandable special requirements

## Business Rules
- Hotel categories by tier:
  - Silver: 3-4 star hotels
  - Gold: 4-5 star hotels, boutique
  - Platinum: 5 star, luxury, ultra-luxury
- Minimum amenities based on tier
- Validation for loyalty program formats

## Acceptance Criteria
- [ ] Hotel categories filter by client tier
- [ ] Room type selection is visual and clear
- [ ] Amenity selection differentiates essential/preferred
- [ ] Location preferences integrate with map
- [ ] Loyalty programs validate format
- [ ] Special requirements are comprehensive

## Where to Create
- `packages/mobile-app/src/app/(app)/onboarding/hotel-preferences.tsx`
- Components in `src/components/accommodation/`

## Future Enhancements
- Hotel chain logo integration
- Room photo galleries
- Real-time availability checking
- Price range indicators

## Estimated Effort
2.5 hours