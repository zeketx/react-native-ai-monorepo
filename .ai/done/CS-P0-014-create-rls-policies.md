# Task: Implement Row Level Security Policies

**ID:** CS-P0-014  
**Phase:** Foundation  
**Dependencies:** CS-P0-013

## Objective
Create Row Level Security (RLS) policies for all tables to ensure data access is properly restricted based on user roles and ownership.

## Acceptance Criteria
- [x] RLS is enabled on all tables
- [x] Clients can only access their own data
- [x] Organizers can view all client data
- [x] Allowlist is restricted to organizers/admins
- [x] Audit logs are admin-only
- [x] All policies are tested and working

## Implementation Notes
1. Enable RLS on all tables:
```sql
-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
```

2. Create user profile policies:
```sql
-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

3. Create client data policies:
```sql
-- Clients table policies
CREATE POLICY "Clients can view own data" ON public.clients
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Clients can update own data" ON public.clients
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Organizers can view all clients" ON public.clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );

CREATE POLICY "Organizers can update all clients" ON public.clients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );
```

4. Create profile and preferences policies:
```sql
-- Client profiles policies
CREATE POLICY "Clients can view own profile" ON public.client_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.profile_id = client_profiles.id
      AND clients.id = auth.uid()
    )
  );

CREATE POLICY "Clients can update own profile" ON public.client_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.profile_id = client_profiles.id
      AND clients.id = auth.uid()
    )
  );

-- Similar for preferences
CREATE POLICY "Clients can view own preferences" ON public.client_preferences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.preferences_id = client_preferences.id
      AND clients.id = auth.uid()
    )
  );
```

5. Create trip policies:
```sql
-- Trips policies
CREATE POLICY "Clients can view own trips" ON public.trips
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Organizers can manage all trips" ON public.trips
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );
```

6. Create restricted table policies:
```sql
-- Allowlist (organizers only)
CREATE POLICY "Organizers can manage allowlist" ON public.allowlist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );

-- Audit logs (admins only)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## Testing
1. Create test users with different roles
2. Try accessing data as each role
3. Verify clients cannot see other clients' data
4. Verify organizers can see all client data
5. Test that allowlist is protected

## Estimated Effort
2 hours