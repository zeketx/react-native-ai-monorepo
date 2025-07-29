# Supabase to Payload CMS Schema Mapping

This document outlines the mapping between Supabase tables and Payload CMS collections for data migration.

## Overview

The migration involves transforming relational database tables (Supabase) into document-based collections (Payload CMS) while maintaining data integrity and relationships.

## Collection Mappings

### 1. Users Collection

**Supabase Table:** `auth.users` + `user_profiles`
**Payload Collection:** `users`

| Supabase Field | Type | Payload Field | Type | Notes |
|----------------|------|---------------|------|-------|
| `auth.users.id` | uuid | `id` | string | Convert UUID to string |
| `auth.users.email` | string | `email` | email | Direct mapping |
| `auth.users.created_at` | timestamp | `createdAt` | date | Direct mapping |
| `auth.users.updated_at` | timestamp | `updatedAt` | date | Direct mapping |
| `user_profiles.first_name` | string | `firstName` | text | From profile table |
| `user_profiles.last_name` | string | `lastName` | text | From profile table |
| `user_profiles.phone` | string | `phone` | text | From profile table |
| `user_profiles.role` | enum | `role` | select | client/organizer/admin |
| `user_profiles.avatar_url` | string | `avatar` | upload | Media reference |
| - | - | `emailVerified` | checkbox | Default true for existing users |

**Relationships:**
- One-to-one with user_profiles table (join on user_id)

### 2. Clients Collection

**Supabase Table:** `client_profiles`
**Payload Collection:** `clients`

| Supabase Field | Type | Payload Field | Type | Notes |
|----------------|------|---------------|------|-------|
| `id` | uuid | `id` | string | Convert UUID |
| `user_id` | uuid | `user` | relationship | Reference to users collection |
| `company_name` | string | `companyName` | text | Direct mapping |
| `industry` | string | `industry` | text | Direct mapping |
| `title` | string | `title` | text | Direct mapping |
| `department` | string | `department` | text | Direct mapping |
| `business_phone` | string | `businessPhone` | text | Direct mapping |
| `business_email` | string | `businessEmail` | email | Direct mapping |
| `tier` | enum | `tier` | select | standard/premium/enterprise |
| `status` | enum | `status` | select | active/inactive/suspended |
| `created_at` | timestamp | `createdAt` | date | Direct mapping |
| `updated_at` | timestamp | `updatedAt` | date | Direct mapping |

### 3. Trips Collection

**Supabase Table:** `trips`
**Payload Collection:** `trips`  

| Supabase Field | Type | Payload Field | Type | Notes |
|----------------|------|---------------|------|-------|
| `id` | uuid | `id` | string | Convert UUID |
| `title` | string | `title` | text | Direct mapping |
| `description` | text | `description` | textarea | Direct mapping |
| `client_id` | uuid | `client` | relationship | Reference to users collection |
| `organizer_id` | uuid | `organizer` | relationship | Reference to users collection |
| `type` | enum | `type` | select | business/leisure/group |
| `status` | enum | `status` | select | draft/pending/approved/active/completed/cancelled |
| `priority` | enum | `priority` | select | low/medium/high/urgent |
| `start_date` | date | `startDate` | date | Direct mapping |
| `end_date` | date | `endDate` | date | Direct mapping |
| `estimated_budget` | decimal | `estimatedBudget` | number | Direct mapping |
| `actual_budget` | decimal | `actualBudget` | number | Direct mapping |
| `currency` | string | `currency` | text | Direct mapping |
| `accommodation_preference` | enum | `accommodationPreference` | select | budget/mid-range/luxury/premium |
| `transportation_preference` | enum | `transportationPreference` | select | economy/business/first-class |
| `notes` | text | `notes` | textarea | Direct mapping |
| `created_at` | timestamp | `createdAt` | date | Direct mapping |
| `updated_at` | timestamp | `updatedAt` | date | Direct mapping |
| `created_by` | uuid | `createdBy` | relationship | Reference to users collection |

**Complex Fields:**
- `destinations` - JSON array → Payload array field with location objects
- `travelers` - JSON array or separate table → Payload relationship array

### 4. Trip Destinations (Sub-collection)

**Supabase:** JSON field or separate table
**Payload:** Array field within trips

```json
{
  "name": "string",
  "country": "string", 
  "city": "string",
  "coordinates": {
    "lat": "number",
    "lng": "number"
  },
  "timezone": "string"
}
```

### 5. Media/Documents Collection

**Supabase Table:** `trip_documents` + Supabase Storage
**Payload Collection:** `media`

| Supabase Field | Type | Payload Field | Type | Notes |
|----------------|------|---------------|------|-------|
| `id` | uuid | `id` | string | Convert UUID |
| `trip_id` | uuid | `trip` | relationship | Reference to trips |
| `filename` | string | `filename` | text | Direct mapping |
| `url` | string | `url` | text | Storage URL |
| `size` | integer | `filesize` | number | Direct mapping |
| `type` | string | `mimeType` | text | Direct mapping |
| `created_at` | timestamp | `createdAt` | date | Direct mapping |

### 6. User Preferences Collection

**Supabase Table:** `user_preferences`  
**Payload Collection:** `userPreferences`

| Supabase Field | Type | Payload Field | Type | Notes |
|----------------|------|---------------|------|-------|
| `id` | uuid | `id` | string | Convert UUID |
| `user_id` | uuid | `user` | relationship | Reference to users |
| `language` | string | `language` | text | Direct mapping |
| `theme` | enum | `theme` | select | light/dark |
| `notifications` | json | `notifications` | json | Notification settings object |
| `location_enabled` | boolean | `locationEnabled` | checkbox | Direct mapping |
| `created_at` | timestamp | `createdAt` | date | Direct mapping |
| `updated_at` | timestamp | `updatedAt` | date | Direct mapping |

## Data Transformation Rules

### 1. UUID Conversion
- All Supabase UUIDs will be converted to string format
- Maintain original UUID as string to preserve relationships

### 2. Enum Values
- Map Supabase enum values to Payload select options
- Ensure all enum values are defined in Payload collection configs

### 3. JSON Fields
- Complex JSON objects in Supabase become structured fields in Payload
- Validate JSON structure during transformation

### 4. Relationships
- Foreign key references become Payload relationships
- Many-to-many relationships may require junction collections

### 5. Timestamps
- Convert Supabase timestamps to ISO 8601 strings
- Maintain timezone information where available

### 6. File References
- Migrate files from Supabase Storage to Payload media handling
- Update file URLs to point to new storage location

## Migration Considerations

### Data Integrity
- Verify all foreign key relationships are maintained
- Ensure no data loss during transformation
- Validate data types and constraints

### Performance  
- Use batch processing for large datasets
- Implement progress tracking and resume capability
- Consider memory usage for large JSON transformations

### Rollback Strategy
- Maintain complete backup of Supabase data
- Store transformation logs for rollback reference
- Test rollback procedures in staging environment

## Validation Rules

1. **User Data**: Verify all users have valid emails and profiles
2. **Client Data**: Ensure all client profiles link to valid users  
3. **Trip Data**: Validate date ranges and budget values
4. **Relationships**: Confirm all foreign key references exist
5. **Files**: Verify all media files are accessible and properly referenced

## Migration Order

1. **Users** - Base entity, required for all relationships
2. **Clients** - Depends on users
3. **Media** - Independent, can be done in parallel
4. **User Preferences** - Depends on users
5. **Trips** - Depends on users/clients, references media
6. **Validation** - Final verification of all data and relationships