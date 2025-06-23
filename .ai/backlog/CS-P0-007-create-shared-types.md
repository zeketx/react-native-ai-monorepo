# Task: Define Core TypeScript Types and Interfaces

**ID:** CS-P0-007  
**Phase:** Foundation  
**Dependencies:** CS-P0-006

## Objective
Create comprehensive TypeScript type definitions for all core entities in the ClientSync platform including clients, trips, preferences, and organizer types.

## Acceptance Criteria
- [ ] All core entity types are defined
- [ ] Client tier enum is properly typed
- [ ] Trip status types are defined
- [ ] All preference interfaces are complete
- [ ] Types are exported from index.ts
- [ ] No TypeScript compilation errors

## Implementation Notes
1. Create packages/shared/src/types.ts with all core types:
   ```typescript
   // Client tier definitions
   export enum ClientTier {
     STANDARD = 'standard',
     PREMIUM = 'premium',
     ELITE = 'elite'
   }

   // User types
   export interface Client {
     id: string
     email: string
     tier: ClientTier
     profile: ClientProfile
     preferences: ClientPreferences
     created_at: string
     updated_at: string
   }

   export interface ClientProfile {
     first_name: string
     last_name: string
     phone: string
     emergency_contact: {
       name: string
       phone: string
       relationship: string
     }
   }

   export interface ClientPreferences {
     flight: FlightPreferences
     hotel: HotelPreferences
     activities: ActivityPreferences
     dining: DiningPreferences
   }
   ```

2. Include all supporting interfaces:
   - FlightPreferences (class, airlines, seat preference)
   - HotelPreferences (category, room type, bed preference)
   - ActivityPreferences (types, intensity, interests)
   - DiningPreferences (cuisines, dietary restrictions)
   - Trip, TripStatus, Itinerary
   - Flight, Hotel, Activity details
   - Organizer and AllowlistEntry types
   - AuditLog for tracking

3. Update packages/shared/src/index.ts:
   ```typescript
   export * from './types.js'
   ```

## Testing
- Run `pnpm build` in shared package
- Import types in a test file to verify exports
- Check generated .d.ts files include all type definitions

## Estimated Effort
2 hours