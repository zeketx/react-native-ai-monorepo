# Row Level Security (RLS) Documentation

This document describes the Row Level Security implementation for the ClientSync platform, ensuring that users can only access data they are authorized to see.

## Overview

Row Level Security (RLS) is enabled on all tables to enforce data access controls at the database level. This provides defense-in-depth security even if application-level authorization fails.

## Security Model

### User Roles
- **client**: End users who book trips (can only access their own data)
- **organizer**: Staff who help plan trips (can access all client data)
- **admin**: System administrators (full access including audit logs)

### Access Patterns
```
client → owns → trips → contains → trip_options
client → owns → client_profile, client_preferences
organizer → manages → all client data + trip options
admin → manages → everything + audit logs + allowlist
```

## Table-by-Table Security

### user_profiles
**Purpose**: Extended user information beyond Supabase auth

**Policies**:
- ✅ Users can view/update their own profile
- ✅ Organizers/admins can view all profiles

**Use Cases**:
- User profile management
- Role-based access control lookups

### clients
**Purpose**: Main client records linking users to profiles

**Policies**:
- ✅ Clients can view/update their own client record
- ✅ Organizers/admins can view/update all client records

**Use Cases**:
- Client onboarding status
- Tier management
- Organizer client assignment

### client_profiles
**Purpose**: Personal information and contact details

**Policies**:
- ✅ Clients can view/update their own profile (via clients.profile_id link)
- ✅ Organizers/admins can view/update all profiles

**Security Note**: Contains PII - emergency contacts, phone numbers

### client_preferences  
**Purpose**: Client selections from organizer-curated options

**Policies**:
- ✅ Clients can view/update their own preferences (via clients.preferences_id link)
- ✅ Organizers/admins can view/update all preferences

**Use Cases**:
- Trip planning customization
- Dietary restriction tracking

### trips
**Purpose**: Trip planning and booking information

**Policies**:
- ✅ Clients can view/update/insert their own trips (client_id = auth.uid())
- ✅ Organizers/admins can manage all trips

**Use Cases**:
- Trip creation by clients
- Trip management by organizers

### trip_*_options (flight, hotel, activity)
**Purpose**: Options curated by organizers for specific trips

**Policies**:
- ✅ Clients can view options for their own trips (via trips.client_id)
- ✅ Organizers/admins can manage all trip options

**Security Flow**:
```
Client requests trip_flight_options 
→ RLS checks trips.client_id = auth.uid()
→ Returns options only for client's trips
```

### allowlist
**Purpose**: Pre-approved emails for client registration

**Policies**:
- ❌ Clients cannot access allowlist
- ✅ Organizers/admins can manage allowlist

**Security Rationale**: Prevents clients from seeing who else is approved

### audit_logs
**Purpose**: Comprehensive audit trail

**Policies**:
- ❌ Clients and organizers cannot view audit logs
- ✅ Admins can view all audit logs
- ✅ All authenticated users can insert their own audit entries

**Security Note**: Contains sensitive system activity - admin access only

## Policy Implementation Details

### Role-Based Access Control
All organizer/admin checks use this pattern:
```sql
EXISTS (
  SELECT 1 FROM public.user_profiles
  WHERE id = auth.uid() AND role IN ('organizer', 'admin')
)
```

### Ownership-Based Access Control
Client data access uses direct ownership:
```sql
-- Direct ownership
client_id = auth.uid()

-- Linked ownership (profiles/preferences)
EXISTS (
  SELECT 1 FROM public.clients
  WHERE clients.profile_id = client_profiles.id
  AND clients.id = auth.uid()
)
```

### Nested Access Control
Trip options access requires ownership of parent trip:
```sql
EXISTS (
  SELECT 1 FROM public.trips
  WHERE trips.id = trip_flight_options.trip_id
  AND trips.client_id = auth.uid()
)
```

## Security Testing

### Automated Testing
Run the verification script:
```bash
./scripts/verify-rls-policies.sh
```

### Manual Testing Scenarios

#### Test 1: Client Data Isolation
1. Create two client users
2. Have each create trips and profiles
3. Verify each can only see their own data

#### Test 2: Organizer Access
1. Create organizer user
2. Verify they can see all client data
3. Verify they can create trip options

#### Test 3: Admin Privileges
1. Create admin user
2. Verify access to audit logs
3. Verify allowlist management

#### Test 4: Unauthorized Access
1. Try accessing allowlist as client (should fail)
2. Try accessing other client's trips (should fail)
3. Try accessing audit logs as organizer (should fail)

## Security Considerations

### Defense in Depth
- **Database Level**: RLS policies (this layer)
- **API Level**: Application authorization checks
- **Authentication**: Supabase Auth with JWTs
- **Transport**: HTTPS only

### PII Protection
Tables containing PII have restricted access:
- `client_profiles` - Emergency contacts, phone numbers
- `audit_logs` - User activities and IP addresses

### Audit Trail
All significant actions should create audit log entries:
```sql
SELECT public.log_audit_event(
  auth.uid(),
  'client_trip_created', 
  'trip',
  trip_id,
  '{"destination": "Paris"}'::jsonb
);
```

### Common Security Patterns

#### Inserting Linked Records
When clients create profiles during onboarding:
```sql
-- 1. Insert profile
INSERT INTO client_profiles (...) RETURNING id;

-- 2. Link to client record
UPDATE clients SET profile_id = ? WHERE id = auth.uid();
```

#### Organizer Data Access
Organizers should use specific queries to show their access is intentional:
```sql
-- Good: Explicit organizer query
SELECT * FROM clients WHERE onboarding_completed = false;

-- Avoid: Generic queries that might expose too much data
SELECT * FROM clients;
```

## Troubleshooting

### Common Issues

**"Row-level security policy violation"**
- User trying to access data they don't own
- Check if user role is correct
- Verify ownership links (profile_id, preferences_id)

**"Insufficient privilege"**
- User doesn't have required role for action
- Check user_profiles.role value
- Verify policy conditions

**"Permission denied"**
- RLS is working correctly
- User needs to authenticate or change approach

### Debugging Queries

**Check user's role**:
```sql
SELECT role FROM user_profiles WHERE id = auth.uid();
```

**Check client ownership**:
```sql
SELECT id, profile_id, preferences_id 
FROM clients 
WHERE id = auth.uid();
```

**List user's accessible trips**:
```sql
SELECT id, name, destination 
FROM trips 
WHERE client_id = auth.uid();
```

## Maintenance

### Adding New Tables
When adding new tables:
1. Enable RLS: `ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;`
2. Create appropriate policies based on data sensitivity
3. Test with all user roles
4. Update this documentation

### Modifying Policies
When changing policies:
1. Test in staging environment first
2. Consider impact on existing data access
3. Update verification scripts
4. Document changes

### Performance Considerations
- RLS policies add WHERE clauses to every query
- Complex policies may impact performance
- Consider indexes on commonly filtered columns
- Monitor query performance after policy changes

## Future Enhancements

### Planned Security Features
- **Geographic Access Controls**: Restrict access by IP location
- **Time-Based Access**: Limit access to business hours
- **Data Classification**: Label and protect sensitive data fields
- **Advanced Audit**: Track all data access, not just modifications

### Policy Refinements
- **Granular Trip Permissions**: Separate read/write access for trip phases
- **Client Data Sharing**: Allow clients to share trip data with family
- **Organizer Specialization**: Limit organizers to specific client tiers
- **Automated Policy Testing**: Continuous security validation