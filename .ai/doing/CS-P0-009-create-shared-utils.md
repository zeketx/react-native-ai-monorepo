# Task: Implement Shared Utility Functions

**ID:** CS-P0-009  
**Phase:** Foundation  
**Dependencies:** CS-P0-008

## Objective
Create reusable utility functions for common operations like tier-based filtering, date formatting, validation, and error handling that will be used across both mobile and web applications.

## Acceptance Criteria
- [ ] Tier-based helper functions are implemented
- [ ] Date formatting utilities are created
- [ ] Validation functions work correctly
- [ ] Custom error class is defined
- [ ] All utilities are properly typed and exported

## Implementation Notes
1. Create packages/shared/src/utils.ts:
   ```typescript
   import { ClientTier } from './types.js'
   import { FLIGHT_CLASSES_BY_TIER, HOTEL_CATEGORIES_BY_TIER } from './constants.js'

   // Tier-based filtering utilities
   export function getAvailableFlightClasses(tier: ClientTier): string[] {
     return FLIGHT_CLASSES_BY_TIER[tier] || []
   }

   export function getAvailableHotelCategories(tier: ClientTier): string[] {
     return HOTEL_CATEGORIES_BY_TIER[tier] || []
   }

   // Date utilities
   export function formatDate(date: string | Date): string {
     const d = new Date(date)
     return d.toLocaleDateString('en-US', { 
       year: 'numeric', 
       month: 'long', 
       day: 'numeric' 
     })
   }

   export function formatDateTime(date: string | Date): string {
     const d = new Date(date)
     return d.toLocaleString('en-US', { 
       year: 'numeric', 
       month: 'short', 
       day: 'numeric',
       hour: '2-digit',
       minute: '2-digit'
     })
   }

   // Validation utilities
   export function isValidEmail(email: string): boolean {
     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
   }

   export function isValidPhone(phone: string): boolean {
     return /^\+?[1-9]\d{1,14}$/.test(phone)
   }

   // Error handling
   export class ApiError extends Error {
     constructor(
       message: string,
       public statusCode: number,
       public code?: string
     ) {
       super(message)
       this.name = 'ApiError'
     }
   }
   ```

2. Additional utilities to implement:
   - Phone number formatting
   - Trip duration calculation
   - Tier comparison helpers
   - String manipulation utilities
   - Array helpers for preferences

3. Update packages/shared/src/index.ts:
   ```typescript
   export * from './types.js'
   export * from './constants.js'
   export * from './utils.js'
   ```

## Testing
- Write simple tests for each utility function
- Verify date formatting works correctly
- Test validation functions with various inputs
- Ensure error class can be thrown and caught

## Estimated Effort
2 hours