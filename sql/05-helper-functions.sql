-- Database Helper Functions for ClientSync Platform
-- This script creates utility functions for common database operations
-- Run this AFTER creating RLS policies (04-rls-policies.sql)

-- ============================================================================
-- EMAIL ALLOWLIST FUNCTIONS
-- ============================================================================

-- Function to check if email is in allowlist and return details
CREATE OR REPLACE FUNCTION public.check_email_allowlist(email_to_check TEXT)
RETURNS TABLE (
  allowed BOOLEAN,
  tier client_tier,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END as allowed,
    COALESCE(MAX(a.tier), 'standard'::client_tier) as tier,
    COALESCE(BOOL_OR(a.is_active), false) as is_active
  FROM public.allowlist a
  WHERE LOWER(a.email) = LOWER(email_to_check)
    AND a.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add email to allowlist (organizers/admins only)
CREATE OR REPLACE FUNCTION public.add_to_allowlist(
  p_email TEXT,
  p_tier client_tier DEFAULT 'standard'::client_tier
) RETURNS UUID AS $$
DECLARE
  v_allowlist_id UUID;
  v_user_role user_role;
BEGIN
  -- Check if user has permission
  SELECT role INTO v_user_role 
  FROM public.user_profiles 
  WHERE id = auth.uid();
  
  IF v_user_role NOT IN ('organizer', 'admin') THEN
    RAISE EXCEPTION 'Insufficient permissions to add to allowlist';
  END IF;
  
  -- Insert into allowlist
  INSERT INTO public.allowlist (
    email, tier, added_by, is_active
  ) VALUES (
    LOWER(p_email), p_tier, auth.uid(), true
  ) RETURNING id INTO v_allowlist_id;
  
  -- Log the action
  PERFORM public.log_audit_event(
    auth.uid(),
    'allowlist_added',
    'allowlist',
    v_allowlist_id,
    jsonb_build_object('email', p_email, 'tier', p_tier)
  );
  
  RETURN v_allowlist_id;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Email already exists in allowlist';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CLIENT INITIALIZATION FUNCTIONS
-- ============================================================================

-- Function to initialize complete client data during signup
CREATE OR REPLACE FUNCTION public.initialize_client_data(
  p_user_id UUID,
  p_email TEXT,
  p_tier client_tier DEFAULT 'standard'::client_tier
) RETURNS BOOLEAN AS $$
DECLARE
  v_profile_id UUID;
  v_preferences_id UUID;
  v_client_exists BOOLEAN;
BEGIN
  -- Check if client already exists
  SELECT EXISTS(SELECT 1 FROM public.clients WHERE id = p_user_id) INTO v_client_exists;
  
  IF v_client_exists THEN
    RETURN TRUE; -- Already initialized
  END IF;
  
  -- Create empty client profile
  INSERT INTO public.client_profiles (
    first_name, 
    last_name, 
    phone, 
    emergency_contact
  ) VALUES (
    '', 
    '', 
    '', 
    '{
      "name": "",
      "relationship": "",
      "phone": "",
      "email": ""
    }'::jsonb
  ) RETURNING id INTO v_profile_id;
  
  -- Create empty client preferences with proper structure
  INSERT INTO public.client_preferences (
    selected_flight_option_id,
    selected_hotel_option_id,
    selected_activity_ids,
    dietary_restrictions,
    allergies
  ) VALUES (
    NULL,
    NULL,
    '{}',
    '{}',
    '{}'
  ) RETURNING id INTO v_preferences_id;
  
  -- Create or update client record
  INSERT INTO public.clients (
    id, email, tier, profile_id, preferences_id, onboarding_completed
  ) VALUES (
    p_user_id, p_email, p_tier, v_profile_id, v_preferences_id, false
  ) ON CONFLICT (id) DO UPDATE SET
    profile_id = EXCLUDED.profile_id,
    preferences_id = EXCLUDED.preferences_id,
    tier = EXCLUDED.tier;
  
  -- Log the initialization
  PERFORM public.log_audit_event(
    p_user_id,
    'client_data_initialized',
    'clients',
    p_user_id,
    jsonb_build_object('tier', p_tier, 'email', p_email)
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error for debugging
    PERFORM public.log_audit_event(
      p_user_id,
      'client_initialization_failed',
      'clients',
      p_user_id,
      jsonb_build_object('error', SQLERRM, 'email', p_email)
    );
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete client onboarding
CREATE OR REPLACE FUNCTION public.complete_client_onboarding(
  p_client_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_profile_complete BOOLEAN := false;
  v_preferences_set BOOLEAN := false;
BEGIN
  -- Check if profile is sufficiently complete
  SELECT (
    first_name IS NOT NULL AND first_name != '' AND
    last_name IS NOT NULL AND last_name != '' AND
    phone IS NOT NULL AND phone != ''
  ) INTO v_profile_complete
  FROM public.client_profiles cp
  JOIN public.clients c ON c.profile_id = cp.id
  WHERE c.id = p_client_id;
  
  -- Check if preferences are set
  SELECT (
    dietary_restrictions IS NOT NULL OR
    allergies IS NOT NULL OR
    selected_flight_option_id IS NOT NULL
  ) INTO v_preferences_set
  FROM public.client_preferences cp
  JOIN public.clients c ON c.preferences_id = cp.id
  WHERE c.id = p_client_id;
  
  -- Only mark as complete if basic info is provided
  IF v_profile_complete THEN
    UPDATE public.clients 
    SET onboarding_completed = true
    WHERE id = p_client_id;
    
    -- Log the completion
    PERFORM public.log_audit_event(
      p_client_id,
      'onboarding_completed',
      'clients',
      p_client_id,
      jsonb_build_object('profile_complete', v_profile_complete, 'preferences_set', v_preferences_set)
    );
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIP MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to get comprehensive trip summary for a client
CREATE OR REPLACE FUNCTION public.get_client_trip_summary(p_client_id UUID)
RETURNS TABLE (
  total_trips INTEGER,
  planning_trips INTEGER,
  confirmed_trips INTEGER,
  in_progress_trips INTEGER,
  completed_trips INTEGER,
  next_trip_date DATE,
  next_trip_destination TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_trips,
    COUNT(*) FILTER (WHERE status = 'planning')::INTEGER as planning_trips,
    COUNT(*) FILTER (WHERE status = 'confirmed')::INTEGER as confirmed_trips,
    COUNT(*) FILTER (WHERE status = 'in-progress')::INTEGER as in_progress_trips,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_trips,
    MIN(start_date) FILTER (WHERE start_date > CURRENT_DATE) as next_trip_date,
    (SELECT destination FROM public.trips t2 
     WHERE t2.client_id = p_client_id 
       AND t2.start_date > CURRENT_DATE 
     ORDER BY t2.start_date ASC 
     LIMIT 1) as next_trip_destination
  FROM public.trips
  WHERE client_id = p_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new trip with validation
CREATE OR REPLACE FUNCTION public.create_client_trip(
  p_client_id UUID,
  p_name TEXT,
  p_destination TEXT,
  p_start_date DATE,
  p_end_date DATE,
  p_traveler_count INTEGER DEFAULT 1,
  p_notes TEXT DEFAULT ''
) RETURNS UUID AS $$
DECLARE
  v_trip_id UUID;
  v_user_tier client_tier;
BEGIN
  -- Validate dates
  IF p_start_date <= CURRENT_DATE THEN
    RAISE EXCEPTION 'Trip start date must be in the future';
  END IF;
  
  IF p_end_date <= p_start_date THEN
    RAISE EXCEPTION 'Trip end date must be after start date';
  END IF;
  
  -- Get client tier for any tier-specific logic
  SELECT tier INTO v_user_tier
  FROM public.clients
  WHERE id = p_client_id;
  
  -- Create the trip
  INSERT INTO public.trips (
    client_id, name, destination, start_date, end_date, 
    traveler_count, notes, status
  ) VALUES (
    p_client_id, p_name, p_destination, p_start_date, p_end_date,
    p_traveler_count, p_notes, 'planning'::trip_status
  ) RETURNING id INTO v_trip_id;
  
  -- Log the trip creation
  PERFORM public.log_audit_event(
    p_client_id,
    'trip_created',
    'trips',
    v_trip_id,
    jsonb_build_object(
      'destination', p_destination,
      'start_date', p_start_date,
      'end_date', p_end_date,
      'traveler_count', p_traveler_count
    )
  );
  
  RETURN v_trip_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIP OPTIONS MANAGEMENT FUNCTIONS (Organizer Functions)
-- ============================================================================

-- Function to add flight options to a trip (organizers only)
CREATE OR REPLACE FUNCTION public.add_trip_flight_option(
  p_trip_id UUID,
  p_airline TEXT,
  p_flight_number TEXT,
  p_departure_time TIMESTAMPTZ,
  p_arrival_time TIMESTAMPTZ,
  p_price DECIMAL(10,2),
  p_description TEXT DEFAULT ''
) RETURNS UUID AS $$
DECLARE
  v_option_id UUID;
  v_user_role user_role;
BEGIN
  -- Check if user has permission
  SELECT role INTO v_user_role 
  FROM public.user_profiles 
  WHERE id = auth.uid();
  
  IF v_user_role NOT IN ('organizer', 'admin') THEN
    RAISE EXCEPTION 'Insufficient permissions to add flight options';
  END IF;
  
  -- Insert flight option
  INSERT INTO public.trip_flight_options (
    trip_id, airline, flight_number, departure_time, 
    arrival_time, price, description
  ) VALUES (
    p_trip_id, p_airline, p_flight_number, p_departure_time,
    p_arrival_time, p_price, p_description
  ) RETURNING id INTO v_option_id;
  
  -- Log the action
  PERFORM public.log_audit_event(
    auth.uid(),
    'flight_option_added',
    'trip_flight_options',
    v_option_id,
    jsonb_build_object(
      'trip_id', p_trip_id,
      'airline', p_airline,
      'flight_number', p_flight_number,
      'price', p_price
    )
  );
  
  RETURN v_option_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DATA VALIDATION FUNCTIONS
-- ============================================================================

-- Function to validate client tier permissions
CREATE OR REPLACE FUNCTION public.validate_tier_access(
  p_client_tier client_tier,
  p_requested_feature TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  CASE p_requested_feature
    WHEN 'organizer_support' THEN
      RETURN p_client_tier IN ('premium', 'elite');
    WHEN 'priority_booking' THEN
      RETURN p_client_tier IN ('premium', 'elite');
    WHEN 'concierge_service' THEN
      RETURN p_client_tier = 'elite';
    WHEN 'business_flights' THEN
      RETURN p_client_tier IN ('premium', 'elite');
    WHEN 'first_class_flights' THEN
      RETURN p_client_tier = 'elite';
    ELSE
      RETURN TRUE; -- Standard features available to all tiers
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get available flight classes for a client tier
CREATE OR REPLACE FUNCTION public.get_allowed_flight_classes(p_tier client_tier)
RETURNS TEXT[] AS $$
BEGIN
  CASE p_tier
    WHEN 'standard' THEN
      RETURN ARRAY['economy'];
    WHEN 'premium' THEN
      RETURN ARRAY['economy', 'premium_economy', 'business'];
    WHEN 'elite' THEN
      RETURN ARRAY['business', 'first'];
    ELSE
      RETURN ARRAY['economy'];
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Email allowlist functions (available to all authenticated users for signup)
GRANT EXECUTE ON FUNCTION public.check_email_allowlist(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.add_to_allowlist(TEXT, client_tier) TO authenticated;

-- Client initialization functions (available to authenticated users)
GRANT EXECUTE ON FUNCTION public.initialize_client_data(UUID, TEXT, client_tier) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_client_onboarding(UUID) TO authenticated;

-- Trip management functions (available to authenticated users)
GRANT EXECUTE ON FUNCTION public.get_client_trip_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_client_trip(UUID, TEXT, TEXT, DATE, DATE, INTEGER, TEXT) TO authenticated;

-- Organizer functions (available to authenticated users, but internally validated)
GRANT EXECUTE ON FUNCTION public.add_trip_flight_option(UUID, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, DECIMAL, TEXT) TO authenticated;

-- Validation functions (available to all authenticated users)
GRANT EXECUTE ON FUNCTION public.validate_tier_access(client_tier, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_allowed_flight_classes(client_tier) TO authenticated;

-- ============================================================================
-- FUNCTION DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION public.check_email_allowlist(TEXT) IS 
  'Checks if an email address is in the allowlist and returns approval status and tier';

COMMENT ON FUNCTION public.initialize_client_data(UUID, TEXT, client_tier) IS 
  'Creates initial client profile and preferences during user signup';

COMMENT ON FUNCTION public.complete_client_onboarding(UUID) IS 
  'Marks client onboarding as complete if required information is provided';

COMMENT ON FUNCTION public.get_client_trip_summary(UUID) IS 
  'Returns comprehensive trip statistics for a specific client';

COMMENT ON FUNCTION public.create_client_trip(UUID, TEXT, TEXT, DATE, DATE, INTEGER, TEXT) IS 
  'Creates a new trip with validation for dates and client permissions';

COMMENT ON FUNCTION public.validate_tier_access(client_tier, TEXT) IS 
  'Validates if a client tier has access to a specific feature';

COMMENT ON FUNCTION public.get_allowed_flight_classes(client_tier) IS 
  'Returns array of flight classes available to a specific client tier';