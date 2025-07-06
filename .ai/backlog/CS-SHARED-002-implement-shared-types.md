# CS-SHARED-002: Implement Shared Types for Payload CMS

## Priority
P0 - Critical Foundation

## Status
PENDING

## Description
Create TypeScript type definitions that can be shared between the Payload CMS and mobile app, ensuring type safety across the entire monorepo. These types should align with Payload CMS collections and mobile app requirements.

## Acceptance Criteria
- [ ] Create user types matching Payload Users collection
- [ ] Create client types matching Payload Clients collection
- [ ] Create trip types matching Payload Trips collection
- [ ] Create preference types for all preference collections
- [ ] Export all types from shared package
- [ ] Types are importable in both CMS and mobile-app packages
- [ ] Add type guards and validation helpers

## Technical Details

### Type Definitions to Create:

```typescript
// src/types/user.ts
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  verified: boolean;
  // ... other fields from Payload schema
}

export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  ORGANIZER = 'organizer',
  PREMIUM_CLIENT = 'premium-client',
  CLIENT = 'client'
}

// src/types/client.ts
export interface Client {
  id: string;
  userId: string;
  tier: ClientTier;
  preferences: ClientPreferences;
  // ... other fields
}

// src/types/trip.ts
export interface Trip {
  id: string;
  clientId: string;
  organizerId: string;
  status: TripStatus;
  startDate: string;
  endDate: string;
  // ... other fields
}
```

### Implementation Notes:
- Types should match Payload CMS collection schemas exactly
- Include proper JSDoc comments for all types
- Create utility types for common patterns
- Add validation functions for runtime type checking

## Dependencies
- CS-SHARED-001 (Shared package structure must exist)
- Payload CMS collections must be defined (CS-PC-002)

## Notes
- These types are the foundation for type-safe development
- Will replace any duplicate type definitions in individual packages
- Should be the single source of truth for data structures