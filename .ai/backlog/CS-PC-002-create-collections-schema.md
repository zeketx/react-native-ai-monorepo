# CS-PC-002: Create Payload Collections Schema

## Priority
P0 - Critical Foundation

## Description
Define and implement Payload CMS collections to replace the existing Supabase database schema, ensuring all data models are properly represented.

## Acceptance Criteria
- [ ] Users collection with authentication fields
- [ ] Clients collection with tier system (Standard, Premium, Platinum)
- [ ] Trips collection with relationships to clients
- [ ] Preferences collections (Flight, Hotel, Activities, Dining)
- [ ] Proper field validations and constraints
- [ ] Access control rules matching current RLS policies
- [ ] Collection hooks for business logic

## Technical Details

### Collections to Create:
1. **Users** (Authentication-enabled)
   - email, password, role
   - relationship to Clients
   
2. **Clients**
   - personalDetails (name, phone, dateOfBirth)
   - tier (enum: standard, premium, platinum)
   - preferences (relationships)
   - trips (relationship)
   
3. **Trips**
   - title, description, dates
   - status (planning, confirmed, completed)
   - client relationship
   - activities, hotels, dining relationships
   
4. **Preferences** (FlightPrefs, HotelPrefs, etc.)
   - Client-specific preference data
   
5. **Media** 
   - Trip photos, documents

## Dependencies
- CS-PC-001 must be completed

## Notes
- Use Payload's built-in auth for Users collection
- Implement field-level access control
- Consider using Payload's localization for multi-language support