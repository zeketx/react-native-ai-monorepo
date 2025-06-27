-- Row Level Security (RLS) Policies for ClientSync Platform
-- This script enables RLS and creates comprehensive security policies
-- Run this AFTER creating the database schema (01, 02, 03)

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_flight_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_hotel_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_activity_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

-- Users can view and update their own profile
CREATE POLICY "users_own_profile_select" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_own_profile_update" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Organizers and admins can view all user profiles
CREATE POLICY "organizers_view_all_profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('organizer', 'admin')
    )
  );

-- ============================================================================
-- CLIENTS TABLE POLICIES
-- ============================================================================

-- Clients can view and update their own client record
CREATE POLICY "clients_own_data_select" ON public.clients
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "clients_own_data_update" ON public.clients
  FOR UPDATE USING (auth.uid() = id);

-- Organizers and admins can view and manage all clients
CREATE POLICY "organizers_view_all_clients" ON public.clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );

CREATE POLICY "organizers_update_all_clients" ON public.clients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );

-- ============================================================================
-- CLIENT PROFILES POLICIES
-- ============================================================================

-- Clients can view and update their own profile
CREATE POLICY "clients_own_profile_select" ON public.client_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.profile_id = client_profiles.id
      AND clients.id = auth.uid()
    )
  );

CREATE POLICY "clients_own_profile_update" ON public.client_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.profile_id = client_profiles.id
      AND clients.id = auth.uid()
    )
  );

-- Organizers can view and update all client profiles
CREATE POLICY "organizers_all_profiles_select" ON public.client_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );

CREATE POLICY "organizers_all_profiles_update" ON public.client_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );

-- ============================================================================
-- CLIENT PREFERENCES POLICIES
-- ============================================================================

-- Clients can view and update their own preferences
CREATE POLICY "clients_own_preferences_select" ON public.client_preferences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.preferences_id = client_preferences.id
      AND clients.id = auth.uid()
    )
  );

CREATE POLICY "clients_own_preferences_update" ON public.client_preferences
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.preferences_id = client_preferences.id
      AND clients.id = auth.uid()
    )
  );

-- Organizers can view and update all client preferences
CREATE POLICY "organizers_all_preferences_select" ON public.client_preferences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );

CREATE POLICY "organizers_all_preferences_update" ON public.client_preferences
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );

-- ============================================================================
-- TRIPS POLICIES
-- ============================================================================

-- Clients can view and manage their own trips
CREATE POLICY "clients_own_trips_select" ON public.trips
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "clients_own_trips_update" ON public.trips
  FOR UPDATE USING (client_id = auth.uid());

CREATE POLICY "clients_own_trips_insert" ON public.trips
  FOR INSERT WITH CHECK (client_id = auth.uid());

-- Organizers can view and manage all trips
CREATE POLICY "organizers_all_trips_select" ON public.trips
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );

CREATE POLICY "organizers_all_trips_manage" ON public.trips
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );

-- ============================================================================
-- TRIP OPTIONS POLICIES (Flight, Hotel, Activity)
-- ============================================================================

-- Clients can view trip options for their own trips
CREATE POLICY "clients_own_trip_flight_options" ON public.trip_flight_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_flight_options.trip_id
      AND trips.client_id = auth.uid()
    )
  );

CREATE POLICY "clients_own_trip_hotel_options" ON public.trip_hotel_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_hotel_options.trip_id
      AND trips.client_id = auth.uid()
    )
  );

CREATE POLICY "clients_own_trip_activity_options" ON public.trip_activity_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_activity_options.trip_id
      AND trips.client_id = auth.uid()
    )
  );

-- Organizers can manage all trip options
CREATE POLICY "organizers_all_flight_options" ON public.trip_flight_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );

CREATE POLICY "organizers_all_hotel_options" ON public.trip_hotel_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );

CREATE POLICY "organizers_all_activity_options" ON public.trip_activity_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );

-- ============================================================================
-- ALLOWLIST POLICIES (Organizers and Admins Only)
-- ============================================================================

-- Only organizers and admins can manage the allowlist
CREATE POLICY "organizers_manage_allowlist" ON public.allowlist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );

-- ============================================================================
-- AUDIT LOGS POLICIES (Admins Only)
-- ============================================================================

-- Only admins can view audit logs
CREATE POLICY "admins_view_audit_logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- All authenticated users can insert audit logs (for logging their own actions)
CREATE POLICY "authenticated_insert_audit_logs" ON public.audit_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- ADDITIONAL UTILITY POLICIES
-- ============================================================================

-- Allow clients to insert their own profiles during onboarding
CREATE POLICY "clients_insert_own_profile" ON public.client_profiles
  FOR INSERT WITH CHECK (
    -- This will be used during the onboarding process
    -- The application should ensure the profile_id is properly linked
    true  -- We'll handle this through application logic
  );

CREATE POLICY "clients_insert_own_preferences" ON public.client_preferences
  FOR INSERT WITH CHECK (
    -- Similar to profiles, this is for onboarding
    true  -- We'll handle this through application logic
  );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "users_own_profile_select" ON public.user_profiles IS 
  'Users can view their own profile information';

COMMENT ON POLICY "organizers_view_all_clients" ON public.clients IS 
  'Organizers and admins can view all client data for trip management';

COMMENT ON POLICY "clients_own_trips_select" ON public.trips IS 
  'Clients can only view trips they own';

COMMENT ON POLICY "organizers_manage_allowlist" ON public.allowlist IS 
  'Only organizers and admins can manage the email allowlist';

COMMENT ON POLICY "admins_view_audit_logs" ON public.audit_logs IS 
  'Only admins can view audit logs for security monitoring';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- These queries can be used to verify RLS is working correctly
-- (Run these manually to test policies)

/*
-- Test queries (run manually for verification):

-- 1. Check RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'user_profiles', 'clients', 'client_profiles', 
    'client_preferences', 'trips', 'allowlist', 'audit_logs'
  );

-- 2. List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public';

-- 3. Test as client (should only see own data)
-- SET ROLE client_user; -- Would need to create test users first
-- SELECT * FROM public.clients; -- Should only show current user's data

-- 4. Test as organizer (should see all client data)
-- SET ROLE organizer_user;
-- SELECT * FROM public.clients; -- Should show all clients

*/