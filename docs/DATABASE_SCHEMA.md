# ClientSync Database Schema Documentation

This document describes the complete database schema for the ClientSync platform, including all tables, relationships, and functions.

## Overview

The ClientSync database is built on PostgreSQL (via Supabase) and consists of 10 main tables organized around user management, client profiles, trip planning, and system auditing.

## Schema Architecture

```
auth.users (Supabase managed)
    ↓
user_profiles ← clients → client_profiles
                    ↓         ↓
                  trips   client_preferences
                    
allowlist (independent)
audit_logs (tracks all tables)
```

## Enum Types

### client_tier
Defines the tier level for clients, affecting available features and services.
- `standard` - Basic tier with economy flights only
- `premium` - Mid-tier with economy, premium economy, and business class flights
- `elite` - Top tier with business and first class flights, plus concierge services

### trip_status
Tracks the current status of a trip through the planning and execution process.
- `planning` - Initial planning phase
- `confirmed` - Trip details confirmed and booked
- `in-progress` - Trip is currently happening
- `completed` - Trip has been completed

### user_role
Defines the role of users in the system.
- `client` - End users who book trips
- `organizer` - Staff who help plan and organize trips
- `admin` - System administrators

## Tables

### user_profiles
Extends Supabase's `auth.users` table with additional user information.

**Purpose**: Store additional user data beyond what Supabase auth provides.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK, FK) | References auth.users(id) |
| email | TEXT | User's email address (unique) |
| role | user_role | User's role in the system |
| created_at | TIMESTAMPTZ | Account creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Relationships**:
- `id` → `auth.users(id)` (one-to-one)
- `id` → `clients(id)` (one-to-one, optional)

### client_profiles
Stores personal information and contact details for clients.

**Purpose**: Maintain client personal information separate from authentication data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| first_name | TEXT | Client's first name |
| last_name | TEXT | Client's last name |
| phone | TEXT | Primary phone number |
| emergency_contact | JSONB | Emergency contact information |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Emergency Contact Structure**:
```json
{
  "name": "Contact Name",
  "relationship": "Spouse/Parent/Friend",
  "phone": "+1234567890",
  "email": "contact@example.com"
}
```

### client_preferences
Stores client selections from options curated by organizers for their trips.

**Purpose**: Simple storage of client choices - which flight, hotel, and activities they selected from organizer-curated options.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| selected_flight_option_id | UUID | ID of chosen flight option |
| selected_hotel_option_id | UUID | ID of chosen hotel option |
| selected_activity_ids | UUID[] | Array of chosen activity IDs |
| dietary_restrictions | TEXT[] | Dietary restrictions (vegetarian, gluten-free, etc.) |
| allergies | TEXT[] | Food allergies (nuts, shellfish, etc.) |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Workflow**:
1. **Client creates trip** → Organizer finds 2-3 flight options, 2-3 hotel options
2. **Client selects** → Frontend shows options, client picks preferred ones  
3. **Preferences stored** → Only the selected option IDs are saved

**Example Data**:
```sql
-- Client selected option IDs from what organizer provided
selected_flight_option_id: 'abc-123-flight-uuid'
selected_hotel_option_id: 'def-456-hotel-uuid' 
selected_activity_ids: ['ghi-789-activity1', 'jkl-012-activity2']
dietary_restrictions: ['vegetarian', 'gluten_free']
allergies: ['nuts']
```

**Note**: The actual flight/hotel/activity options are stored in the trip_*_options tables below.

### clients
Central table linking users to their client profiles and preferences.

**Purpose**: Main client record that ties together user authentication, profile, and preferences.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK, FK) | References auth.users(id) |
| email | TEXT | Client's email (unique) |
| tier | client_tier | Client's service tier |
| profile_id | UUID (FK) | References client_profiles(id) |
| preferences_id | UUID (FK) | References client_preferences(id) |
| onboarding_completed | BOOLEAN | Whether onboarding is complete |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Relationships**:
- `id` → `auth.users(id)` (one-to-one)
- `profile_id` → `client_profiles(id)` (one-to-one, optional)
- `preferences_id` → `client_preferences(id)` (one-to-one, optional)
- `id` ← `trips(client_id)` (one-to-many)

### trips
Stores all trip information and planning details.

**Purpose**: Track all trips from initial planning through completion.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| client_id | UUID (FK) | References clients(id) |
| name | TEXT | Trip name/title |
| destination | TEXT | Primary destination |
| start_date | DATE | Trip start date |
| end_date | DATE | Trip end date |
| status | trip_status | Current trip status |
| budget_range | TEXT | Budget range (optional) |
| traveler_count | INTEGER | Number of travelers |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Constraints**:
- `end_date >= start_date` (trip dates must be valid)
- `traveler_count > 0` (must have at least one traveler)

### trip_flight_options
Stores the 2-3 flight options that organizers curate for each trip.

**Purpose**: Provide clients with specific flight choices rather than open-ended options.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| trip_id | UUID (FK) | References trips(id) |
| airline | TEXT | Airline name |
| flight_number | TEXT | Flight number |
| departure_time | TIMESTAMPTZ | Departure date and time |
| arrival_time | TIMESTAMPTZ | Arrival date and time |
| price | DECIMAL(10,2) | Flight price |
| description | TEXT | Human-readable description |
| created_at | TIMESTAMPTZ | Record creation timestamp |

**Example**: "Delta 123 - Morning departure, evening arrival - $850"

### trip_hotel_options  
Stores the 2-3 hotel options that organizers curate for each trip.

**Purpose**: Provide clients with specific hotel choices with pricing and location details.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| trip_id | UUID (FK) | References trips(id) |
| hotel_name | TEXT | Hotel name |
| location_description | TEXT | Location description |
| price_per_night | DECIMAL(10,2) | Price per night |
| total_nights | INTEGER | Number of nights |
| description | TEXT | Additional details |
| created_at | TIMESTAMPTZ | Record creation timestamp |

**Constraints**:
- `total_nights > 0` (must have at least one night)

**Example**: "Hotel Rivoli - City center location - $200/night for 3 nights"

### trip_activity_options
Stores the activities that organizers offer for each trip.

**Purpose**: Present clients with curated activity choices they can add to their trip.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| trip_id | UUID (FK) | References trips(id) |
| activity_name | TEXT | Activity name |
| price | DECIMAL(10,2) | Activity price (optional) |
| duration_hours | INTEGER | Duration in hours (optional) |
| max_participants | INTEGER | Maximum participants (optional) |
| description | TEXT | Activity description |
| created_at | TIMESTAMPTZ | Record creation timestamp |

**Example**: "Eiffel Tower Skip-the-Line Tour - 2 hours - $45"

### allowlist
Pre-approved emails for client registration.

**Purpose**: Control who can register as clients and set their initial tier.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| email | TEXT | Approved email address (unique) |
| tier | client_tier | Initial tier for this client |
| added_by | UUID (FK) | References auth.users(id) who added entry |
| added_at | TIMESTAMPTZ | When entry was added |
| used_at | TIMESTAMPTZ | When entry was used (nullable) |
| is_active | BOOLEAN | Whether entry can still be used |

### audit_logs
Comprehensive audit trail for all system actions.

**Purpose**: Track all important system events for security and compliance.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| user_id | UUID (FK) | References auth.users(id) |
| action | TEXT | Action performed |
| resource_type | TEXT | Type of resource affected |
| resource_id | UUID | ID of affected resource |
| details | JSONB | Additional action details |
| ip_address | INET | User's IP address |
| user_agent | TEXT | User's browser/client info |
| timestamp | TIMESTAMPTZ | When action occurred |

## Functions and Triggers

### update_updated_at()
Automatically updates the `updated_at` timestamp when records are modified.

**Applied to**: user_profiles, client_profiles, client_preferences, clients, trips

### handle_new_user()
Triggered when a new user signs up via Supabase Auth.

**Actions**:
1. Creates entry in `user_profiles`
2. If email is in `allowlist`, creates entry in `clients` with appropriate tier
3. Marks allowlist entry as used

### log_audit_event()
Utility function to create audit log entries.

**Parameters**:
- `p_user_id`: User performing the action
- `p_action`: Action description
- `p_resource_type`: Type of resource
- `p_resource_id`: ID of affected resource
- `p_details`: Additional details (JSONB)
- `p_ip_address`: User's IP address
- `p_user_agent`: User agent string

### get_tier_benefits()
Returns available benefits for a given client tier.

**Returns**:
```json
{
  "flight_classes": ["economy"],
  "organizer_support": false,
  "priority_booking": false,
  "concierge_service": false
}
```

### is_email_allowed()
Checks if an email address is in the active allowlist.

## Indexes

Performance indexes are created on frequently queried columns:

- `user_profiles`: email, role
- `clients`: email, tier, onboarding_completed
- `trips`: client_id, status, dates
- `allowlist`: email, is_active
- `audit_logs`: user_id, timestamp, resource_type+resource_id

## Permissions

All tables grant SELECT, INSERT, UPDATE permissions to the `authenticated` role.
Special considerations:
- `allowlist`: Only SELECT for authenticated users
- `audit_logs`: Only INSERT for authenticated users (no UPDATE/DELETE)

## Row Level Security (RLS)

RLS policies should be implemented in a future task to ensure:
- Users can only access their own data
- Organizers can access client data they're assigned to
- Admins have broader access as needed

## Migration Notes

### From Previous Versions
This is the initial schema implementation. Future migrations should:
1. Always use numbered migration files
2. Include both UP and DOWN migrations
3. Test thoroughly in staging before production

### Data Seeding
After schema creation:
1. Add initial allowlist entries for authorized clients
2. Consider adding sample data for development/testing

## Monitoring and Maintenance

### Regular Tasks
- Monitor audit log growth and archive old entries
- Review and update allowlist entries
- Check for orphaned records (profiles without clients)

### Performance Monitoring
- Monitor query performance on indexed columns
- Watch for table growth patterns
- Consider partitioning audit_logs if it grows large

## Security Considerations

1. **Sensitive Data**: Emergency contacts and preferences contain PII
2. **Access Control**: Implement RLS policies before production
3. **Audit Trail**: All significant actions should create audit log entries
4. **Data Retention**: Define retention policies for audit logs
5. **Encryption**: Ensure sensitive JSONB fields are properly encrypted at rest